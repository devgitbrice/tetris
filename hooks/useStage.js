import { useState, useEffect } from 'react';
import { createStage } from '../utils/gameHelpers';

export const useStage = (player, resetPlayer) => {
  const [stage, setStage] = useState(createStage());
  const [rowsCleared, setRowsCleared] = useState(0);

  useEffect(() => {
    setRowsCleared(0);

    const sweepRows = (newStage) =>
      newStage.reduce((ack, row) => {
        // Si aucune case vide (0) n'est trouvée dans la ligne -> ligne pleine
        if (row.findIndex((cell) => cell[0] === 0) === -1) {
          setRowsCleared((prev) => prev + 1);
          // Ajoute une nouvelle ligne vide en haut et pousse les autres vers le bas
          ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
          return ack;
        }
        ack.push(row);
        return ack;
      }, []);

    const updateStage = (prevStage) => {
      // 1. Nettoyer le stage de l'affichage précédent du joueur
      const newStage = prevStage.map((row) =>
        row.map((cell) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      );

      // 2. Dessiner la pièce du joueur
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            // --- CORRECTION CRITIQUE ICI ---
            // On vérifie que la ligne (y) et la colonne (x) cibles existent bien
            // avant d'essayer d'écrire dedans pour éviter le crash.
            if (
              newStage[y + player.pos.y] &&
              newStage[y + player.pos.y][x + player.pos.x]
            ) {
              newStage[y + player.pos.y][x + player.pos.x] = [
                value,
                `${player.collided ? 'merged' : 'clear'}`,
              ];
            }
          }
        });
      });

      // 3. Vérifier les collisions
      if (player.collided) {
        resetPlayer();
        return sweepRows(newStage);
      }

      return newStage;
    };

    setStage((prev) => updateStage(prev));
  }, [player, resetPlayer]);

  return [stage, setStage, rowsCleared];
};