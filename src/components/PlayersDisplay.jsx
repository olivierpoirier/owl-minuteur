import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function PlayersDisplay({ players, groups, onUpdateGroups, currentUserId }) {
  const [draggedId, setDraggedId] = useState(null);

  const getPlayerById = (id) => players.find((p) => p.id === id);


  
  const handleDrop = (groupKey) => {
    if (!draggedId) return;

    // Supprime l’ID du joueur dans tous les groupes
    const newGroups = {
      playingGroup: groups.playingGroup.filter((id) => id !== draggedId),
      waitingGroup: groups.waitingGroup.filter((id) => id !== draggedId),
      inactiveGroup: groups.inactiveGroup.filter((id) => id !== draggedId),
    };

    // Ajoute le joueur dans le groupe ciblé
    newGroups[groupKey].push(draggedId);
    onUpdateGroups(newGroups);
    setDraggedId(null);
  };

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
          const player = getPlayerById(id);
          if (!player) return null;
          return (
                <motion.div
                key={id}
                className="flex items-center gap-4 p-2 rounded-lg shadow cursor-move border"
                style={{
                    backgroundColor: player.id === currentUserId
                    ? player.backgroundColor || "rgba(255,255,255,0.05)"
                    : "rgba(255,255,255,0.03)",
                    borderColor: player.id === currentUserId
                    ? player.color
                    : "transparent",
                    borderWidth: "2px",
                    color: player.id === currentUserId ? player.textColor || "#fff" : "#aaa",
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
                <p className="font-medium">{player.name}</p>
                <p className={`text-sm ${player.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                  {player.status === "active" ? "Actif" : "Inactif"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4">
      {renderGroup("🎮 En jeu", "playingGroup", groups.playingGroup)}
      {renderGroup("⏳ En attente", "waitingGroup", groups.waitingGroup)}
      {renderGroup("💤 Inactif", "inactiveGroup", groups.inactiveGroup)}
    </div>
  );
}
