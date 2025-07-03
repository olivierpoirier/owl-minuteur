import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";

export default function useOwlbearPlayerId() {
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const getId = async () => {
      try {
        await OBR.onReady();
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
