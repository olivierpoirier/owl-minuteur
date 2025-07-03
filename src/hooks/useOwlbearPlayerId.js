import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";

export default function useOwlbearPlayerId() {
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    OBR.onReady(async () => {
      try {
        const id = OBR.player.id;
        setPlayerId(id);
      } catch (err) {
        console.error("Erreur récupération player ID :", err);
      }
    });
  }, []);

  return playerId;
}
