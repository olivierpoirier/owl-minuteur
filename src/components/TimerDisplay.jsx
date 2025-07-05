// components/TimerDisplay.jsx
import TimerControls from "./TimerControls";
import TimerAdjustButtons from "./TimerAdjustButtons"; // 👈 nouveau
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function TimerDisplay({ timer, onUpdate, currentPlayerData }) {
  if (!timer) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="flex flex-col rounded-xl shadow p-6  items-center justify-center gap-4 mt-8 w-full bg-[var(--color-bg)]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        boxShadow: `0 0 12px ${currentPlayerData?.color || "rgba(0, 255, 255, 0.4)"}`,
      }}
    >
      <div  className="text-4xl font-bold text-[var(--color-text)]">
        {formatTime(timer?.timeLeft)}
      </div>

      <TimerControls timer={timer} onUpdate={onUpdate} currentPlayerData={currentPlayerData} />
      <TimerAdjustButtons timer={timer} onUpdate={onUpdate}/> 
    </motion.div>
  );
}
