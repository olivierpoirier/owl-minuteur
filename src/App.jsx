// pages/TimerPage.jsx
import useTimerLive from "./hooks/useTimerLive";
import TimerDisplay from "./components/TimerDisplay";
import useRoomId from "./hooks/useRoomId";
import PlayersSection from "./components/PlayersSection";

export default function TimerPage() {
  let roomId = useRoomId();
  const { timer, updateTimer } = useTimerLive(roomId);

  console.log(roomId);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)]">
      <TimerDisplay timer={timer} onUpdate={updateTimer} />
      <PlayersSection roomId={roomId}/>
    </div>
  );
}
