import { useEffect, useState, useRef } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  setDoc,
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
        const savedPlayers = Array.isArray(data.players) ? data.players : [];

        const savedMap = Object.fromEntries(
          savedPlayers
            .filter(p => typeof p === "object" && p.id)
            .map(p => [p.id, p])
        );

        const now = Date.now();
        const updatedPlayers = { ...savedMap };

        // par défaut, tous inactifs
        for (const id in updatedPlayers) {
          updatedPlayers[id].status = "inactive";
        }

        // override avec joueurs actifs
        currentPlayers.forEach((p) => {
          updatedPlayers[p.id] = {
            ...updatedPlayers[p.id],
            id: p.id,
            name: p.name,
            color: p.color,
            role: p.role,
            status: "active",
            lastSeen: now,
          };
        });

        const updatedArray = Object.values(updatedPlayers);

        if (!roomSnap.exists()) {
          await setDoc(roomRef, { players: updatedArray });
        } else {
          await updateDoc(roomRef, { players: updatedArray });
        }

      } catch (err) {
        console.error("❌ syncPlayers:", err);
      }
    };

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

    const unsub = onSnapshot(roomRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      setPlayers(data.players || []);
      playersRef.current = data.players || [];
    });

    const init = async () => {
      await waitUntilReady();
      await OBR.scene.ready;
      await syncPlayers();
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
