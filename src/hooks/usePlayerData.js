// hooks/usePlayerData.js
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // adapte ce chemin si besoin
import OBR from "@owlbear-rodeo/sdk";

export default function usePlayerData(roomId) {
  const [playerId, setPlayerId] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    OBR.onReady(async () => {
      const id = await OBR.player.id;
      setPlayerId(id);
    });
  }, []);

  useEffect(() => {
    if (!roomId || !playerId) return;

    const ref = doc(db, "rooms", roomId, "players", playerId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setData(snap.data());
    });

    return () => unsub();
  }, [roomId, playerId]);

  return { playerId, data };
}
