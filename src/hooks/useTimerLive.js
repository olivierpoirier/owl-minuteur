import { useEffect, useState, useRef } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import OBR from "@owlbear-rodeo/sdk";

export default function useTimerLive(roomId) {
  const [timer, setTimer] = useState(null);
  const [isGM, setIsGM] = useState(false);
  const intervalRef = useRef(null);
  const lastSync = useRef(Date.now());
  const isOwnerRef = useRef(false);

  // 🔎 On récupère si l'utilisateur est un GM
  useEffect(() => {
    OBR.onReady(async () => {
      const role = await OBR.player.getRole();
      setIsGM(role === "GM");
    });
  }, []);

useEffect(() => {
  if (!roomId || typeof roomId !== "string") return;

  const ref = doc(db, "rooms", roomId);
  
  const startLocalTimer = () => {
    stopLocalTimer();
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (!prev) return null;
        const newTime = prev.timeLeft - 1;


        if (Date.now() - lastSync.current >= 1000 && newTime > 0) {
          updateDoc(ref, {
            "timer.timeLeft": Math.max(newTime, 0),
            "timer.lastUpdated": serverTimestamp(),
          });
          lastSync.current = Date.now();
        }

        if (newTime <= 0) {
          stopLocalTimer();
          updateDoc(ref, {
            "timer.timeLeft": 0,
            "timer.isRunning": false,
            "timer.lastUpdated": serverTimestamp(),
          });
          return { ...prev, timeLeft: 0, isRunning: false };
        }

        return { ...prev, timeLeft: Math.max(newTime, 0) };
      });
    }, 1000);
  };
  
  const unsub = onSnapshot(ref, async (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    
    setTimer(data.timer);
    /*
    const myId = await OBR.player.id;
    isOwnerRef.current = data.timerOwnerId === myId;
    */
   
    if (data.timer.isRunning) {
      startLocalTimer(data.timer.timeLeft);
    } else {
      stopLocalTimer();
    }
    

  });

  return () => {
    unsub();
    stopLocalTimer();
  };
}, [roomId, isGM]);


  const stopLocalTimer = () => {
    const interval = intervalRef.current;
    if (interval) clearInterval(interval);
    intervalRef.current = null;
  };

  /*
  // 🔒 Seul un GM peut mettre à jour le timer
  const updateTimer = async (fields) => {
    
    if (!isGM) {
      console.warn("⛔ Seuls les GM peuvent contrôler le timer");
      return;
    }
    
    const ref = doc(db, "rooms", roomId);
    //const myId = await OBR.player.id;
    console.log("REF",ref);
    console.log("FILED", fields);
    
    
    await updateDoc(ref, {
      timer: {
        ...fields,
        lastUpdated: serverTimestamp(),
      },
    });
  };
*/

  const updateTimer = async (fields) => {
    if (!roomId) return;
    if (timer.timeLeft <= 0 && fields.isRunning) return;
    if (fields.timeLeft >= 3600) fields.timeLeft = 3600;
    if (timer.timeLeft === fields.timeLeft) return;

    const ref = doc(db, "rooms", roomId);
  
    // Transforme { isRunning: true, timeLeft: 123 } en { "timer.isRunning": true, "timer.timeLeft": 123 }
    const dotNotatedFields = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [`timer.${key}`, value])
    );

    await updateDoc(ref, {
      ...dotNotatedFields,
      "timer.lastUpdated": serverTimestamp(),
    });
  };


  return { timer, updateTimer, isGM };
}
