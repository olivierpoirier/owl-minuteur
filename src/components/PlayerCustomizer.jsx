import { useEffect, useState } from "react";
import { updatePlayerData } from "../utils/updatePlayerData";

export default function PlayerCustomizer({ players, roomId, currentPlayerData }) {

  const [color, setColor] = useState("#00ffff");
  const [bg, setBg] = useState("#001f1f");
  const [text, setText] = useState("#ffffff");
  const [bgSections, setBgSections] = useState("#001f1f");
  const [glow, setGlow] = useState("#001f1f");
  const [backgroundColorTimer, setBackgroundColorTimer] = useState("#001f1f");
  const [textColorTimer, setTextColorTimer] = useState("#001f1f");

  const player = players.find((p) => p.id === currentPlayerData.id)

  console.log("playerId", currentPlayerData.id);
  console.log("playerId data", player);
  console.log("color", color);
  console.log("bg", bg);
  console.log("text", text);
  

  useEffect(() => {
    if (player) {
      setColor(player.color || "#00ffff");
      setBg(player.backgroundColor || "#001f1f");
      setText(player.textColor || "#ffffff");
    }
  }, [player]);


  const handleSave = async () => {
    if (!color || !bg || !text) {
      console.warn("⛔ Une couleur est manquante");
      return;
    }

    try {
      await updatePlayerData(roomId, currentPlayerData.id, {
        color,
        backgroundColor: bg,
        textColor: text,
        backgroundColorSections: bgSections,
        glow: glow,
        backgroundColorTimer: backgroundColorTimer,
        textColorTimer: textColorTimer,
      });
    } catch (e) {
      console.error("❌ Erreur dans handleSave PlayerCustomizer:", e)
    }
  }
  if (!currentPlayerData) return <p>Chargement…</p>;

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

      <div>
        <label>Glow :</label>
        <input type="color" value={glow} onChange={(e) => setGlow(e.target.value)} />
      </div>

      <div>
        <label>Fond des sections :</label>
        <input type="color" value={bgSections} onChange={(e) => setBgSections(e.target.value)} />
      </div>


      <div>
        <label>Fond du timer :</label>
        <input type="color" value={backgroundColorTimer} onChange={(e) => setBackgroundColorTimer(e.target.value)} />
      </div>

      <div>
        <label>Texte du timer :</label>
        <input type="color" value={textColorTimer} onChange={(e) => setTextColorTimer(e.target.value)} />
      </div>
      <button className="btn-green" onClick={handleSave}>
        Enregistrer mes couleurs
      </button>
    </div>
  );
}
