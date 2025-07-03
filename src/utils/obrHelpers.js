// utils/obrHelpers.js
import OBR from "@owlbear-rodeo/sdk";

/**
 * Utilitaire pour attendre que OBR soit prêt avec syntaxe `await`
 */
export function waitUntilReady() {
  return new Promise((resolve) => {
    OBR.onReady(resolve);
  });
}
