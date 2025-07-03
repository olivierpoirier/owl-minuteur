import { useEffect, useState, useRef } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers";

export default function usePlayers(roomId) {
  const [players, setPlayers] = useState([]);
  const intervalRef = useRef(null);
  const playersRef = useRef([]);

  useEffect(() => {
    if (!roomId) return;

    const INACTIVITY_THRESHOLD = 5 * 60 * 1000;
    const roomRef = doc(db, "rooms", roomId);

    const syncPlayers = async () => {
      try {
        const currentPlayers = await OBR.party.getPlayers();
        const roomSnap = await getDoc(roomRef);
        const data = roomSnap.exists() ? roomSnap.data() : {};
        const savedPlayers = data.players || [];

        const savedMap = Object.fromEntries(
          savedPlayers.map((p) => [p.id, p])
        );

        const now = Date.now();

        for (const id in savedMap) {
          savedMap[id].status = "inactive";
        }

        currentPlayers.forEach((p) => {
          savedMap[p.id] = {
            id: p.id,
            name: p.name,
            color: p.color,
            role: p.role,
            status: "active",
            lastSeen: now,
          };
        });

        const updatedArray = Object.values(savedMap);
        await updateDoc(roomRef, { players: updatedArray });
      } catch (err) {
        console.error("❌ syncPlayers:", err);
      }
    };

    const unsub = onSnapshot(roomRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      setPlayers(data.players || []);
      playersRef.current = data.players || [];
    });

    const startInactivityCheck = () => {
      intervalRef.current = setInterval(async () => {
        const now = Date.now();
        const current = playersRef.current;

        const newPlayers = current.map((p) =>
          p.lastSeen && now - p.lastSeen > INACTIVITY_THRESHOLD && p.status === "active"
            ? { ...p, status: "inactive" }
            : p
        );

        if (JSON.stringify(newPlayers) !== JSON.stringify(current)) {
          await updateDoc(roomRef, { players: newPlayers });
        }
      }, 30000);
    };

    const init = async () => {
      await waitUntilReady();
      await OBR.scene.ready;
      syncPlayers();
      OBR.party.onChange(syncPlayers);
      startInactivityCheck();
    };

    init();

    return () => {
      clearInterval(intervalRef.current);
      unsub();
    };
  }, [roomId]);

  return players;
}
