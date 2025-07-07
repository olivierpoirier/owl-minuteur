import { useEffect, useState, useRef } from "react";
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers";

export default function usePlayers(roomId) {
  const [players, setPlayers] = useState([]);

  const intervalRef = useRef(null);
  const playersRef = useRef([]);
  const currentPlayerIdRef = useRef(null);
  const lastPlayerDataRef = useRef({});

  useEffect(() => {
    if (!roomId) return;

    const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    const roomRef = doc(db, "rooms", roomId);

    const registerPlayer = async () => {
      try {
        await waitUntilReady();

        const playerId = await OBR.player.getId();
        const playerName = (await OBR.player.getName()) ?? "Joueur inconnu";
        const playerColor = (await OBR.player.getColor()) ?? "#cccccc";
        const playerRole = (await OBR.player.getRole()) ?? "player";

        currentPlayerIdRef.current = playerId;
        lastPlayerDataRef.current = { name: playerName, color: playerColor, role: playerRole };

        const partyPlayers = await OBR.party.getPlayers();
        const connectedIds = new Set([...partyPlayers.map((p) => p.id), playerId]);

        console.log("📡 Joueurs connectés dans OBR:", [...connectedIds]);

        const roomSnap = await getDoc(roomRef);
        const data = roomSnap.exists() ? roomSnap.data() : {};
        const savedPlayers = Array.isArray(data.players) ? data.players : [];
        const now = Date.now();

        const updatedPlayersMap = Object.fromEntries(
          savedPlayers.map((p) => [p.id, { ...p }])
        );

        // 🛑 Met à jour tous les joueurs existants comme inactifs sauf s'ils sont connectés
        for (const id of Object.keys(updatedPlayersMap)) {
          if (!connectedIds.has(id)) {
            updatedPlayersMap[id].status = "inactive";
          }
        }

        // ✅ Met à jour ou ajoute le joueur courant
        updatedPlayersMap[playerId] = {
          ...updatedPlayersMap[playerId],
          id: playerId,
          name: playerName,
          color: playerColor,
          role: playerRole,
          status: "active",
          lastSeen: now,
          timerSound: updatedPlayersMap[playerId]?.timerSound || "son1",
          timerColor: updatedPlayersMap[playerId]?.timerColor ?? null,
        };

        // 🎲 Groupes
        const waitingGroup = new Set(data.waitingGroup || []);
        const playingGroup = new Set(data.playingGroup || []);
        const inactiveGroup = new Set(data.inactiveGroup || []);

        if (
          !waitingGroup.has(playerId) &&
          !playingGroup.has(playerId) &&
          !inactiveGroup.has(playerId)
        ) {
          console.log(`🆕 Nouveau joueur ajouté au waitingGroup: ${playerName}`);
          waitingGroup.add(playerId);
        }

        const newData = {
          players: Object.values(updatedPlayersMap),
          waitingGroup: Array.from(waitingGroup),
          playingGroup: Array.from(playingGroup),
          inactiveGroup: Array.from(inactiveGroup),
        };

        if (!roomSnap.exists()) {
          await setDoc(roomRef, newData);
        } else {
          await updateDoc(roomRef, newData);
        }
      } catch (err) {
        console.error("❌ registerPlayer error:", err.message, err);
      }
    };

    const checkInactivity = async () => {
      const now = Date.now();
      const current = playersRef.current;
      const myId = currentPlayerIdRef.current;

      const newPlayers = current.map((p) => {
        if (p.id !== myId) return p;

        const isInactive = now - (p.lastSeen ?? 0) > INACTIVITY_THRESHOLD;

        return {
          ...p,
          lastSeen: now,
          status: isInactive ? "inactive" : "active",
        };
      });

      const playersChanged = JSON.stringify(newPlayers) !== JSON.stringify(current);

      if (playersChanged) {
        console.log("⏳ Mise à jour d'inactivité:", newPlayers);
        await updateDoc(roomRef, { players: newPlayers });
      }
    };

    const startInactivityCheck = () => {
      intervalRef.current = setInterval(checkInactivity, 30_000); // toutes les 30s
    };

    const unsub = onSnapshot(roomRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      setPlayers(data.players || []);
      playersRef.current = data.players || [];
    });

    const init = async () => {
      console.log("🚀 Initialisation de usePlayers avec roomId:", roomId);
      await registerPlayer();
      startInactivityCheck();

      // 👂 Sync quand les données OBR changent
      OBR.player.onChange(async (player) => {
        const last = lastPlayerDataRef.current;
        if (
          player.name !== last.name ||
          player.color !== last.color ||
          player.role !== last.role
        ) {
          console.log("🔁 Changement détecté dans les infos du joueur, re-sync");
          await registerPlayer();
        }
      });
    };

    init();

    return () => {
      clearInterval(intervalRef.current);
      unsub();
    };
  }, [roomId]);

  return players;
}
