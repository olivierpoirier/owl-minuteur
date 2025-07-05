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
  let roomId = useRoomId();
  const { timer, updateTimer } = useTimerLive(roomId);
  const players = usePlayers(roomId);
  const currentUserId = useOwlbearPlayerId();
  const currentPlayerData = players.find((p) => p.id === currentUserId)


  useEffect(() => {
    if (roomId) {
      console.log("📦 Initialisation de la room :", roomId);
      initializeRoomIfNeeded(roomId);
    }
  }, [roomId]);


  console.log(roomId);
  console.log("CurrentUserData", currentPlayerData);
      console.log("🥷 Players :", players);
  console.log("🥷 currentUserId :", currentUserId);


  
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center text-[var(--color-text)] m-4">
      <TimerDisplay timer={timer} onUpdate={updateTimer} currentPlayerData={currentPlayerData}/>
      <PlayersSection players={players} roomId={roomId} currentPlayerData={currentPlayerData}/>
    </div>
  );
}
