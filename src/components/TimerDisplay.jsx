// components/TimerDisplay.jsx
import TimerControls from "./TimerControls";
import TimerAdjustButtons from "./TimerAdjustButtons"; // 👈 nouveau
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function TimerDisplay({ timer, onUpdate }) {
  if (!timer) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className=" rounded-xl shadow p-6 flex flex-col items-center justify-center gap-4 max-w-xs mx-auto mt-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-4xl font-bold text-[var(--color-text)]">
        {formatTime(timer.timeLeft)}
      </div>

      <TimerControls timer={timer} onUpdate={onUpdate} />
      <TimerAdjustButtons timer={timer} onUpdate={onUpdate} /> 
    </motion.div>
  );
}
