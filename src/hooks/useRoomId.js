import { useEffect, useState } from "react"
import OBR from "@owlbear-rodeo/sdk"

export default function useRoomId() {
  const [roomId, setRoomId] = useState(null)

  useEffect(() => {
    const getRoomId = async () => {
      try {
        const id = await OBR.room.id
        setRoomId(id)
      } catch (err) {
        console.error("Erreur lors de la récupération de l'ID de la salle :", err)
      }
    }

    // S'assure que l'extension est bien initialisée
    OBR.onReady(getRoomId)
  }, [])

  return roomId
}
