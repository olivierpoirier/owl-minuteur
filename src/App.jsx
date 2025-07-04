// pages/TimerPage.jsx
import useTimerLive from "./hooks/useTimerLive";
import TimerDisplay from "./components/TimerDisplay";
import useRoomId from "./hooks/useRoomId";
import PlayersSection from "./components/PlayersSection";
import { useEffect } from "react";
import { initializeRoomIfNeeded } from "./utils/initializeRoomIfNeeded";
import useOwlbearPlayerId from "./hooks/useOwlbearPlayerId";
import usePlayers from "./hooks/usePlayers";

export default function TimerPage() {
  let roomId = useRoomId() || "1";
  const { timer, updateTimer } = useTimerLive(roomId);
  const players = usePlayers(roomId);
  const currentUserId = useOwlbearPlayerId() || "8329829839098329832";
  const currentPlayerData = players.find((p) => p.id === currentUserId)


  useEffect(() => {
    if (roomId) {
      console.log("📦 Initialisation de la room :", roomId);
      initializeRoomIfNeeded(roomId);
    }
  }, [roomId]);


  console.log(roomId);
  console.log("CurrentUserData", currentPlayerData);
  
  if (!currentPlayerData) return null;  
  
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)]">
      <TimerDisplay timer={timer} onUpdate={updateTimer} currentPlayerData={currentPlayerData}/>
      <PlayersSection players={players} roomId={roomId} currentPlayerData={currentPlayerData}/>
    </div>
  );
}
