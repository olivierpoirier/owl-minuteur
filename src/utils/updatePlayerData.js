// utils/updatePlayerData.js
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * @param {string} roomId - ID de la room
 * @param {string} playerId - ID du joueur (OBR)
 * @param {object} data - Données à enregistrer
 */
export async function updatePlayerData(roomId, playerId, data) {
  if (!roomId || !playerId || !data) throw new Error("Arguments manquants");

  const ref = doc(db, "rooms", roomId, "players", playerId);
  await setDoc(ref, data, { merge: true }); // merge pour éviter d’écraser tout
}
