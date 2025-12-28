'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function KartGame() {
  const canvasRef = useRef(null);
  const [lap, setLap] = useState(1);
  const [lastLapTime, setLastLapTime] = useState(0);
  
  // États du jeu gérés par des Ref pour éviter les re-renders pendant la boucle (60fps)
  const gameState = useRef({
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false },
    car: {
      x: 400, y: 530,       // Position de départ
      angle: 0,             // Direction
      speed: 0,             // Vitesse actuelle
      maxSpeed: 7,          // Vitesse max
      acc: 0.2,             // Accélération
      friction: 0.98,       // Frottement route
      grassFriction: 0.85,  // Frottement herbe (ralentissement)
      turnSpeed: 0.07,      // Vitesse de rotation
      drift: 0,             // Facteur de dérapage
    },
    particles: [],          // Pour la fumée
    checkpoints: [false, false, false], // Pour valider un tour
    lapStartTime: Date.now(),
  });

  // --- MOTEUR PHYSIQUE ET DESSIN ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Définition de la piste (un simple ovale mathématique pour l'exemple)
    const trackCenter = { x: 400, y: 300 };
    const innerRadius = 150;
    const outerRadius = 280;

    // Objets (Champignons)
    const items = [
      { x: 400, y: 100, type: 'mushroom', active: true },
      { x: 600, y: 300, type: 'mushroom', active: true },
      { x: 200, y: 300, type: 'mushroom', active: true },
    ];

    const update = () => {
      const state = gameState.current;
      const { car, keys } = state;

      // 1. GESTION DES TOUCHES
      if (keys.ArrowUp) car.speed += car.acc;
      if (keys.ArrowDown) car.speed -= car.acc;
      
      // Rotation (Inversée si on recule pour plus de réalisme)
      if (Math.abs(car.speed) > 0.1) {
        const dir = car.speed > 0 ? 1 : -1;
        if (keys.ArrowLeft) car.angle -= car.turnSpeed * dir;
        if (keys.ArrowRight) car.angle += car.turnSpeed * dir;
      }

      // 2. PHYSIQUE & DÉRAPAGE
      // Calcul de la vélocité
      car.x += Math.cos(car.angle) * car.speed;
      car.y += Math.sin(car.angle) * car.speed;

      // Distance du centre pour savoir si on est sur la route
      const dist = Math.sqrt((car.x - trackCenter.x) ** 2 + (car.y - trackCenter.y) ** 2);
      const onRoad = dist > innerRadius && dist < outerRadius;

      // Frottement (Rapide sur route, lent sur herbe)
      car.speed *= onRoad ? car.friction : car.grassFriction;

      // Particules si on roule sur l'herbe
      if (!onRoad && Math.abs(car.speed) > 2) {
        state.particles.push({ 
          x: car.x, y: car.y, 
          life: 20, 
          vx: (Math.random() - 0.5), vy: (Math.random() - 0.5) 
        });
      }

      // 3. GESTION DES ITEMS (Champignons)
      items.forEach(item => {
        if (item.active) {
          const dx = car.x - item.x;
          const dy = car.y - item.y;
          if (Math.sqrt(dx*dx + dy*dy) < 30) {
            // Collision !
            item.active = false;
            car.speed = 12; // BOOST !
            setTimeout(() => item.active = true, 3000); // Réapparait après 3s
          }
        }
      });

      // 4. GESTION DES TOURS (Checkpoints basiques par angle)
      // Checkpoint 1: Haut, Checkpoint 2: Gauche, Checkpoint 3: Bas (Arrivée)
      // On utilise l'angle par rapport au centre pour valider les sections
      const angleFromCenter = Math.atan2(car.y - trackCenter.y, car.x - trackCenter.x);
      
      if (angleFromCenter < -1.5 && angleFromCenter > -2.5) state.checkpoints[0] = true; // Haut
      if (state.checkpoints[0] && angleFromCenter > 2.5) state.checkpoints[1] = true; // Gauche (vers bas)
      if (state.checkpoints[1] && angleFromCenter > 0.5 && angleFromCenter < 1.5) {
        // TOUR COMPLET
        state.checkpoints = [false, false, false];
        setLastLapTime((Date.now() - state.lapStartTime) / 1000);
        state.lapStartTime = Date.now();
        setLap(l => l + 1);
      }

      // --- DESSIN ---
      
      // Fond (Herbe)
      ctx.fillStyle = '#4ade80'; // Vert herbe
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Piste (Route)
      ctx.beginPath();
      ctx.arc(trackCenter.x, trackCenter.y, outerRadius, 0, Math.PI * 2);
      ctx.arc(trackCenter.x, trackCenter.y, innerRadius, 0, Math.PI * 2, true); // True pour le trou au milieu
      ctx.fillStyle = '#374151'; // Gris bitume
      ctx.fill();
      ctx.strokeStyle = '#facc15'; // Jaune
      ctx.lineWidth = 4;
      ctx.stroke();

      // Ligne d'arrivée
      ctx.save();
      ctx.translate(trackCenter.x, trackCenter.y + (innerRadius + outerRadius)/2);
      ctx.fillStyle = 'white';
      ctx.fillRect(-10, 0, 20, (outerRadius - innerRadius)); // Ligne blanche grossière
      ctx.restore();

      // Items
      items.forEach(item => {
        if (item.active) {
          ctx.beginPath();
          ctx.fillStyle = 'red';
          ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.fillText('🍄', item.x - 6, item.y + 4);
        }
      });

      // Particules (Poussière)
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      state.particles.forEach((p, index) => {
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillRect(p.x, p.y, 4, 4);
        if (p.life <= 0) state.particles.splice(index, 1);
      });

      // Voiture
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);
      
      // Corps voiture
      ctx.fillStyle = '#ef4444'; // Rouge
      ctx.fillRect(-15, -10, 30, 20);
      
      // Roues
      ctx.fillStyle = 'black';
      ctx.fillRect(-12, -12, 8, 4); // AVG
      ctx.fillRect(4, -12, 8, 4);   // AVD
      ctx.fillRect(-12, 8, 8, 4);   // ARG
      ctx.fillRect(4, 8, 8, 4);     // ARD
      
      // Tête du pilote
      ctx.fillStyle = '#fbbf24'; // Jaune
      ctx.beginPath();
      ctx.arc(-2, 0, 5, 0, Math.PI*2);
      ctx.fill();
      
      ctx.restore();

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    // Event Listeners Clavier
    const handleKeyDown = (e) => {
      if(gameState.current.keys.hasOwnProperty(e.code)) {
        e.preventDefault();
        gameState.current.keys[e.code] = true;
      }
    };
    const handleKeyUp = (e) => {
      if(gameState.current.keys.hasOwnProperty(e.code)) {
        gameState.current.keys[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4 italic text-red-500">SUPER REACT KART</h1>
      
      <div className="relative border-8 border-gray-700 rounded-xl overflow-hidden shadow-2xl">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          className="bg-green-500 block cursor-none"
        />
        
        {/* HUD (Interface) */}
        <div className="absolute top-4 left-4 bg-black/50 p-4 rounded text-xl font-mono border border-white/20">
          <p>TOUR : <span className="text-yellow-400 text-2xl">{lap}</span></p>
          <p className="text-sm text-gray-300">Dernier : {lastLapTime.toFixed(2)}s</p>
        </div>

        <div className="absolute bottom-4 right-4 bg-black/50 p-2 rounded text-sm text-gray-300">
          <p>↑ Accélérer</p>
          <p>← → Tourner</p>
          <p>🍄 Boost sur les points rouges</p>
        </div>
      </div>
    </div>
  );
}