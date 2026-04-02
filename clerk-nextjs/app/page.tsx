"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 🔒 LA MAGIE EST ICI : Redirection si non connecté
    if (isLoaded && !user) {
      router.push("/sign-up");
    }
  }, [isLoaded, user, router]);

  // Affichage du loader pendant que Clerk vérifie la session
  if (!isLoaded || !mounted) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-4xl animate-bounce">🖌️</div>
      </div>
    );
  }

  // Empêche la page de "flasher" une fraction de seconde avant la redirection
  if (!user) {
    return null; 
  }

  return (
    <main className="min-h-screen bg-[#FFF8F0] overflow-hidden relative">
      <style>{`
        /* ... TES STYLES RESTENT EXACTEMENT LES MÊMES ... */
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        .font-display { font-family: 'Fredoka One', cursive; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .blob { animation: blob 7s ease-in-out infinite; }

        .btn-main {
          transition: all 0.1s;
          box-shadow: 0 6px 0 #C94E1E;
          background: #FF6B35;
        }
        .btn-main:hover { transform: translateY(3px); box-shadow: 0 3px 0 #C94E1E; }
        .btn-main:active { transform: translateY(6px); box-shadow: none; }

        .btn-ghost {
          transition: all 0.1s;
          box-shadow: 0 6px 0 #d1c4b0;
          background: white;
        }
        .btn-ghost:hover { transform: translateY(3px); box-shadow: 0 3px 0 #d1c4b0; }
        .btn-ghost:active { transform: translateY(6px); box-shadow: none; }

        .avatar-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: #FF6B35;
          animation: pulse-ring 2s ease-out infinite;
          z-index: -1;
        }
      `}</style>

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-80 h-80 bg-[#FFD93D] opacity-20 -top-20 -right-20" />
        <div className="blob absolute w-72 h-72 bg-[#6BCB77] opacity-15 -bottom-20 -left-20" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6 pt-12 pb-10">

        {/* Header */}
        <div className="fade-up w-full flex justify-between items-center mb-10" style={{ animationDelay: "0.1s" }}>
          <h1 className="font-display text-3xl text-[#2D2D2D]">Inkly 🖌️</h1>
          <div className="flex items-center gap-2">
            {user?.imageUrl && (
              <div className="relative avatar-ring">
                <img
                  src={user.imageUrl}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Welcome */}
        <div className="fade-up text-center mb-10" style={{ animationDelay: "0.2s" }}>
          <p className="text-[#999] text-sm font-semibold uppercase tracking-widest mb-1">Bienvenue,</p>
          <h2 className="font-display text-5xl text-[#2D2D2D]">
            {/* Plus besoin du "|| Joueur" car on sait que user existe ici */}
            {user.firstName} 👋
          </h2>
          <p className="text-[#bbb] text-sm mt-2">Prêt à gribouiller ?</p>
        </div>

        {/* ... LE RESTE DE TES BOUTONS ET CARTES NE CHANGE PAS ... */}
        
        {/* Main Play Button */}
        <div className="fade-up w-full max-w-xs mb-4" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={() => router.push("/play")}
            className="btn-main w-full rounded-2xl py-5 text-white font-display text-3xl text-center"
          >
            🎮 Jouer
          </button>
        </div>

        {/* ... Autres boutons et infos ... */}

      </div>
    </main>
  );
}
