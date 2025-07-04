import { useState } from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { updatePlayerData } from "../utils/updatePlayerData"

export default function PlayersDisplay({ players, groups, onUpdateGroups, currentUserId }) {
  const [draggedId, setDraggedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState("")

  const getPlayerById = (id) => players.find((p) => p.id === id)

  const handleDrop = (groupKey) => {
    if (!draggedId) return
    const newGroups = {
      playingGroup: groups.playingGroup.filter((id) => id !== draggedId),
      waitingGroup: groups.waitingGroup.filter((id) => id !== draggedId),
      inactiveGroup: groups.inactiveGroup.filter((id) => id !== draggedId),
    }
    newGroups[groupKey].push(draggedId)
    onUpdateGroups(newGroups)
    setDraggedId(null)
  }

  const handleContextMenu = (e, player) => {
    e.preventDefault()
    if (player.id === currentUserId) {
      setEditingId(player.id)
      setEditingName(player.name || "")
    }
  }

  const handleNameChange = (e) => setEditingName(e.target.value)

  const handleNameSave = async (id) => {
    await updatePlayerData(groups.roomId, id, { name: editingName })
    setEditingId(null)
  }

  const renderGroup = (label, groupKey, ids) => (
    <div
      className="p-4 rounded-xl border-2 shadow w-full md:w-1/3"
      style={{
        backgroundColor: "var(--color-bg)",
        borderColor: "var(--color-border)",
        boxShadow: "0 0 12px rgba(0, 255, 255, 0.4)",
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleDrop(groupKey)}
    >
      <h3 className="text-lg font-semibold mb-4">{label}</h3>
      <div className="space-y-2">
        {ids.map((id) => {
          const player = getPlayerById(id)
          if (!player) return null

          const isCurrentUser = player.id === currentUserId

          return (
            <motion.div
              key={id}
              className="flex items-center gap-4 p-2 rounded-lg shadow cursor-move border"
              style={{
                backgroundColor: isCurrentUser
                  ? player.backgroundColor || "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.03)",
                borderColor: isCurrentUser ? player.color : "transparent",
                borderWidth: "2px",
                color: isCurrentUser ? player.textColor || "#fff" : "#aaa",
              }}
              draggable
              onDragStart={() => setDraggedId(id)}
              onContextMenu={(e) => handleContextMenu(e, player)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: player.color }}
              />
              <div className="flex-1">
                {editingId === id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleNameSave(id)
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      className="bg-transparent border-b border-white text-white"
                      value={editingName}
                      onChange={handleNameChange}
                      autoFocus
                    />
                    <button type="submit" className="text-sm">💾</button>
                  </form>
                ) : (
                  <>
                    <p className="font-medium">
                      {player.name} {isCurrentUser && <span className="text-xs text-yellow-400">(vous)</span>}
                    </p>
                    <p className={`text-sm ${player.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                      {player.status === "active" ? "Actif" : "Inactif"}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4">
      {renderGroup("🎮 En jeu", "playingGroup", groups.playingGroup)}
      {renderGroup("⏳ En attente", "waitingGroup", groups.waitingGroup)}
      {renderGroup("💤 Inactif", "inactiveGroup", groups.inactiveGroup)}
    </div>
  )
}
