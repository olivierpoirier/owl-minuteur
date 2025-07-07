import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers"; // <--- à importer

export default function useOwlbearPlayerId() {
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const getId = async () => {
      try {
        // Vérifie si OBR est disponible dans l'environnement
        if (typeof window.OBR === "undefined") {
          console.warn("⚠️ OBR non disponible, fallback sur playerId = '1'");
          setPlayerId("1");
          return;
        }

        await waitUntilReady();
        const id = await OBR.player.id;
        if (isMounted) setPlayerId(id);
      } catch (err) {
        console.error("❌ useOwlbearPlayerId:", err);
      }
    };

    getId();

    return () => {
      isMounted = false;
    };
  }, []);

  return playerId;
}
