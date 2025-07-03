import { useEffect, useState } from "react";
import usePlayerData from "../hooks/usePlayerData";
import { updatePlayerData } from "../utils/updatePlayerData";

export default function PlayerCustomizer({ roomId }) {
  const { playerId, data } = usePlayerData(roomId);
  const [color, setColor] = useState("#00ffff");
  const [bg, setBg] = useState("#001f1f");
  const [text, setText] = useState("#ffffff");

  console.log("playerId", playerId);
  console.log("playerId data", data);
  console.log("color", color);
  console.log("bg", bg);
  console.log("text", text);
  

  useEffect(() => {
    if (data) {
      setColor(data.color || "#00ffff");
      setBg(data.backgroundColor || "#001f1f");
      setText(data.textColor || "#ffffff");
    }
  }, [data]);


  const handleSave = async () => {
    await updatePlayerData(roomId, playerId, {
      color,
      backgroundColor: bg,
      textColor: text,
    });
  };

  if (!playerId) return <p>Chargement…</p>;

  return (
    <div className="space-y-4 p-4 border rounded-md bg-[var(--color-bg)]">
      <div>
        <label>Couleur principale :</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      <div>
        <label>Fond :</label>
        <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
      </div>
      <div>
        <label>Texte :</label>
        <input type="color" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <button className="btn-green" onClick={handleSave}>
        Enregistrer mes couleurs
      </button>
    </div>
  );
}
