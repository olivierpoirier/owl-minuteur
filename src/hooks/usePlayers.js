import { useEffect, useState, useRef } from "react";
import {
  doc,
  onSnapshot,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";
import { waitUntilReady } from "../utils/obrHelpers";

export default function usePlayers(roomId) {
  const [players, setPlayers] = useState([]);
  const intervalRef = useRef(null);
  const playersRef = useRef([]);

  useEffect(() => {
    if (!roomId) return;

    const INACTIVITY_THRESHOLD = 5 * 60 * 1000;
    const roomRef = doc(db, "rooms", roomId);

    const syncPlayers = async () => {
      try {
        console.count("🌀 syncPlayers called");

        await waitUntilReady(); // Attend que OBR soit prêt

        const sceneMeta = await OBR.scene.getMetadata();
        console.log("🎬 Scene metadata:", sceneMeta);

        const currentPlayers = await OBR.party.getPlayers();
        if (!Array.isArray(currentPlayers)) return;

        console.log("👥 OBR Players:", currentPlayers);

        const roomSnap = await getDoc(roomRef);
        const data = roomSnap.exists() ? roomSnap.data() : {};

        if (!roomSnap.exists()) {
          console.warn("📁 La room n'existe pas encore dans Firestore. Elle va être créée.");
        }

        const savedPlayers = Array.isArray(data.players) ? data.players : [];
        const savedMap = Object.fromEntries(savedPlayers.map(p => [p.id, p]));
        const now = Date.now();
        const updatedPlayers = { ...savedMap };

        // Marquer tous comme inactifs par défaut
        Object.keys(updatedPlayers).forEach(id => {
          updatedPlayers[id].status = "inactive";
        });

        // Mettre à jour ou ajouter les joueurs actifs
        currentPlayers.forEach(p => {
          updatedPlayers[p.id] = {
            ...updatedPlayers[p.id],
            id: p.id,
            name: p.name,
            color: p.color,
            role: p.role,
            status: "active",
            lastSeen: now,
          };
        });

        const updatedArray = Object.values(updatedPlayers);

        // Groupes : attendre que les joueurs soient ajoutés au waitingGroup si nouveau
        const waitingGroup = new Set(data.waitingGroup || []);
        const playingGroup = new Set(data.playingGroup || []);
        const inactiveGroup = new Set(data.inactiveGroup || []);

        currentPlayers.forEach(p => {
          if (
            !waitingGroup.has(p.id) &&
            !playingGroup.has(p.id) &&
            !inactiveGroup.has(p.id)
          ) {
            console.log(`🆕 Nouveau joueur ajouté au waitingGroup: ${p.name} (${p.id})`);
            waitingGroup.add(p.id);
          }
        });

        const newData = {
          players: updatedArray,
          waitingGroup: Array.from(waitingGroup),
          playingGroup: Array.from(playingGroup),
          inactiveGroup: Array.from(inactiveGroup),
        };

        console.log("📦 Données finales à écrire dans Firestore:", newData);

        if (!roomSnap.exists()) {
          await setDoc(roomRef, newData);
        } else {
          await updateDoc(roomRef, newData);
        }

      } catch (err) {
        console.error("❌ syncPlayers error:", err);
      }
    };

    const checkInactivity = async () => {
      const now = Date.now();
      const current = playersRef.current;

      const newPlayers = current.map((p) =>
        p.lastSeen && now - p.lastSeen > INACTIVITY_THRESHOLD && p.status === "active"
          ? { ...p, status: "inactive" }
          : p
      );

      if (JSON.stringify(newPlayers) !== JSON.stringify(current)) {
        console.log("⏳ Inactivité détectée, mise à jour des statuts:", newPlayers);
        await updateDoc(roomRef, { players: newPlayers });
      }
    };

    const startInactivityCheck = () => {
      intervalRef.current = setInterval(checkInactivity, 30_000); // Toutes les 30 secondes
    };

    const unsub = onSnapshot(roomRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      console.log("📡 Snapshot live reçu:", data);
      setPlayers(data.players || []);
      playersRef.current = data.players || [];
    });

    const init = async () => {
      console.log("🚀 Initialisation de usePlayers avec roomId:", roomId);
      await syncPlayers();
      OBR.party.onChange(syncPlayers);
      startInactivityCheck();
    };

    init();

    return () => {
      clearInterval(intervalRef.current);
      unsub();
    };
  }, [roomId]);

  return players;
}
