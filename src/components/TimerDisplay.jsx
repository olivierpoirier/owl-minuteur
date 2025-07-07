import { useState } from "react"
import { updatePlayerData } from "../utils/updatePlayerData" // adapte selon ton chemin
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function TimerDisplay({ timer, onUpdate, currentPlayerData, roomId }) {
  const [showSettings, setShowSettings] = useState(false)
  const [selectedSound, setSelectedSound] = useState(currentPlayerData?.timerSound || "son1")
  const [customColor, setCustomColor] = useState(currentPlayerData?.timerColor || "")

  const handleSave = async () => {
    await updatePlayerData(roomId, currentPlayerData.id, {
      timerSound: selectedSound,
      timerColor: customColor || null,
    })
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const effectiveColor = customColor || currentPlayerData?.color || "var(--color-text)"

  return (
    <motion.div
      className="flex flex-col rounded-xl shadow p-6 items-center justify-center gap-4 mt-8 w-full bg-[var(--color-bg)] group relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ boxShadow: `0 0 12px ${effectiveColor}` }}
      onMouseEnter={() => setShowSettings(true)}
      onMouseLeave={() => setShowSettings(false)}
    >
      <div className="text-4xl font-bold" style={{ color: effectiveColor }}>
        {formatTime(timer?.timeLeft)}
      </div>

      <TimerControls timer={timer} onUpdate={onUpdate} />
      <TimerAdjustButtons timer={timer} onUpdate={onUpdate} />

      {/* 🎛️ Section des paramètres au survol */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 right-0 mt-2 mr-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 z-50 shadow-lg w-[220px]"
        >
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">🔊 Son d'alarme</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
            >
              <option value="son1">Son 1</option>
              <option value="son2">Son 2</option>
              <option value="son3">Son 3</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">🎨 Couleur du texte</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-10 h-8 rounded border"
                value={customColor || currentPlayerData?.color || "#ffffff"}
                onChange={(e) => setCustomColor(e.target.value)}
              />
              <button
                onClick={() => setCustomColor("")}
                className="text-xs text-blue-600 underline hover:text-blue-800"
                type="button"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 text-sm"
          >
            Sauvegarder
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
