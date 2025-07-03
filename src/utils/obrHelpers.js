// utils/obrHelpers.js
import OBR from "@owlbear-rodeo/sdk";

/**
 * Attendre que OBR soit prêt, peu importe si on appelle après ou avant l'initialisation
 */
export function waitUntilReady() {
  if (OBR.isReady) return Promise.resolve();
  return new Promise((resolve) => {
    OBR.onReady(resolve);
  });
}
