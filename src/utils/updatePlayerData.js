import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

export async function updatePlayerData(roomId, playerId, updates) {
  const ref = doc(db, "rooms", roomId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const data = snap.data()
  const updatedPlayers = (data.players || []).map((p) =>
    p.id === playerId ? { ...p, ...updates } : p
  )

  await updateDoc(ref, { players: updatedPlayers })
}
