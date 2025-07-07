import { useEffect, useState, useRef, useMemo } from "react";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers";

export default function useTimerLive(roomId) {
  const [timer, setTimer] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [allPlayerIds, setAllPlayerIds] = useState([]);
  const [displayTimeLeft, setDisplayTimeLeft] = useState(null);
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

  // 🎯 Calcule du temps restant
  useEffect(() => {
    if (!timer?.isRunning) {
      setDisplayTimeLeft(timer?.timeLeft ?? null);
      return;
    }

    const getElapsed = () => {
      const now = Date.now();
      const last = timer.lastUpdated?.toMillis?.();
      if (!last) return 0;
      return Math.floor((now - last) / 1000);
    };

    const tick = () => {
      const elapsed = getElapsed();
      const newTime = Math.max(0, timer.timeLeft - elapsed);

      if (isLeader) {
        const ref = doc(db, "rooms", roomId);

        if (newTime <= 0) {
          updateDoc(ref, {
            "timer.timeLeft": 0,
            "timer.isRunning": false,
            "timer.lastUpdated": serverTimestamp(),
          });
        } else {
          updateDoc(ref, {
            "timer.timeLeft": newTime,
            "timer.lastUpdated": serverTimestamp(),
          });
        }
      }

      setDisplayTimeLeft(newTime);
    };

    tick(); // immédiat
    intervalRef.current = setInterval(tick, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timer?.isRunning, isLeader, timer?.timeLeft, timer?.lastUpdated, roomId]);

  // 🛠️ Fonction de mise à jour manuelle
  const updateTimer = async (fields) => {
    if (!roomId || !timer) return;

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
    displayTimeLeft,
    updateTimer,
    isLeader,
    playerId,
    allPlayerIds,
  };
}
