// ✅ useTimerLive.js
import { useEffect, useState, useRef, useMemo } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers";

export default function useTimerLive(roomId) {
  const [timer, setTimer] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [allPlayerIds, setAllPlayerIds] = useState([]);
  const intervalRef = useRef(null);
  const lastSync = useRef(Date.now());
  const isLeader = useMemo(() => {
    return playerId && allPlayerIds.length > 0 && playerId === allPlayerIds[0];
  }, [playerId, allPlayerIds]);

  console.log("PlayerId",playerId);
  console.log("PLAYERS", allPlayerIds);


  
  
  useEffect(() => {
    console.log("📡 Players connected:", allPlayerIds);
    console.log("🎖️ I am leader:", isLeader);
  }, [allPlayerIds, isLeader]);

  // 🔁 Initialiser playerId + rôle
  useEffect(() => {
    const init = async () => {
      await waitUntilReady();
      const id = await OBR.player.getId();
      setPlayerId(id);

      // 🔄 Écouter les autres joueurs pour élire un leader
      OBR.party.onChange((players) => {
        const ids = players.map((p) => p.id).sort(); // Triés pour désigner un leader
        setAllPlayerIds(ids);
      });

      const players = await OBR.party.getPlayers();
        console.log("OWLBÉEAR PLAYERS", players);
      setAllPlayerIds(players.map((p) => p.id).sort());
    };

    init();
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const ref = doc(db, "rooms", roomId);

    const stopLocalTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startLocalTimer = () => {
      if (intervalRef.current) return;

      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (!prev || typeof prev.timeLeft !== "number") return prev;
          const newTime = prev.timeLeft - 1;

          if (Date.now() - lastSync.current >= 1000 && newTime > 0) {
            updateDoc(ref, {
              "timer.timeLeft": newTime,
              "timer.lastUpdated": serverTimestamp(),
            });
            lastSync.current = Date.now();
          }

          if (newTime <= 0) {
            stopLocalTimer();
            updateDoc(ref, {
              "timer.timeLeft": 0,
              "timer.isRunning": false,
              "timer.lastUpdated": serverTimestamp(),
            });
            return { ...prev, timeLeft: 0, isRunning: false };
          }

          return { ...prev, timeLeft: newTime };
        });
      }, 1000);
    };

    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      const t = data.timer;
      if (!t) return;

      setTimer(t);

      // ✅ Seul le leader fait tourner le timer
      if (t.isRunning && isLeader) {
        startLocalTimer();
      } else {
        stopLocalTimer();
      }
    });

    return () => {
      unsub();
      stopLocalTimer();
    };
  }, [roomId, isLeader]);

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
  };
}
