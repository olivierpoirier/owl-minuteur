import { useEffect, useState, useRef, useMemo } from "react";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers";

export default function useTimerLive(roomId) {
  const [timer, setTimer] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [allPlayerIds, setAllPlayerIds] = useState([]);
  const intervalRef = useRef(null);

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

  // 📡 Listen Firestore timer
  useEffect(() => {
    if (!roomId) return;
    const ref = doc(db, "rooms", roomId);

    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      const t = data.timer;
      if (!t) return;

      setTimer(t);
    });

    return () => unsub();
  }, [roomId]);

  // ⏱️ Timer loop
  useEffect(() => {
    if (!timer?.isRunning) return;

    const ref = doc(db, "rooms", roomId);

    const startLoop = () => {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (!prev) return prev;
          const newTime = Math.max(0, prev.timeLeft - 1);

          // Si leader, sync vers Firestore
          if (isLeader) {
            updateDoc(ref, {
              "timer.timeLeft": newTime,
              "timer.lastUpdated": serverTimestamp(),
              ...(newTime === 0 && { "timer.isRunning": false }),
            });
          }

          // Mise à jour locale
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
  }, [timer?.isRunning, isLeader, roomId]);

  // 🔄 Fonction manuelle
  const updateTimer = async (fields) => {
    if (!roomId || !timer) return;

    const next = {
      timeLeft: fields.timeLeft ?? timer.timeLeft,
      isRunning: fields.isRunning ?? timer.isRunning,
    };

    const noChange = next.timeLeft === timer.timeLeft && next.isRunning === timer.isRunning;
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
