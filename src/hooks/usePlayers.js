import { useEffect, useState, useRef } from "react"
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { db } from "../firebase"
import OBR from "@owlbear-rodeo/sdk"
import { waitUntilReady } from "../utils/obrHelpers"

export default function usePlayers(roomId) {
  const [players, setPlayers] = useState([])
  const intervalRef = useRef(null)
  const playersRef = useRef([])
  const currentPlayerIdRef = useRef(null)

  useEffect(() => {
    if (!roomId) return

    const INACTIVITY_THRESHOLD = 5 * 60 * 1000
    const roomRef = doc(db, "rooms", roomId)

    const registerPlayer = async () => {
      try {
        await waitUntilReady()

        const playerId = await OBR.player.id
        const metadata = await OBR.player.getMetadata()

        console.log("METADATA",metadata);
        
        const playerName = metadata.name ?? "Joueur inconnu"
        const playerColor = metadata.color ?? "#cccccc"
        const playerRole = metadata.role ?? "player"

        if (!playerId) throw new Error("playerId est null")

        currentPlayerIdRef.current = playerId

        const roomSnap = await getDoc(roomRef)
        const data = roomSnap.exists() ? roomSnap.data() : {}
        const savedPlayers = Array.isArray(data.players) ? data.players : []
        const now = Date.now()

        const updatedPlayersMap = Object.fromEntries(
          savedPlayers.map((p) => [p.id, p])
        )

        // Marquer tous comme inactifs par défaut
        Object.keys(updatedPlayersMap).forEach((id) => {
          updatedPlayersMap[id].status = "inactive"
        })

        // Ajouter ou mettre à jour CE joueur
        updatedPlayersMap[playerId] = {
          ...updatedPlayersMap[playerId],
          id: playerId,
          name: playerName,
          color: playerColor,
          role: playerRole,
          status: "active",
          lastSeen: now,
        }

        const waitingGroup = new Set(data.waitingGroup || [])
        const playingGroup = new Set(data.playingGroup || [])
        const inactiveGroup = new Set(data.inactiveGroup || [])

        if (
          !waitingGroup.has(playerId) &&
          !playingGroup.has(playerId) &&
          !inactiveGroup.has(playerId)
        ) {
          console.log(`🆕 Nouveau joueur ajouté au waitingGroup: ${playerName}`)
          waitingGroup.add(playerId)
        }

        const newData = {
          players: Object.values(updatedPlayersMap).filter((p) => !!p.id),
          waitingGroup: Array.from(waitingGroup),
          playingGroup: Array.from(playingGroup),
          inactiveGroup: Array.from(inactiveGroup),
        }

        console.log("📦 Mise à jour Firestore (auto-register):", newData)

        if (!roomSnap.exists()) {
          await setDoc(roomRef, newData)
        } else {
          await updateDoc(roomRef, newData)
        }
      } catch (err) {
        console.error("❌ registerPlayer error:", err.message, err)
      }
    }



    const checkInactivity = async () => {
      const now = Date.now()
      const current = playersRef.current
      const myId = currentPlayerIdRef.current

      const newPlayers = current.map((p) =>
        p.id === myId && p.lastSeen && now - p.lastSeen > INACTIVITY_THRESHOLD && p.status === "active"
          ? { ...p, status: "inactive" }
          : p
      )

      if (JSON.stringify(newPlayers) !== JSON.stringify(current)) {
        console.log("⏳ Inactivité détectée, mise à jour de Firestore:", newPlayers)
        await updateDoc(roomRef, { players: newPlayers })
      }
    }

    const startInactivityCheck = () => {
      intervalRef.current = setInterval(checkInactivity, 30_000)
    }

    const unsub = onSnapshot(roomRef, (snap) => {
      const data = snap.exists() ? snap.data() : {}
      setPlayers(data.players || [])
      playersRef.current = data.players || []
    })

    const init = async () => {
      console.log("🚀 Initialisation de usePlayers avec roomId:", roomId)
      await registerPlayer()
      startInactivityCheck()
    }

    init()

    return () => {
      clearInterval(intervalRef.current)
      unsub()
    }
  }, [roomId])

  return players
}
