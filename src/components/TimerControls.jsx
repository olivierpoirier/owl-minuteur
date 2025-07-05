// components/TimerControls.jsx
import { Play, Pause, RotateCcw } from "lucide-react";

export default function TimerControls({ timer, onUpdate, currentPlayerData }) {
  const handleStart = () => {
    onUpdate({ isRunning: true });
  };

  const handlePause = () => {
    onUpdate({ isRunning: false });
  };

  const handleReset = () => {
    onUpdate({ timeLeft: 0, isRunning: false });
  };

  return (
    <div className="flex gap-4">
      {timer.isRunning ? (
        <button
          onClick={handlePause}
          aria-label="Pause timer"
        >
          <Pause className="w-5 h-5" />
        </button>
      ) : (
        <button
          style={{
          color: currentPlayerData?.textColorTimer || "[var(--color-text)]",
          }}
          onClick={handleStart}
          aria-label="Start timer"
        >
          <Play className="w-5 h-5" />
        </button>
      )}

      <button
        style={{
          color: currentPlayerData?.textColorTimer || "[var(--color-text)]",
        }}
        onClick={handleReset}
        aria-label="Reset timer"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  );
}
