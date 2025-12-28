'use client';

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function MathPopup() {
  const { isPaused, mathProblem, checkAnswer, questionsTarget, questionsDone } = useGame();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (!isPaused) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (checkAnswer(input)) {
      setInput('');
      setError(false);
      // Pas besoin de fermer ici, c'est le Context qui décide si c'est fini ou s'il envoie une nouvelle question
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-800 p-8 rounded-2xl border-4 border-yellow-400 text-center shadow-2xl transform scale-110 min-w-[300px]">
        
        {/* Indicateur de progression */}
        <div className="mb-4 text-gray-400 font-bold text-sm tracking-widest uppercase">
          Question {questionsDone + 1} / {questionsTarget}
        </div>

        <h2 className="text-3xl font-bold text-white mb-6">PAUSE MATHS ! 🧠</h2>
        
        <div className="text-6xl font-mono text-yellow-400 mb-8 font-bold">
          {mathProblem.a} x {mathProblem.b}
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            autoFocus
            type="number" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-black text-center text-3xl p-3 rounded-lg border-2 border-blue-500 focus:outline-none focus:border-yellow-400"
            placeholder="?"
          />
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors">
            VALIDER
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 font-bold animate-pulse">Mauvaise réponse !</p>}
        
        {/* Barre de progression visuelle */}
        <div className="mt-6 flex gap-2 justify-center">
          {Array.from({ length: questionsTarget }).map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-8 rounded-full ${i < questionsDone ? 'bg-green-500' : 'bg-gray-600'}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}