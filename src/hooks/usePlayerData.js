import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers";

export default function usePlayerData(roomId) {
  const [playerId, setPlayerId] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let unsub = null;

    const init = async () => {
      try {
        if (!roomId) return;

        await waitUntilReady();
        const id = await OBR.player.id;
        setPlayerId(id);

        const ref = doc(db, "rooms", roomId, "players", id);
        unsub = onSnapshot(ref, (snap) => {
          setData(snap.exists() ? snap.data() : null);
        });
      } catch (err) {
        console.error("❌ usePlayerData:", err);
      }
    };

    init();

    return () => {
      if (unsub) unsub();
    };
  }, [roomId]);

  return { playerId, data };
}
