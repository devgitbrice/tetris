// src/utils/gameHelpers.js
export const STAGE_WIDTH = 12;
export const STAGE_HEIGHT = 20;

export const createStage = () =>
  Array.from(Array(STAGE_HEIGHT), () =>
    new Array(STAGE_WIDTH).fill([0, 'clear'])
  );

export const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // 1. Vérifier qu'on est sur une cellule de la pièce (pas un espace vide '0')
      if (player.tetromino[y][x] !== 0) {
        if (
          // 2. Vérifier qu'on est dans les limites hauteur (y)
          !stage[y + player.pos.y + moveY] ||
          // 3. Vérifier qu'on est dans les limites largeur (x)
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          // 4. Vérifier que la case n'est pas déjà occupée ('clear')
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !==
            'clear'
        ) {
          return true;
        }
      }
    }
  }
  return false;
};