import './globals.css';
import Link from 'next/link';
// Import du Context et du composant Client Popup
import { GameProvider } from '../context/GameContext';
import MathPopup from '../components/MathPopup';

export const metadata = {
  title: 'Arcade Math',
  description: 'Jeux d\'arcade et calcul mental',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      {/* "h-screen" et "overflow-hidden" pour que l'app prenne toute la fenêtre sans scroll global */}
      <body className="flex h-screen bg-gray-950 text-white overflow-hidden">
        
        {/* On enveloppe toute l'application avec le "Cerveau" (GameProvider) */}
        <GameProvider>
          
          {/* La fenêtre de Maths (composant Client) qui s'affiche par-dessus tout */}
          <MathPopup />

          {/* --- MENU LATÉRAL (ASIDE) --- */}
          <aside className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col p-6 shadow-xl z-10 shrink-0">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-400 mb-2">Arcade Zone</h2>
              <div className="h-1 w-10 bg-blue-500 rounded"></div>
            </div>
            
            <nav className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="p-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
              >
                🏠 <span className="font-medium">Home</span>
              </Link>
              
              <Link 
                href="/tetris" 
                className="p-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
              >
                🎮 <span className="font-medium">Tetris</span>
              </Link>

              <Link 
                href="/pacman" 
                className="p-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
              >
                👻 <span className="font-medium">Pac-Man</span>
              </Link>

              <Link 
                href="/kart" 
                className="p-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
              >
                🏎️ <span className="font-medium">Karting</span>
              </Link>

              <Link 
                href="/space-invaders" 
                className="p-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-300 hover:text-white"
              >
                👾 <span className="font-medium">Space Invaders</span>
              </Link>

              {/* Petit séparateur visuel */}
              <div className="h-px bg-gray-800 my-2 mx-4"></div>

              {/* Lien vers la page Réglages */}
              <Link 
                href="/settings" 
                className="p-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-400 hover:text-blue-400"
              >
                ⚙️ <span className="font-medium">Réglages</span>
              </Link>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-800 text-xs text-gray-500">
              © 2025 Mon Projet Next.js
            </div>
          </aside>

          {/* --- ZONE PRINCIPALE (MAIN) --- */}
          <main className="flex-1 relative overflow-auto flex flex-col">
            {children}
          </main>

        </GameProvider>
      </body>
    </html>
  );
}