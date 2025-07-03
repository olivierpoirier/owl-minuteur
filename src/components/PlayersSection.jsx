import useOwlbearPlayerId from "../hooks/useOwlbearPlayerId";
import usePlayers from "../hooks/usePlayers";
import useRoomGroups from "../hooks/useRoomGroups";
import PlayerCustomizer from "./PlayerCustomizer";
import PlayersDisplay from "./PlayersDisplay";

export default function PlayersSection({ roomId }) {
  const players = usePlayers(roomId);
  const { groups, updateGroups } = useRoomGroups(roomId);
  const currentUserId = useOwlbearPlayerId();

  if (!currentUserId) return null; // ou un petit loader facultatif

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Joueurs</h2>
      <PlayersDisplay
        players={players}
        groups={groups}
        onUpdateGroups={updateGroups}
        currentUserId={currentUserId} 
      />
      <PlayerCustomizer roomId={roomId}/>
    </div>
  );
}
