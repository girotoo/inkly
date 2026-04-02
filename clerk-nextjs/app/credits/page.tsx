"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreditsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-4xl animate-bounce">🖌️</div>
      </div>
    );
  }

  const techs = [
    { emoji: "⚛️", name: "Next.js", desc: "Framework React" },
    { emoji: "🔐", name: "Clerk", desc: "Authentification" },
    { emoji: "🎨", name: "Tailwind CSS", desc: "Styles" },
    { emoji: "🔥", name: "Firebase", desc: "Base de données" },
  ];

  return (
    <main className="min-h-screen bg-[#FFF8F0] overflow-hidden relative">
      <style>{`
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .blob { animation: blob 7s ease-in-out infinite; }
        .float { animation: float 3s ease-in-out infinite; }

        .creator-badge {
          background: linear-gradient(90deg, #FF6B35, #FFD93D, #FF6B35);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-back {
          transition: all 0.1s;
          box-shadow: 0 4px 0 #d1c4b0;
          background: white;
        }
        .btn-back:hover { transform: translateY(2px); box-shadow: 0 2px 0 #d1c4b0; }
        .btn-back:active { transform: translateY(4px); box-shadow: none; }

        .card {
          background: white;
          border-radius: 1rem;
          border: 2px solid #f0e0cc;
          box-shadow: 0 6px 0 #e8d5bf;
        }

        .tech-pill {
          background: #FFF8F0;
          border: 2px solid #f0e0cc;
          border-radius: 999px;
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-80 h-80 bg-[#FFD93D] opacity-20 -top-20 -right-20" />
        <div className="blob absolute w-72 h-72 bg-[#6BCB77] opacity-15 -bottom-20 -left-20" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6 pt-12 pb-10">

        <div className="fade-up w-full flex items-center gap-3 mb-8" style={{ animationDelay: "0.1s" }}>
          <button onClick={() => router.push("/")} className="btn-back rounded-xl px-3 py-2 text-xl">←</button>
          <h1 className="font-display text-3xl text-[#2D2D2D]">📜 Crédits</h1>
        </div>

        <div className="fade-up text-center mb-8" style={{ animationDelay: "0.2s" }}>
          <div className="float text-6xl mb-3">🖌️</div>
          <h2 className="font-display text-4xl text-[#2D2D2D]">Inkly</h2>
          <p className="text-[#999] text-sm mt-1">Fait avec ❤️ par passion</p>
        </div>

        <div className="fade-up card w-full max-w-xs p-5 mb-4" style={{ animationDelay: "0.3s" }}>
          <p className="font-display text-base text-[#2D2D2D] mb-4">👑 Créateur</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FFF8F0] rounded-2xl flex items-center justify-center text-3xl border-2 border-[#f0e0cc]">
              🧑‍💻
            </div>
            <div>
              <p className="font-display text-xl creator-badge">Simão Cardoso Girôto</p>
              <p className="text-xs text-[#999] mt-0.5">Fondateur & Développeur principal</p>
              <span className="inline-block mt-1 text-[10px] font-bold bg-[#FF6B35] text-white px-2 py-0.5 rounded-full">
                ✨ Créateur d'Inkly
              </span>
            </div>
          </div>
        </div>

        <div className="fade-up card w-full max-w-xs p-5 mb-4" style={{ animationDelay: "0.4s" }}>
          <p className="font-display text-base text-[#2D2D2D] mb-4">🛠️ Technologies</p>
          <div className="grid grid-cols-2 gap-2">
            {techs.map((tech, i) => (
              <div key={i} className="tech-pill px-3 py-2 flex items-center gap-2">
                <span className="text-lg">{tech.emoji}</span>
                <div>
                  <p className="font-bold text-[#2D2D2D] text-xs">{tech.name}</p>
                  <p className="text-[10px] text-[#999]">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-up w-full max-w-xs" style={{ animationDelay: "0.5s" }}>
          <div className="bg-[#4D96FF] rounded-2xl p-4 text-white text-center" style={{ boxShadow: "0 6px 0 #2d6fcc" }}>
            <p className="font-display text-xl mb-1">🙏 Merci !</p>
            <p className="text-sm opacity-90 font-semibold">Merci de jouer à Inkly.<br />Amusez-vous bien !</p>
          </div>
        </div>

      </div>
    </main>
  );
}
