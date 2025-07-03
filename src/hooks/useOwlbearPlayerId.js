import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";

export default function useOwlbearPlayerId() {
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    OBR.onReady(async () => {
      try {
        const id = await OBR.player.id;
        if (isMounted) {
          setPlayerId(id);
          console.log("🧠 Owlbear Player ID:", id);
        }
      } catch (err) {
        console.error("❌ Erreur récupération player ID :", err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return playerId;
}
