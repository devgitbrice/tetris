'use client';

import React, { useState } from 'react';
import { createStage, checkCollision } from '../../utils/gameHelpers';
import { TETROMINOS } from '../../utils/tetrominos';
import { useInterval } from '../../hooks/useInterval';
import { usePlayer } from '../../hooks/usePlayer';
import { useStage } from '../../hooks/useStage';

// 1. IMPORT DU CONTEXTE
import { useGame } from '../../context/GameContext';

export default function Tetris() {
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
  const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);

  // 2. RÉCUPÉRATION DE LA PAUSE
  const { isPaused } = useGame();

  const movePlayer = (dir) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 });
    }
  };

  const startGame = () => {
    setStage(createStage());
    setDropTime(1000); 
    resetPlayer();
    setGameOver(false);
  };

  const drop = () => {
    if (rowsCleared > 0) {
      setDropTime(1000 / (rowsCleared + 1) + 200);
    }
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const keyUp = ({ keyCode }) => {
    if (!gameOver && !isPaused) {
      if (keyCode === 40) {
        setDropTime(1000);
      }
    }
  };

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const move = (e) => {
    // 3. BLOQUAGE DES INPUTS SI PAUSE
    if (isPaused) return;

    if (!gameOver) {
      if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault(); 
      }
      if (e.keyCode === 37) movePlayer(-1);
      else if (e.keyCode === 39) movePlayer(1);
      else if (e.keyCode === 40) dropPlayer();
      else if (e.keyCode === 38) playerRotate(stage, 1);
    }
  };

  // 4. SUSPENSION DU TEMPS SI PAUSE (On passe null à useInterval)
  useInterval(() => {
    drop();
  }, isPaused ? null : dropTime);

  return (
    <div
      role="button"
      tabIndex="0"
      onKeyDown={(e) => move(e)}
      onKeyUp={keyUp}
      className="w-full h-full bg-gray-900 overflow-hidden flex items-center justify-center outline-none flex-1"
    >
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="bg-black border-4 border-gray-600 rounded-lg p-1">
          <div 
            className="grid grid-cols-12 gap-0 bg-gray-800"
            style={{ width: '300px', height: '500px' }} 
          >
            {stage.map((row) =>
              row.map((cell, x) => (
                <div
                  key={x}
                  className={`w-full h-full ${
                    cell[0] === 0 ? 'bg-transparent' : TETROMINOS[cell[0]].color
                  } ${
                    cell[0] !== 0 ? 'border border-white/20' : ''
                  }`}
                />
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 text-white w-48">
          {gameOver ? (
            <div className="p-4 bg-red-600 rounded-lg text-center font-bold animate-pulse">GAME OVER</div>
          ) : (
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">Lignes</p>
              <p className="text-2xl font-mono">{rowsCleared}</p>
            </div>
          )}
          <button onClick={startGame} className="p-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg font-bold hover:scale-105 transition-transform">
            {gameOver ? 'Rejouer' : 'Start Game'}
          </button>
        </div>
      </div>
    </div>
  );
}