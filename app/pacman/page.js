'use client';

import React, { useState } from 'react';
import { useInterval } from '../../hooks/useInterval';

// 1. IMPORT DU CONTEXTE
import { useGame } from '../../context/GameContext';

const INITIAL_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 2, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

export default function PacmanGame() {
  const [grid, setGrid] = useState(JSON.parse(JSON.stringify(INITIAL_MAP)));
  const [pacman, setPacman] = useState({ x: 6, y: 7, dir: 'ArrowRight' });
  const [mouthOpen, setMouthOpen] = useState(true); 
  
  const [ghosts, setGhosts] = useState([
    { x: 6, y: 5, color: 'bg-red-500', dir: 'ArrowUp' },
    { x: 5, y: 5, color: 'bg-pink-400', dir: 'ArrowDown' },
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);

  // 2. RÉCUPÉRATION DE LA PAUSE
  const { isPaused } = useGame();

  const isValidMove = (x, y) => {
    return grid[y] && grid[y][x] !== 1;
  };

  const handleKeyDown = (e) => {
    // 3. BLOQUAGE DES INPUTS SI PAUSE
    if (isPaused) return;

    if (DIRECTIONS[e.key]) {
      e.preventDefault();
      setPacman((prev) => ({ ...prev, dir: e.key }));
      if (!gameRunning && !gameOver && !win) setGameRunning(true);
    }
  };

  const moveGhosts = () => {
    setGhosts((prevGhosts) =>
      prevGhosts.map((ghost) => {
        const moves = Object.keys(DIRECTIONS);
        const validMoves = moves.filter((key) => {
          const dx = DIRECTIONS[key].x;
          const dy = DIRECTIONS[key].y;
          return isValidMove(ghost.x + dx, ghost.y + dy);
        });
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        
        if (randomMove) {
          return {
            ...ghost,
            x: ghost.x + DIRECTIONS[randomMove].x,
            y: ghost.y + DIRECTIONS[randomMove].y,
          };
        }
        return ghost;
      })
    );
  };

  const gameLoop = () => {
    if (!gameRunning || gameOver || win) return;

    let newX = pacman.x + DIRECTIONS[pacman.dir].x;
    let newY = pacman.y + DIRECTIONS[pacman.dir].y;

    if (!isValidMove(newX, newY)) {
      newX = pacman.x;
      newY = pacman.y;
    }

    let points = 0;
    if (grid[newY][newX] === 0) {
      const newGrid = [...grid];
      newGrid[newY][newX] = 2;
      setGrid(newGrid);
      points = 10;
    }

    setScore((s) => s + points);
    setPacman((p) => ({ ...p, x: newX, y: newY }));

    moveGhosts();

    const collision = ghosts.some((g) => g.x === newX && g.y === newY);
    if (collision) {
      setGameOver(true);
      setGameRunning(false);
    }

    const hasPellets = grid.some((row) => row.includes(0));
    if (!hasPellets) {
      setWin(true);
      setGameRunning(false);
    }
  };

  // 4. SUSPENSION DES INTERVALLES SI PAUSE
  
  // Boucle de jeu (300ms)
  useInterval(gameLoop, (gameRunning && !isPaused) ? 300 : null);

  // Boucle de bouche (150ms)
  useInterval(() => {
    if(gameRunning) setMouthOpen(prev => !prev);
  }, (gameRunning && !isPaused) ? 150 : null); // Ne clignote plus en pause

  const resetGame = () => {
    setGrid(JSON.parse(JSON.stringify(INITIAL_MAP)));
    setPacman({ x: 6, y: 7, dir: 'ArrowRight' });
    setGhosts([
      { x: 6, y: 5, color: 'bg-red-500', dir: 'ArrowUp' },
      { x: 5, y: 5, color: 'bg-pink-400', dir: 'ArrowDown' },
    ]);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setGameRunning(false);
    setMouthOpen(true);
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full bg-black text-white outline-none"
      tabIndex="0"
      onKeyDown={handleKeyDown}
    >
      <h1 className="text-4xl font-bold mb-4 text-yellow-400">PAC-MAN</h1>
      
      <div className="relative bg-gray-900 p-4 rounded-lg border-4 border-blue-900">
        {grid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => {
              let content = null;
              if (cell === 1) content = <div className="w-6 h-6 bg-blue-900 border border-blue-800 rounded-sm" />;
              else if (cell === 0) content = <div className="w-6 h-6 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-pink-200 rounded-full" /></div>;
              else content = <div className="w-6 h-6" />;

              const isPacman = pacman.x === x && pacman.y === y;
              const ghost = ghosts.find((g) => g.x === x && g.y === y);

              if (isPacman) {
                const pacColor = '#facc15';
                const transparent = 'transparent';
                const borderColors = mouthOpen 
                  ? `${pacColor} ${transparent} ${pacColor} ${pacColor}` 
                  : `${pacColor}`;

                return (
                  <div key={`${x}-${y}`} className="w-6 h-6 bg-black flex items-center justify-center relative z-10">
                     <div 
                       style={{
                         width: 0, height: 0,
                         borderStyle: 'solid',
                         borderWidth: '11px',
                         borderRadius: '50%',
                         borderColor: borderColors
                       }}
                       className={`transition-transform ${
                       pacman.dir === 'ArrowUp' ? '-rotate-90' :
                       pacman.dir === 'ArrowDown' ? 'rotate-90' :
                       pacman.dir === 'ArrowLeft' ? 'rotate-180' : 'rotate-0'
                     }`}>
                     </div>
                  </div>
                );
              }

              if (ghost) {
                return (
                  <div key={`${x}-${y}`} className="w-6 h-6 bg-black flex items-center justify-center z-10">
                    <div className={`w-5 h-5 ${ghost.color} rounded-t-lg rounded-b-md`}>
                      <div className="flex justify-around pt-1">
                         <div className="w-1.5 h-1.5 bg-white rounded-full"><div className="w-0.5 h-0.5 bg-blue-900 ml-0.5 mt-0.5"></div></div>
                         <div className="w-1.5 h-1.5 bg-white rounded-full"><div className="w-0.5 h-0.5 bg-blue-900 ml-0.5 mt-0.5"></div></div>
                      </div>
                    </div>
                  </div>
                );
              }

              return <div key={`${x}-${y}`} className="w-6 h-6 bg-black">{content}</div>;
            })}
          </div>
        ))}

        {(gameOver || win) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            <h2 className={`text-3xl font-bold mb-4 ${win ? 'text-green-400' : 'text-red-500'}`}>
              {win ? 'YOU WIN!' : 'GAME OVER'}
            </h2>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400"
            >
              Rejouer
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-8">
        <div className="text-center">
          <p className="text-gray-400 text-sm">SCORE</p>
          <p className="text-2xl font-mono text-white">{score}</p>
        </div>
        <div className="text-left text-sm text-gray-500">
           <p>Clique ici et utilise les flèches</p>
           <p>Waka Waka !</p>
        </div>
      </div>
    </div>
  );
}