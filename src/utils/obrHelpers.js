// utils/obrHelpers.js
import OBR from "@owlbear-rodeo/sdk";

/**
 * Garantit que OBR est prêt, même si on appelle avant que l'extension ait terminé d'initialiser.
 */
export function waitUntilReady() {
  return new Promise((resolve) => {
    if (OBR.isReady) {
      resolve();
    } else {
      OBR.onReady(() => {
        resolve();
      });
    }
  });
}
