'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const GameContext = createContext();

export function GameProvider({ children }) {
  // --- ÉTATS DU JEU ---
  const [isPaused, setIsPaused] = useState(false);
  const [mathProblem, setMathProblem] = useState({ a: 0, b: 0 });
  
  // --- ÉTATS DES RÉGLAGES ---
  const [quizInterval, setQuizInterval] = useState(60000); // Temps avant pause (ms)
  const [questionsTarget, setQuestionsTarget] = useState(1); // Objectif de questions
  const [questionsDone, setQuestionsDone] = useState(0);     // Questions réussies

  const pathname = usePathname();

  // Fonction utilitaire pour créer une nouvelle question
  const generateProblem = () => {
    const a = Math.floor(Math.random() * 9) + 2; // Chiffre entre 2 et 10
    const b = Math.floor(Math.random() * 9) + 2;
    setMathProblem({ a, b });
  };

  useEffect(() => {
    // Si on est sur l'accueil, on ne lance jamais le timer
    if (pathname === '/') {
      setIsPaused(false);
      return;
    }

    // Fonction qui déclenche la pause
    const triggerMathBreak = () => {
      setQuestionsDone(0); // On remet le compteur à 0
      generateProblem();   // On génère la première question
      setIsPaused(true);   // On fige le jeu
    };

    // Si le jeu tourne (pas de pause), on lance le compte à rebours
    if (!isPaused) {
      const timer = setTimeout(triggerMathBreak, quizInterval);
      return () => clearTimeout(timer);
    }
  }, [pathname, isPaused, quizInterval]);

  // Fonction appelée quand l'utilisateur valide une réponse
  const checkAnswer = (answer) => {
    const correctAnswer = mathProblem.a * mathProblem.b;
    
    // Vérification de la réponse
    if (parseInt(answer) === correctAnswer) {
      // C'est juste ! On incrémente le compteur
      const nextDone = questionsDone + 1;
      setQuestionsDone(nextDone);

      // A-t-on atteint l'objectif ?
      if (nextDone >= questionsTarget) {
        setIsPaused(false); // OUI -> On libère le jeu !
      } else {
        generateProblem(); // NON -> On pose une nouvelle question
      }
      return true; // Indique à la popup que la réponse était bonne
    }
    
    return false; // Indique à la popup que la réponse était fausse
  };

  return (
    <GameContext.Provider value={{ 
      isPaused, 
      mathProblem, 
      checkAnswer, 
      quizInterval, 
      setQuizInterval,
      questionsTarget, 
      setQuestionsTarget,
      questionsDone
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);