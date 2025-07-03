import { useEffect, useState, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function usePlayers(roomId) {
  const [players, setPlayers] = useState([]);
  const intervalRef = useRef(null);
  const playersRef = useRef([]);
  const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    const syncPlayers = async () => {
      try {
        const currentPlayers = await OBR.party.getPlayers(); // ✅ Utiliser .party au lieu de .players

        const roomSnap = await getDoc(roomRef);
        const data = roomSnap.exists() ? roomSnap.data() : {};
        const savedPlayers = data.players || [];

        const savedMap = Object.fromEntries(
          savedPlayers
            .filter((p) => p && typeof p.id === "string")
            .map((p) => [p.id, p])
        );

        const now = Date.now();

        const updatedPlayers = { ...savedMap };
        for (const id in updatedPlayers) {
          updatedPlayers[id].status = "inactive";
        }

        currentPlayers.forEach((p) => {
          updatedPlayers[p.id] = {
            id: p.id,
            name: p.name,
            color: p.color,
            role: p.role,
            status: "active",
            lastSeen: now,
          };
        });

        const updatedArray = Object.values(updatedPlayers);

        await updateDoc(roomRef, { players: updatedArray }).catch(async (err) => {
          if (err.code === "not-found") {
            await setDoc(roomRef, { players: updatedArray });
          }
        });
      } catch (err) {
        console.error("Erreur dans syncPlayers :", err);
      }
    };

    let unsubscribeOBR = null;

    OBR.onReady(() => {
      syncPlayers();
      unsubscribeOBR = OBR.party.onChange(syncPlayers); // ✅ .party.onChange
    });

    const unsubSnapshot = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPlayers(data.players || []);
        playersRef.current = data.players || [];
      }
    });

    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const current = playersRef.current;

      const inactivePlayers = current.map((p) => {
        const isInactive = p.lastSeen && now - p.lastSeen > INACTIVITY_THRESHOLD;
        return isInactive && p.status === "active"
          ? { ...p, status: "inactive" }
          : p;
      });

      const hasChanges = JSON.stringify(current) !== JSON.stringify(inactivePlayers);

      if (hasChanges) {
        await updateDoc(roomRef, { players: inactivePlayers });
      }
    }, 30 * 1000);

    return () => {
      unsubSnapshot();
      clearInterval(intervalRef.current);
      if (unsubscribeOBR) unsubscribeOBR();
    };
  }, [INACTIVITY_THRESHOLD, roomId]);

  return players;
}
