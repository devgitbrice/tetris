import { useEffect, useRef } from 'react';

export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Se souvenir de la dernière callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Mettre en place l'intervalle
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}