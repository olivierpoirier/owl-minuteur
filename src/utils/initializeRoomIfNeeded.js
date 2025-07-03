// utils/initializeRoom.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function initializeRoomIfNeeded(roomId) {
  if (!roomId) return;

  const ref = doc(db, "rooms", roomId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // 👇 Données par défaut si la room est totalement nouvelle
    await setDoc(ref, {
      timer: {
        isRunning: false,
        timeLeft: 300, // 5 minutes
        lastUpdated: null,
      },
      playingGroup: [],
      waitingGroup: [],
      inactiveGroup: [],
      players: []
    });
  } else {
    // 👇 Room existe, mais on vérifie si le timer est absent
    const data = snap.data();
    if (!data.timer) {
      await setDoc(
        ref,
        {
          timer: {
            isRunning: false,
            timeLeft: 300,
            lastUpdated: null,
          },
        },
        { merge: true } // on fusionne avec le reste
      );
    }
  }
}
