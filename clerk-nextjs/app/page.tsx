"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const floatingItems = ["🎨", "✏️", "🖌️", "💡", "⭐", "🎯", "🖍️", "💬"];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF8F0] overflow-hidden relative font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

        * { font-family: 'Nunito', sans-serif; }
        .font-display { font-family: 'Fredoka One', cursive; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }

        .float-item { animation: float linear infinite; }
        .fade-up { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        .blob { animation: blob 7s ease-in-out infinite; }

        .btn-play {
          background: #FF6B35;
          box-shadow: 0 6px 0 #C94E1E;
          transition: all 0.1s;
        }
        .btn-play:hover { transform: translateY(3px); box-shadow: 0 3px 0 #C94E1E; }
        .btn-play:active { transform: translateY(6px); box-shadow: 0 0px 0 #C94E1E; }

        .card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 0 #e8d5bf;
          border: 2px solid #f0e0cc;
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-96 h-96 bg-[#FFD93D] opacity-20 -top-20 -left-20" />
        <div className="blob absolute w-80 h-80 bg-[#FF6B35] opacity-15 top-1/3 -right-20" style={{ animationDelay: "2s" }} />
        <div className="blob absolute w-72 h-72 bg-[#6BCB77] opacity-20 -bottom-10 left-1/4" style={{ animationDelay: "4s" }} />
        <div className="blob absolute w-64 h-64 bg-[#4D96FF] opacity-15 bottom-1/3 right-1/4" style={{ animationDelay: "3s" }} />
      </div>

      {mounted && floatingItems.map((emoji, i) => (
        <div
          key={i}
          className="float-item absolute text-3xl pointer-events-none select-none"
          style={{
            left: `${8 + (i * 12)}%`,
            top: `${10 + (i % 3) * 25}%`,
            animationDuration: `${3 + i * 0.5}s`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.6,
          }}
        >
          {emoji}
        </div>
      ))}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center">

        <div className="fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-14 h-14 bg-[#FF6B35] rounded-2xl flex items-center justify-center text-3xl shadow-lg rotate-6">
              🖌️
            </div>
            <h1 className="font-display text-7xl text-[#2D2D2D] tracking-wide">
              Inkly
            </h1>
          </div>
          <p className="font-display text-xl text-[#FF6B35] tracking-widest uppercase mt-1">
            Draw • Guess • Win
          </p>
        </div>

        <div className="fade-up mt-6 max-w-sm" style={{ animationDelay: "0.3s" }}>
          <p className="text-[#666] text-lg font-semibold leading-relaxed">
            Le jeu de dessin multijoueur où tes gribouillages font rire (ou pleurer) 😂
          </p>
        </div>

        <div className="fade-up mt-10 w-full max-w-xs" style={{ animationDelay: "0.5s" }}>
import PlayButton from "../components/PlayButton";

<PlayButton />
        </div>

        <div className="fade-up mt-14 grid grid-cols-3 gap-3 w-full max-w-sm" style={{ animationDelay: "0.7s" }}>
          {[
            { emoji: "✏️", title: "Dessine", desc: "Un objet secret à faire deviner" },
            { emoji: "🔍", title: "Devine", desc: "Trouve les dessins des autres" },
            { emoji: "🏆", title: "Gagne", desc: "Grimpe le classement" },
          ].map((f, i) => (
            <div key={i} className="card p-3 flex flex-col items-center gap-1">
              <span className="text-3xl">{f.emoji}</span>
              <span className="font-display text-sm text-[#2D2D2D]">{f.title}</span>
              <span className="text-xs text-[#999] leading-tight">{f.desc}</span>
            </div>
          ))}
        </div>

        <div className="fade-up mt-8" style={{ animationDelay: "0.9s" }}>
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-[#f0e0cc]">
            <span className="w-2 h-2 bg-[#6BCB77] rounded-full animate-pulse" />
            <span className="text-sm font-bold text-[#666]">2–8 joueurs • Gratuit • Aucun téléchargement</span>
          </div>
        </div>

      </div>
    </main>
  );
}
