# 🦉 Owlbear Minuteur ⏱️  
### 🇫🇷 Minuteur collaboratif pour Owlbear Rodeo  
### 🇬🇧 Collaborative timer for Owlbear Rodeo  

---

## 🇫🇷 Présentation

**Owlbear Minuteur** est une extension personnalisée pour [Owlbear Rodeo](https://www.owlbear.rodeo), conçue pour offrir un **minuteur interactif et partagé entre tous les joueurs** d'une même salle.  
Chaque joueur peut voir le décompte, ajuster ses préférences personnelles (couleur, son d'alarme), tandis que le meneur de jeu (GM) contrôle le décompte global.

---

## 🇬🇧 Overview

**Owlbear Minuteur** is a custom extension for [Owlbear Rodeo](https://www.owlbear.rodeo), built to provide a **shared, collaborative timer** for all players in the same room.  
Each player can view the countdown, personalize their experience (text color, alarm sound), while the Game Master (GM) is in charge of controlling the global countdown.

---

## 🧩 Fonctionnalités / Features

| Fonction / Feature | Description |
|--------------------|-------------|
| 🔁 Synchronisation | Le compte à rebours est partagé en temps réel via Firestore |
| 🎮 Joueurs & Groupes | Les joueurs sont enregistrés automatiquement et classés par groupes |
| 🎨 Personnalisation | Couleur du texte et son d’alarme personnalisables |
| 🎛️ Contrôles simples | Démarrer, mettre en pause, réinitialiser, ajuster avec clic droit |
| 🗑️ Gestion des joueurs | Le GM peut retirer des joueurs de la salle |
| 🔊 Alerte sonore | Alerte configurable à 0:00 |
| 🌈 Animations fluides | Grâce à Framer Motion |
| ☁️ Données persistantes | Firestore garde tout en mémoire entre les sessions |

---

## 🚀 Comment utiliser / How to Use

### 🧪 En local (développement)

```bash
npm install
npm run dev
```

## 🧱 Stack Technique / Tech Stack

- ⚛️ **React 19 + Vite**
- 🧠 **Firebase Firestore**
- 💅 **Tailwind CSS**
- 🌀 **Framer Motion**
- 🎧 **HTML5 Audio**
- 🎲 **Owlbear Rodeo SDK v3**

---

## 📸 Captures d’écran / Screenshots

<img width="520" height="738" alt="image" src="https://github.com/user-attachments/assets/656aaa03-ee90-4748-94ce-4ebd1dcee4e3" />

<img width="533" height="748" alt="image" src="https://github.com/user-attachments/assets/3433e161-1780-487b-88d9-f07fa2ae10d4" />

<img width="409" height="627" alt="image" src="https://github.com/user-attachments/assets/08ebc1db-a8c3-458a-94a8-526d614d4ee4" />


---

## ⚙️ Détails Techniques / Technical Details

### 🇫🇷

- 👑 Détection du GM automatique via `player.role === "GM"`
- 🔐 Le GM seul contrôle le vrai décompte dans Firestore
- 💡 Inactivité détectée après 5 minutes (passage automatique dans les inactifs)
- 🎛️ Drag & drop entre les groupes : *En jeu*, *En attente*, *Inactif*
- 📡 Temps synchronisé avec `serverTimestamp()` pour fiabilité
- 🎨 Chaque joueur peut choisir une couleur de texte et un son d'alarme
- 🔁 Synchronisation automatique si nom, couleur ou rôle change

### 🇬🇧

- 👑 Automatic GM detection via `player.role === "GM"`
- 🔐 Only the GM can update the true countdown in Firestore
- 💡 Inactivity is detected after 5 minutes (auto-switch to "Inactive")
- 🎛️ Drag & drop between groups: *Playing*, *Waiting*, *Inactive*
- 📡 Time is synchronized using `serverTimestamp()` for consistency
- 🎨 Each player can choose their own text color and alarm sound
- 🔁 Auto re-sync when name, color, or role changes

