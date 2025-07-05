import useRoomGroups from "../hooks/useRoomGroups";
import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function PlayersSection({ players, roomId, currentPlayerData }) {
  const { groups, updateGroups } = useRoomGroups(roomId);

  if (!currentPlayerData) return null;

  return (
    <div className="flex flex-col p-6 w-full">
      <PlayersDisplay
        players={players}
        groups={groups}
        onUpdateGroups={updateGroups}
        currentPlayerData={currentPlayerData}
        roomId={roomId}
      />
    </div>
  );
}

function PlayersDisplay({ players, groups, onUpdateGroups, currentPlayerData, roomId }) {
  const [draggedId, setDraggedId] = useState(null);
  const [removingPlayerId, setRemovingPlayerId] = useState(null); // pour l’animation

  const getPlayerById = (id) => players.find((p) => p.id === id);

  const handleDrop = (groupKey) => {
    if (!draggedId) return;
    const newGroups = {
      playingGroup: groups.playingGroup.filter((id) => id !== draggedId),
      waitingGroup: groups.waitingGroup.filter((id) => id !== draggedId),
      inactiveGroup: groups.inactiveGroup.filter((id) => id !== draggedId),
    };
    newGroups[groupKey].push(draggedId);
    onUpdateGroups(newGroups);
    setDraggedId(null);
  };

  const removePlayerFromRoom = async (playerIdToRemove) => {
    if (!roomId || !playerIdToRemove) return;

    try {
      setRemovingPlayerId(playerIdToRemove); // lance l'animation

      const ref = doc(db, "rooms", roomId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      const updatedPlayers = (data.players || []).filter((p) => p.id !== playerIdToRemove);
      const newGroups = {
        waitingGroup: (data.waitingGroup || []).filter((id) => id !== playerIdToRemove),
        playingGroup: (data.playingGroup || []).filter((id) => id !== playerIdToRemove),
        inactiveGroup: (data.inactiveGroup || []).filter((id) => id !== playerIdToRemove),
      };

      await updateDoc(ref, {
        players: updatedPlayers,
        ...newGroups,
      });

      console.log(`🗑️ Joueur ${playerIdToRemove} supprimé`);
    } catch (err) {
      console.error("❌ Erreur de suppression:", err);
    } finally {
      setTimeout(() => setRemovingPlayerId(null), 300); // attend fin anim
    }
  };

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
        <AnimatePresence>
          {ids.map((id) => {
            const player = getPlayerById(id);
            if (!player || id === removingPlayerId) return null;

            const isCurrentUser = player.id === currentPlayerData.id;

            return (
              <motion.div
                key={id}
                className="flex items-center gap-4 p-2 m-4 rounded-lg shadow border-2 border-[var(--color-border)] bg-[var(--color-bg)]"
                style={{
                  borderColor: player.color || "transparent",
                }}
                draggable
                onDragStart={() => setDraggedId(id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              >
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: player.color }}
                />
                <div className="flex-1">
                  <p className="font-medium">
                    {player.name}{" "}
                    {isCurrentUser && (
                      <span className="text-xs text-yellow-400">(vous)</span>
                    )}
                  </p>
                  <p
                    className={`text-sm ${
                      player.status === "active"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {player.status === "active" ? "Actif" : "Inactif"}
                  </p>
                </div>

                {currentPlayerData.role === "GM" && !isCurrentUser && (
                  <button
                    onClick={() => removePlayerFromRoom(player.id)}
                    className="text-red-500 p-1 hover:text-red-700"
                    title="Supprimer ce joueur"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 mt-4 min-w-full">
      {renderGroup("🎮 En jeu", "playingGroup", groups.playingGroup)}
      {renderGroup("⏳ En attente", "waitingGroup", groups.waitingGroup)}
      {renderGroup("💤 Inactif", "inactiveGroup", groups.inactiveGroup)}
    </div>
  );
}
