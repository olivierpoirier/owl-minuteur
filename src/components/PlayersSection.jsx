import useRoomGroups from "../hooks/useRoomGroups";
import { useState } from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"


export default function PlayersSection({ players, roomId, currentPlayerData }) {
  const { groups, updateGroups } = useRoomGroups(roomId);


  console.log("🥷 groups :", groups);

  
  if (!currentPlayerData) return null; // ou un petit loader facultatif

  return (
    <div className="flex flex-col p-6 w-full">
      <PlayersDisplay
        players={players}
        groups={groups}
        onUpdateGroups={updateGroups}
        currentPlayerData={currentPlayerData}
      />
    </div>
  );
}


function PlayersDisplay({ players, groups, onUpdateGroups, currentPlayerData }) {
  const [draggedId, setDraggedId] = useState(null)

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

  const renderGroup = (label, groupKey, ids) => (
    <div
      className="flex flex-col p-4 rounded-xl border-2 w-full shadow-md bg-[var(--color-bg)] border-[var(--color-border)]"
      style={{
        boxShadow: `0 0 12px ${currentPlayerData.color || "rgba(0, 255, 255, 0.4)"}`,
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleDrop(groupKey)}
    >
      <h3 className="text-lg font-semibold mb-4">{label}</h3>
      <div className="space-y-2">
        {ids.map((id) => {
          const player = getPlayerById(id)
          if (!player) return null

          const isCurrentUser = player.id === currentPlayerData.id

          return (
            <motion.div
              key={id}
              className="flex items-center gap-4 p-2 m-4 rounded-lg shadow cursor-move border-2 border-[var(--color-border)]"
              style={{
                borderColor: player.color || "transparent",
              }}
              draggable
              onDragStart={() => setDraggedId(id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: player.color }}
              />
              <div className="flex-1">
                <p className="font-medium">
                  {player.name} {isCurrentUser && <span className="text-xs text-yellow-400">(vous)</span>}
                </p>
                <p className={`text-sm ${player.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                  {player.status === "active" ? "Actif" : "Inactif"}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 mt-4 min-w-full">
      {renderGroup("🎮 En jeu", "playingGroup", groups.playingGroup)}
      {renderGroup("⏳ En attente", "waitingGroup", groups.waitingGroup)}
      {renderGroup("💤 Inactif", "inactiveGroup", groups.inactiveGroup)}
    </div>
  )
}
