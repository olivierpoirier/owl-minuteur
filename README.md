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
