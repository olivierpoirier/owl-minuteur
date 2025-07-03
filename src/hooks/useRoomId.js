import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";

export default function useRoomId() {
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const fetchRoomId = async () => {
      try {
        await OBR.onReady();
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
