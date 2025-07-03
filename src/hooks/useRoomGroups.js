import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function useRoomGroups(roomId) {
  const [groups, setGroups] = useState({
    playingGroup: [],
    waitingGroup: [],
    inactiveGroup: [],
  });

  useEffect(() => {
    if (!roomId) return;

    const ref = doc(db, "rooms", roomId);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      setGroups({
        playingGroup: data.playingGroup || [],
        waitingGroup: data.waitingGroup || [],
        inactiveGroup: data.inactiveGroup || [],
      });
    });

    return () => unsub();
  }, [roomId]);

  const updateGroups = async (newGroups) => {
    const ref = doc(db, "rooms", roomId);
    await updateDoc(ref, {
      playingGroup: newGroups.playingGroup,
      waitingGroup: newGroups.waitingGroup,
      inactiveGroup: newGroups.inactiveGroup,
    });
  };

  return { groups, updateGroups };
}
