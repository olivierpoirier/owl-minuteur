// pages/TimerPage.jsx
import useTimerLive from "./hooks/useTimerLive";
import TimerDisplay from "./components/TimerDisplay";
import useRoomId from "./hooks/useRoomId";
import PlayersSection from "./components/PlayersSection";
import { useEffect } from "react";
import { initializeRoomIfNeeded } from "./utils/initializeRoomIfNeeded";
import useOwlbearPlayerId from "./hooks/useOwlbearPlayerId";
import usePlayers from "./hooks/usePlayers";
import OBR from "@owlbear-rodeo/sdk";

export default function TimerPage() {
  let roomId = useRoomId();

  const players = usePlayers(roomId);
  const currentUserId = useOwlbearPlayerId();
  const currentPlayerData = players.find((p) => p.id === currentUserId)
  const { timer, updateTimer } = useTimerLive(roomId, players, currentUserId);


  useEffect(() => {
    if (roomId) {
      console.log("📦 Initialisation de la room :", roomId);
      initializeRoomIfNeeded(roomId);
    }
  }, [roomId]);


  useEffect(() => {
    try {
      OBR.onReady(() => {
        const partyPlayers = OBR.party.getPlayers()
        console.log("☕ PLAYERS", partyPlayers);
        
      });
    } catch (error) {
      console.error("Erreur OBR Ready :", error);
    }
  }, []);
  
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
