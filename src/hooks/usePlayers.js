import { useEffect, useState, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function usePlayers(roomId) {
  const [players, setPlayers] = useState([]);
  const intervalRef = useRef(null);
  const playersRef = useRef([]);
  const INACTIVITY_THRESHOLD = 5 * 60 * 1000;

  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    const syncPlayers = async () => {
      try {
        const currentPlayers = await OBR.party.getPlayers();
        console.log("👥 Players détectés par OBR:", currentPlayers);

        const roomSnap = await getDoc(roomRef);
        const data = roomSnap.exists() ? roomSnap.data() : {};

        const savedPlayers = data.players || [];
        const playingGroup = data.playingGroup || [];
        const waitingGroup = data.waitingGroup || [];
        const inactiveGroup = data.inactiveGroup || [];

        const savedMap = Object.fromEntries(
          savedPlayers
            .filter((p) => p && typeof p.id === "string")
            .map((p) => [p.id, p])
        );

        const now = Date.now();
        const updatedPlayers = { ...savedMap };

        // Marquer tout le monde comme inactif par défaut
        for (const id in updatedPlayers) {
          updatedPlayers[id].status = "inactive";
        }

        // Mise à jour ou ajout des joueurs actifs
        currentPlayers.forEach((p) => {
          updatedPlayers[p.id] = {
            id: p.id,
            name: p.name,
            color: p.color,
            role: p.role,
            status: "active",
            lastSeen: now,
          };
        });

        const updatedArray = Object.values(updatedPlayers);

        // Ajouter les nouveaux joueurs dans waitingGroup
        const newWaitingGroup = [...waitingGroup];
        currentPlayers.forEach((p) => {
          const alreadyInGroup =
            playingGroup.includes(p.id) ||
            waitingGroup.includes(p.id) ||
            inactiveGroup.includes(p.id);
          if (!alreadyInGroup) {
            newWaitingGroup.push(p.id);
          }
        });

        const payload = {
          players: updatedArray,
          waitingGroup: newWaitingGroup,
          playingGroup,
          inactiveGroup,
        };

        console.log("🔥 Mise à jour Firestore :", payload);

        try {
          await updateDoc(roomRef, payload);
        } catch (err) {
          if (err.code === "not-found") {
            await setDoc(roomRef, payload);
          } else {
            console.error("❌ Erreur updateDoc :", err);
          }
        }
      } catch (err) {
        console.error("❌ Erreur dans syncPlayers :", err);
      }
    };

    let unsubscribeOBR = null;

    OBR.onReady(() => {
      syncPlayers();
      unsubscribeOBR = OBR.party.onChange(syncPlayers);
    });

    // Écoute en live des données Firestore
    const unsubSnapshot = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPlayers(data.players || []);
        playersRef.current = data.players || [];
      }
    });

    // Détecter les joueurs inactifs toutes les 30 sec
    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const current = playersRef.current;

      const inactivePlayers = current.map((p) => {
        const isInactive = p.lastSeen && now - p.lastSeen > INACTIVITY_THRESHOLD;
        return isInactive && p.status === "active"
          ? { ...p, status: "inactive" }
          : p;
      });

      const hasChanges =
        JSON.stringify(current) !== JSON.stringify(inactivePlayers);

      if (hasChanges) {
        try {
          await updateDoc(roomRef, { players: inactivePlayers });
        } catch (err) {
          console.error("❌ Erreur mise à jour inactifs :", err);
        }
      }
    }, 30 * 1000);

    return () => {
      unsubSnapshot();
      clearInterval(intervalRef.current);
      if (unsubscribeOBR) unsubscribeOBR();
    };
  }, [INACTIVITY_THRESHOLD, roomId]);

  return players;
}
