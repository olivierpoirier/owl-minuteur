import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers";

export default function useRoomId() {
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const fetchRoomId = async () => {
      try {

        // Sinon, attend que l'extension soit prête
        await waitUntilReady();

        // Essaye de récupérer l'ID de la room
        const id = await OBR.room.id;
        setRoomId(id);
      } catch (err) {
        console.error("❌ Erreur dans useRoomId :", err);
        setRoomId("1"); // fallback si OBR échoue même en étant défini
      }
    };

    fetchRoomId();
  }, []);

  return roomId;
}
