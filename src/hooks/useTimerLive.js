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

  // 🧠 Le leader est le joueur avec l'ID trié le plus bas
  const isLeader = useMemo(() => {
    return playerId && allPlayerIds.length > 0 && playerId === allPlayerIds[0];
  }, [playerId, allPlayerIds]);

  // 🔁 Initialisation des joueurs
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

  // 📡 Écoute des changements Firestore
  useEffect(() => {
    if (!roomId) return;

    const ref = doc(db, "rooms", roomId);

    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      const t = data.timer;
      if (!t) return;

      setTimer(t);
      lastSync.current = Date.now(); // pour forcer le recalcul local
    });

    return () => unsub();
  }, [roomId]);

  // ⏱️ Timer local synchronisé
  useEffect(() => {
    if (!timer || !timer.isRunning) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    const ref = doc(db, "rooms", roomId);

    const getTimeLeftFromServer = () => {
      const now = Date.now();
      const lastUpdated = timer.lastUpdated?.toMillis?.();

      if (!lastUpdated) return timer.timeLeft;

      const elapsed = Math.floor((now - lastUpdated) / 1000);
      return Math.max(0, timer.timeLeft - elapsed);
    };

    const updateLoop = () => {
      const newTime = getTimeLeftFromServer();

      setTimer((prev) => {
        if (!prev) return prev;

        return { ...prev, timeLeft: newTime };
      });

      if (isLeader) {
        if (newTime <= 0) {
          updateDoc(ref, {
            "timer.timeLeft": 0,
            "timer.isRunning": false,
            "timer.lastUpdated": serverTimestamp(),
          });
          clearInterval(intervalRef.current);
        } else if (Date.now() - lastSync.current >= 1000) {
          updateDoc(ref, {
            "timer.timeLeft": newTime,
            "timer.lastUpdated": serverTimestamp(),
          });
          lastSync.current = Date.now();
        }
      }
    };

    updateLoop(); // première exécution immédiate
    intervalRef.current = setInterval(updateLoop, 1000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [timer, isLeader, roomId]);

  // 🔄 Mise à jour manuelle du timer
  const updateTimer = async (fields) => {
    if (!roomId || !timer) return;

    const next = {
      timeLeft: fields.timeLeft ?? timer.timeLeft,
      isRunning: fields.isRunning ?? timer.isRunning,
    };

    const noChange =
      next.timeLeft === timer.timeLeft && next.isRunning === timer.isRunning;
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
