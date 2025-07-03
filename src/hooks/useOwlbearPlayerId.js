import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";

export default function useOwlbearPlayerId() {
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    OBR.onReady(async () => {
      try {
        const id = await OBR.player.id; // ✅ ATTENDRE LA PROMESSE
        setPlayerId(id);
      } catch (err) {
        console.error("Erreur récupération player ID :", err);
      }
    });
  }, []);

  return playerId;
}
