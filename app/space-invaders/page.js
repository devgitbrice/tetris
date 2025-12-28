'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext'; // 1. On importe le Cerveau

export default function SpaceInvaders() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  // 2. On récupère l'état de pause du Context
  const { isPaused } = useGame();
  
  // 3. Astuce "Ref Mirroring" : On crée une copie de isPaused accessible dans la boucle de jeu
  const pausedRef = useRef(isPaused);

  // À chaque fois que le Context change la pause, on met à jour la ref
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  // État du jeu mutable (pour éviter les re-renders React dans la boucle 60fps)
  const gameState = useRef({
    player: { x: 300, y: 550, width: 30, height: 20, speed: 5, color: '#00ff00', cooldown: 0 },
    bullets: [],
    enemies: [],
    particles: [],
    enemyDir: 1,
    enemySpeed: 1,
    keys: { ArrowLeft: false, ArrowRight: false, ' ': false },
    lastShot: 0,
  });

  const initEnemies = () => {
    const enemies = [];
    const rows = 5;
    const cols = 11;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        enemies.push({
          x: 50 + c * 40,
          y: 50 + r * 30,
          width: 24,
          height: 24,
          row: r,
          col: c
        });
      }
    }
    return enemies;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Initialisation
    gameState.current.enemies = initEnemies();
    gameState.current.bullets = [];
    gameState.current.particles = [];
    gameState.current.player.x = canvas.width / 2;

    const createExplosion = (x, y, color) => {
      for (let i = 0; i < 10; i++) {
        gameState.current.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 20 + Math.random() * 10,
          color
        });
      }
    };

    const update = () => {
      // 4. SI PAUSE : On garde l'image figée et on boucle sans rien calculer
      if (pausedRef.current) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }

      if (gameOver || win) return;

      const state = gameState.current;
      const { player, bullets, enemies, particles, keys } = state;

      // --- LOGIQUE DU JEU ---

      // Mouvement Joueur
      if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
      if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;

      // Tir Joueur
      if (keys[' '] && state.lastShot <= 0) {
        bullets.push({ x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 10, speed: -7, type: 'player' });
        state.lastShot = 20;
      }
      if (state.lastShot > 0) state.lastShot--;

      // Bullets Logic
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += b.speed;

        if (b.y < 0 || b.y > canvas.height) {
          bullets.splice(i, 1);
          continue;
        }

        if (b.type === 'player') {
          let hit = false;
          for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
              createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#fff');
              enemies.splice(j, 1);
              bullets.splice(i, 1);
              setScore(s => s + 100);
              state.enemySpeed += 0.05;
              hit = true;
              break;
            }
          }
          if (hit) continue;
        } else {
          // Tir ennemi touche joueur
          if (b.x < player.x + player.width && b.x + b.width > player.x && b.y < player.y + player.height && b.y + b.height > player.y) {
            createExplosion(player.x, player.y, '#00ff00');
            bullets.splice(i, 1);
            setLives(l => {
              if (l - 1 <= 0) setGameOver(true);
              return l - 1;
            });
            player.x = canvas.width / 2;
          }
        }
      }

      // Ennemis Logic
      let hitWall = false;
      enemies.forEach(e => {
        if ((e.x + e.width > canvas.width && state.enemyDir === 1) || (e.x < 0 && state.enemyDir === -1)) {
          hitWall = true;
        }
      });

      if (hitWall) {
        state.enemyDir *= -1;
        enemies.forEach(e => e.y += 20);
      }

      enemies.forEach(e => {
        e.x += state.enemySpeed * state.enemyDir;
        if (e.y + e.height > player.y) setGameOver(true);
        if (Math.random() < 0.001 + (0.0001 * (55 - enemies.length))) {
          bullets.push({ x: e.x + e.width/2, y: e.y + e.height, width: 4, height: 10, speed: 3, type: 'enemy' });
        }
      });

      if (enemies.length === 0) setWin(true);

      // --- DESSIN ---
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Joueur
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(player.x, player.y + 10, player.width, 10);
      ctx.fillRect(player.x + 10, player.y, 10, 10);

      // Ennemis
      ctx.fillStyle = 'white';
      enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(e.x + 6, e.y + 6, 4, 4);
        ctx.fillRect(e.x + 14, e.y + 6, 4, 4);
        ctx.fillStyle = 'white';
      });

      // Bullets
      bullets.forEach(b => {
        ctx.fillStyle = b.type === 'player' ? '#00ff00' : '#ff0000';
        ctx.fillRect(b.x, b.y, b.width, b.height);
      });

      // Particules
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 20;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1;
        if (p.life <= 0) particles.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    const handleKeyDown = (e) => {
      if (gameState.current.keys.hasOwnProperty(e.key)) gameState.current.keys[e.key] = true;
    };
    const handleKeyUp = (e) => {
      if (gameState.current.keys.hasOwnProperty(e.key)) gameState.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver, win]); // On ne met PAS 'isPaused' ici pour ne pas reset le jeu

  const restart = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWin(false);
    gameState.current.enemies = initEnemies();
    gameState.current.bullets = [];
    gameState.current.player.x = 300;
    gameState.current.enemySpeed = 1;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black text-green-500 font-mono outline-none">
      <h1 className="text-4xl font-bold mb-4 tracking-widest">SPACE INVADERS</h1>
      
      <div className="relative border-b-4 border-green-700">
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={600} 
          className="bg-gray-900 shadow-2xl block"
        />
        
        <div className="absolute top-2 left-4 text-xl font-bold">SCORE: {score}</div>
        <div className="absolute top-2 right-4 text-xl font-bold">LIVES: {lives}</div>

        {(gameOver || win) && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <h2 className={`text-5xl font-bold mb-6 ${win ? 'text-blue-400' : 'text-red-500'}`}>
              {win ? 'MISSION ACCOMPLISHED' : 'GAME OVER'}
            </h2>
            <button 
              onClick={restart}
              className="px-8 py-3 bg-green-600 text-black font-bold rounded hover:bg-green-500 hover:scale-110 transition-transform"
            >
              INSERT COIN TO RESTART
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-400 flex gap-8">
        <p>⬅ ➡ : Déplacer</p>
        <p>ESPACE : Tirer</p>
      </div>
    </div>
  );
}