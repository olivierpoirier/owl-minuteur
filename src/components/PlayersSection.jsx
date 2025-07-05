import useRoomGroups from "../hooks/useRoomGroups";
import PlayersDisplay from "./PlayersDisplay";

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
        roomId={roomId}
      />
    </div>
  );
}
