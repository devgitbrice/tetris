'use client';

import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

export default function SettingsPage() {
  const { quizInterval, setQuizInterval, questionsTarget, setQuestionsTarget } = useGame();
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);

  const SECRET_PASS = "Djverdure012#";

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === SECRET_PASS) {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPasswordInput('');
    }
  };

  const currentSeconds = quizInterval / 1000;

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 shadow-2xl w-96">
          <h1 className="text-2xl font-bold mb-6 text-center text-red-500">ZONE PROTÉGÉE 🔒</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Mot de passe admin"
              className="p-3 rounded bg-gray-800 border border-gray-600 focus:border-blue-500 outline-none text-center"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold transition-colors">Déverrouiller</button>
          </form>
          {error && <p className="text-red-500 text-center mt-4 animate-pulse">Mot de passe incorrect !</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-white overflow-y-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">RÉGLAGES ADMIN ⚙️</h1>
      
      <div className="bg-gray-900 p-8 rounded-xl border border-blue-500 shadow-2xl w-[600px] flex flex-col gap-8">
        
        {/* --- SECTION 1 : FRÉQUENCE --- */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">⏱ Fréquence du Quiz</h2>
          <p className="text-gray-400 mb-4 text-sm">Temps de jeu avant la pause :</p>
          <div className="grid grid-cols-3 gap-4">
            {[10, 30, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => setQuizInterval(sec * 1000)}
                className={`p-4 rounded-lg font-bold text-xl transition-all ${
                  currentSeconds === sec 
                    ? 'bg-green-500 text-black scale-105 ring-4 ring-green-500/30' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {sec} sec
              </button>
            ))}
          </div>
        </div>

        {/* --- SECTION 2 : NOMBRE DE QUESTIONS --- */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">📚 Nombre de questions</h2>
          <p className="text-gray-400 mb-4 text-sm">Combien de calculs à résoudre pour débloquer :</p>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setQuestionsTarget(num)}
                className={`flex-1 p-4 rounded-lg font-bold text-xl transition-all ${
                  questionsTarget === num 
                    ? 'bg-yellow-500 text-black scale-105 ring-4 ring-yellow-500/30' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-700 text-center text-sm">
          Résumé : Pause toutes les <span className="text-green-400 font-bold">{currentSeconds}s</span> pour répondre à <span className="text-yellow-500 font-bold">{questionsTarget} question(s)</span>.
        </div>
      </div>
    </div>
  );
}