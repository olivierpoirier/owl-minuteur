import { useEffect, useState, useRef, useMemo } from "react";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers";

export default function useTimerLive(roomId, currentUserData) {
  const [timer, setTimer] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [allPlayerIds, setAllPlayerIds] = useState([]);
  const intervalRef = useRef(null);
  const hasPlayedRef = useRef(false); // ✅ empêche de rejouer le son plusieurs fois
  const timeLeft = timer?.timeLeft;

  const isLeader = useMemo(() => {
    return playerId && allPlayerIds.length > 0 && playerId === allPlayerIds[0];
  }, [playerId, allPlayerIds]);

  // 🧠 Init OBR
  useEffect(() => {
    const init = async () => {
      await waitUntilReady();
      const id = await OBR.player.getId();
      setPlayerId(id);

      const self = { id };
      const others = await OBR.party.getPlayers();
      const combined = [...others, self];
      setAllPlayerIds(combined.map((p) => p.id).sort());

      OBR.party.onChange(async (updatedPlayers) => {
        const everyone = [...updatedPlayers, { id }];
        setAllPlayerIds(everyone.map((p) => p.id).sort());
      });
    };

    init();
  }, []);

  // 📡 Écoute Firestore
  useEffect(() => {
    if (!roomId) return;
    const ref = doc(db, "rooms", roomId);

    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      const t = data.timer;
      if (!t) return;
      setTimer(t); // Affichage uniquement, pas de décrémentation
    });

    return () => unsub();
  }, [roomId]);

  // ⏱️ Timer loop – leader uniquement
  useEffect(() => {
    if (!isLeader || !timer?.isRunning) return;

    const ref = doc(db, "rooms", roomId);

    const startLoop = () => {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (!prev) return prev;

          const newTime = Math.max(0, prev.timeLeft - 1);

          // Sync Firestore
          updateDoc(ref, {
            "timer.timeLeft": newTime,
            "timer.lastUpdated": serverTimestamp(),
            ...(newTime === 0 && { "timer.isRunning": false }),
          });

          return {
            ...prev,
            timeLeft: newTime,
            ...(newTime === 0 ? { isRunning: false } : {}),
          };
        });
      }, 1000);
    };

    startLoop();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLeader, timer?.isRunning, roomId]);


  // 🔊 Lecture du son quand timeLeft atteint 0
  useEffect(() => {
    if (timeLeft !== 0 || hasPlayedRef.current) return;

    hasPlayedRef.current = true;
    const soundKey = currentUserData?.timerSound || "son1";
    const soundUrl = {
      son1: "/sounds/son1.mp3",
      son2: "/sounds/son2.mp3",
      son3: "/sounds/son3.mp3",
    }[soundKey];

    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.play().catch((e) => console.warn("🔇 Erreur lecture son:", e));
    }
  }, [timeLeft, currentUserData?.timerSound]);


  // 🛠 Reset la permission de rejouer le son quand on redémarre
  useEffect(() => {
    if (timer?.timeLeft > 0) {
      hasPlayedRef.current = false;
    }
  }, [timer?.timeLeft]);

  // 🔄 Fonction de mise à jour
  const updateTimer = async (fields) => {
    if (!roomId || !timer) return;

    const next = {
      timeLeft: fields.timeLeft ?? timer.timeLeft,
      isRunning: fields.isRunning ?? timer.isRunning,
    };

    const noChange =
      next.timeLeft === timer.timeLeft &&
      next.isRunning === timer.isRunning;

    if (noChange) return;

    const ref = doc(db, "rooms", roomId);
    const dotFields = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [`timer.${k}`, v])
    );

    await updateDoc(ref, {
      ...dotFields,
      "timer.lastUpdated": serverTimestamp(),
    });
  };

  return {
    timer,
    updateTimer,
    isLeader,
    playerId,
    allPlayerIds,
  };
}
