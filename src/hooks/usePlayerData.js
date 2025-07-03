import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";

export default function usePlayerData(roomId) {
  const [playerId, setPlayerId] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const getId = async () => {
      try {
        await OBR.onReady();
        const id = await OBR.player.id;
        setPlayerId(id);
      } catch (err) {
        console.error("❌ usePlayerData:", err);
      }
    };

    getId();
  }, []);

  useEffect(() => {
    if (!roomId || !playerId) return;

    const ref = doc(db, "rooms", roomId, "players", playerId);
    const unsub = onSnapshot(ref, (snap) => {
      setData(snap.exists() ? snap.data() : null);
    });

    return () => unsub();
  }, [roomId, playerId]);

  return { playerId, data };
}
