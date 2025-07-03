// components/TimerAdjustButtons.jsx
import { useCallback } from "react";

const adjustments = [
  { label: "10s", seconds: 10 },
  { label: "1m", seconds: 60 },
  { label: "5m", seconds: 300 },
  { label: "10m", seconds: 600 },
];

export default function TimerAdjustButtons({ timer, onUpdate }) {
  const handleAdjust = useCallback(
    (delta) => {
      if (!timer || typeof timer.timeLeft !== "number" || isNaN(timer.timeLeft)) return;
      const newTime = Math.max(0, timer.timeLeft + delta);
      onUpdate({ timeLeft: newTime });
    },
    [timer, onUpdate]
  );

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {adjustments.map((item) => (
        <button
          key={item.label}
          className="btn-outline px-3 py-1 rounded-md text-sm"
          onClick={(e) => {
            e.preventDefault();
            handleAdjust(item.seconds);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            handleAdjust(-item.seconds);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
