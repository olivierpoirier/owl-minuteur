# 🦉 Owlbear Minuteur ⏱️  
### 🇫🇷 Minuteur collaboratif pour Owlbear Rodeo  
### 🇬🇧 Collaborative timer for Owlbear Rodeo  

---
<img width="1102" height="810" alt="image" src="https://github.com/user-attachments/assets/b2d69fff-fe8d-470a-9e3c-49b49c52c985" />

## 🇫🇷 Présentation

**Owlbear Minuteur** est une extension personnalisée pour [Owlbear Rodeo](https://www.owlbear.rodeo), conçue pour offrir un **minuteur interactif et partagé entre tous les joueurs** d'une même salle.  
Chaque joueur peut voir le décompte, ajuster ses préférences personnelles (couleur, son d'alarme) et contrôler le décompte global.

Cet app sert à faire un système de tour par tour pour les joueurs de votre partie.

---

## 🇬🇧 Overview

**Owlbear Minuteur** is a custom extension for [Owlbear Rodeo](https://www.owlbear.rodeo), built to provide a **shared, collaborative timer** for all players in the same room.  
Each player can view the countdown, personalize their experience (text color, alarm sound) and controlling the global countdown.

This app helps you keep track of player turns during your game.

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


## 🧪 Intégration Owlbear / Owlbear Integration

### 🇫🇷 Ajouter l’extension sur votre carte Owlbear

1. Ouvrez [Owlbear Rodeo 2.0](https://www.owlbear.rodeo/)
2. Ouvrez une **carte** ou créez-en une nouvelle
3. Cliquez sur l’icône **Puzzle** en bas à gauche (Extensions)
4. Cliquez sur le + **Add Custom Extension** en haut à droite
5. Collez l’URL suivante : https://owl-timer.vercel.app/manifest.json
6. Cliquez sur **Ajouter**
7. L’application **Owlbear Minuteur** apparaîtra dans vos extensions disponibles

> ⚠️ Si vous testez en local, vous pouvez utiliser `http://localhost:5173/manifest.json`

---

### 🇬🇧 Add the extension to your Owlbear map

1. Go to [Owlbear Rodeo 2.0](https://www.owlbear.rodeo/)
2. Open a **scene** or create a new one
3. Click the **Puzzle icon** at the bottom left (Extensions)
4. Click on the + **Add Custom Extension** on the upper right
5. Paste the following URL: https://owl-timer.vercel.app/manifest.json
6. Click **Add**
7. The **Owlbear Timer** app will now be available in your extension panel

> ⚠️ If you're testing locally, you can use `http://localhost:5173/manifest.json`

---

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

