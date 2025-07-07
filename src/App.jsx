// pages/TimerPage.jsx
import useTimerLive from "./hooks/useTimerLive";
import TimerDisplay from "./components/TimerDisplay";
import useRoomId from "./hooks/useRoomId";
import PlayersSection from "./components/PlayersSection";
import { useEffect, useState } from "react";
import { initializeRoomIfNeeded } from "./utils/initializeRoomIfNeeded";
import useOwlbearPlayerId from "./hooks/useOwlbearPlayerId";
import usePlayers from "./hooks/usePlayers";
import OBR from "@owlbear-rodeo/sdk";
import { use } from "framer-motion/m";
import { waitUntilReady } from "./utils/obrHelpers";

export default function TimerPage() {
  let roomId = useRoomId();

  const players = usePlayers(roomId);
  const currentUserId = useOwlbearPlayerId();
  const currentPlayerData = players.find((p) => p.id === currentUserId)
  const { timer, updateTimer } = useTimerLive(roomId, players, currentUserId);
  const [playersTest, setPlayersTest] = useState([]);



    useEffect(() => {
    OBR.onReady(async () => {
      const id = await OBR.player.getId();
      const players = await OBR.party.getPlayers();
      console.log("✅ player ID:", id);
      console.log("🎮 Party players:", players);
    });
  }, []);
  useEffect(() => {
    if (roomId) {
      console.log("📦 Initialisation de la room :", roomId);
      initializeRoomIfNeeded(roomId);
    }
  }, [roomId]);



  useEffect(() => {
      console.log("📦 PLAYERS : ", playersTest);
    
  }, [playersTest]);

  OBR.onReady(async () => {
    const partyPlayers = await OBR.party.getPlayers();
    console.log("☕ PLAYERS", partyPlayers);
  });


  useEffect(() => {
    waitUntilReady().then(() => {
      console.log("✅ OBR prêt !");
    });
  }, []);

    useEffect(() => {
    let unsubscribe = null;

    const fetchPlayers = async () => {
      try {
        OBR.onReady(async () => {
          // ✅ Récupérer les joueurs au chargement initial
          const initial = await OBR.party.getPlayers();
          setPlayersTest(initial);
          console.log("🎮 Joueurs initiaux :", initial);

          // 🔄 Écouter les changements en temps réel
          unsubscribe = OBR.party.onChange((updatedPlayers) => {
            setPlayersTest(updatedPlayers);
            console.log("🔄 Joueurs mis à jour :", updatedPlayers);
          });
        });
      } catch (error) {
        console.error("❌ Erreur dans usePlayers (OBR):", error);
      }
    };

    fetchPlayers();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [roomId]);


  use

  /*
  console.log(roomId);
  console.log("CurrentUserData", currentPlayerData);
  console.log("🥷 Players :", players);
  console.log("🥷 currentUserId :", currentUserId);
  */

  
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center text-[var(--color-text)] m-4">
      <TimerDisplay timer={timer} onUpdate={updateTimer} currentPlayerData={currentPlayerData}/>
      <PlayersSection players={players} roomId={roomId} currentPlayerData={currentPlayerData}/>
    </div>
  );
}
