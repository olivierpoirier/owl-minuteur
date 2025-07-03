// utils/initializeRoom.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Initialise la room dans Firestore si elle n'existe pas encore
 * @param {string} roomId - ID unique de la salle Owlbear
 */
export async function initializeRoomIfNeeded(roomId) {
  if (!roomId || typeof roomId !== "string") {
    console.warn("❌ initializeRoomIfNeeded: roomId invalide", roomId);
    return;
  }

  const ref = doc(db, "rooms", roomId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    console.log("🆕 Création d’une nouvelle room Firestore:", roomId);
    await setDoc(ref, {
      timer: {
        isRunning: false,
        timeLeft: 300,
        lastUpdated: null,
      },
      playingGroup: [],
      waitingGroup: [],
      inactiveGroup: [],
      players: [],
      createdAt: new Date().toISOString(), // bonus : horodatage
    });
  } else {
    const data = snap.data();
    if (!data.timer) {
      console.log("⏱️ Timer manquant : ajout du timer par défaut");
      await setDoc(
        ref,
        {
          timer: {
            isRunning: false,
            timeLeft: 300,
            lastUpdated: null,
          },
        },
        { merge: true }
      );
    }
  }
}
