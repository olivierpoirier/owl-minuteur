import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers";

export default function useRoomId() {
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const fetchRoomId = async () => {
      try {
        await waitUntilReady();
        const id = await OBR.room.id;
        setRoomId(id);
      } catch (err) {
        console.error("❌ useRoomId:", err);
      }
    };

    fetchRoomId();
  }, []);

  return roomId;
}
