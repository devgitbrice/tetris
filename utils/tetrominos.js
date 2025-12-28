// src/utils/tetrominos.js
export const TETROMINOS = {
  0: { shape: [[0]], color: 'bg-gray-900' },
  I: { shape: [[0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0]], color: 'bg-cyan-400' },
  J: { shape: [[0, 'J', 0], [0, 'J', 0], ['J', 'J', 0]], color: 'bg-blue-600' },
  L: { shape: [[0, 'L', 0], [0, 'L', 0], [0, 'L', 'L']], color: 'bg-orange-500' },
  O: { shape: [['O', 'O'], ['O', 'O']], color: 'bg-yellow-400' },
  S: { shape: [[0, 'S', 'S'], ['S', 'S', 0], [0, 0, 0]], color: 'bg-green-500' },
  T: { shape: [[0, 0, 0], ['T', 'T', 'T'], [0, 'T', 0]], color: 'bg-purple-600' },
  Z: { shape: [['Z', 'Z', 0], [0, 'Z', 'Z'], [0, 0, 0]], color: 'bg-red-600' },
};

export const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino];
};