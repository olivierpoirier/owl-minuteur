import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";

export default function usePlayerData(roomId) {
  const [playerId, setPlayerId] = useState(null);
  const [data, setData] = useState(null);

  // 🔍 Récupération de l'ID du joueur connecté à Owlbear
  useEffect(() => {
    OBR.onReady(async () => {
      try {
        const id = await OBR.player.id;
        setPlayerId(id);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération du playerId :", err);
      }
    });
  }, []);

  // 🔁 Écoute des données personnalisées du joueur dans Firestore
  useEffect(() => {
    if (!roomId || !playerId) return;

    const ref = doc(db, "rooms", roomId, "players", playerId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setData(snap.data());
      } else {
        console.warn(`⚠️ Aucun document trouvé pour /rooms/${roomId}/players/${playerId}`);
      }
    });

    return () => unsub();
  }, [roomId, playerId]);

  return { playerId, data };
}
