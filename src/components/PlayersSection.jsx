import useRoomGroups from "../hooks/useRoomGroups";
import PlayersDisplay from "./PlayersDisplay";

export default function PlayersSection({ players, roomId, currentPlayerData }) {
  const { groups, updateGroups } = useRoomGroups(roomId);

  console.log("🥷 Players :", players);
  console.log("🥷 groups :", groups);
  console.log("🥷 currentUserId :", currentPlayerData.id);
  
  if (!currentPlayerData) return null; // ou un petit loader facultatif

  return (
    <div className="flex flex-col p-6 w-11/12">
      <h2 className="text-2xl font-bold mb-4">Joueurs</h2>
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
