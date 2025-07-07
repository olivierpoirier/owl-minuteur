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
  const lastPlayerDataRef = useRef({}) // 🆕 pour stocker le dernier état local

  useEffect(() => {
    if (!roomId) return

    const INACTIVITY_THRESHOLD = 5 * 60 * 1000
    const roomRef = doc(db, "rooms", roomId)

    const registerPlayer = async () => {
      try {
        await waitUntilReady()

        await OBR.onReady(

          
        )

        const playerId = await OBR.player.getId()
        const playerName = await OBR.player.getName() ?? "Joueur inconnu"
        const playerColor = await OBR.player.getColor() ?? "#cccccc"
        const playerRole = await OBR.player.getRole() ?? "player"

        currentPlayerIdRef.current = playerId
        lastPlayerDataRef.current = { name: playerName, color: playerColor, role: playerRole } // 🆕

        const partyPlayers = await OBR.party.getPlayers()
        const sortedIds = partyPlayers.map((p) => p.id).sort()
        console.log("📡 Joueurs connectés dans OBR:", sortedIds)

        const roomSnap = await getDoc(roomRef)
        const data = roomSnap.exists() ? roomSnap.data() : {}
        const savedPlayers = Array.isArray(data.players) ? data.players : []
        const now = Date.now()

        const updatedPlayersMap = Object.fromEntries(
          savedPlayers.map((p) => [p.id, p])
        )

        const connectedIds = new Set(partyPlayers.map((p) => p.id))

        Object.keys(updatedPlayersMap).forEach((id) => {
          if (!connectedIds.has(id)) {
            updatedPlayersMap[id].status = "inactive"
          }
        })

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

      // 🔁 Écouter les changements de propriétés du joueur
      OBR.player.onChange(async (player) => {
        const last = lastPlayerDataRef.current
        if (
          player.name !== last.name ||
          player.color !== last.color ||
          player.role !== last.role
        ) {
          console.log("🔁 Changement détecté dans les infos du joueur, re-sync")
          await registerPlayer()
        }
      })
    }

    init()

    return () => {
      clearInterval(intervalRef.current)
      unsub()
    }
  }, [roomId])

  return players
}
