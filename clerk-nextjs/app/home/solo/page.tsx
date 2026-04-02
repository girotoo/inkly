"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type GamePhase = "menu" | "countdown" | "drawing" | "ia_guessing" | "result" | "player_guessing" | "round_result";
type Difficulty = "facile" | "normal" | "difficile";

const WORDS_BY_DIFFICULTY: Record<Difficulty, string[]> = {
  facile: ["chat", "chien", "maison", "soleil", "arbre", "fleur", "voiture", "bateau", "avion", "pizza"],
  normal: ["bicyclette", "parapluie", "château", "dinosaure", "guitare", "montgolfière", "pieuvre", "cactus", "phare", "igloo"],
  difficile: ["labyrinthes", "philosophie", "origami", "archipel", "kaléidoscope", "réverbère", "catapulte", "xylophone", "équilibre", "météorite"],
};

const ROUND_TIME = 60; // secondes
const MAX_ROUNDS = 3;

// ─── Canvas Hook ──────────────────────────────────────────────────────────────
function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#2D2D2D");
  const [size, setSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height),
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * (canvas.width / rect.width),
      y: ((e as React.MouseEvent).clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e, canvasRef.current);
    lastPos.current = pos;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (isEraser ? size * 2 : size) / 2, 0, Math.PI * 2);
    ctx.fillStyle = isEraser ? "white" : color;
    ctx.fill();
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current || !lastPos.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d")!;
    const pos = getPos(e, canvasRef.current);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = isEraser ? "white" : color;
    ctx.lineWidth = isEraser ? size * 4 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return { startDraw, draw, stopDraw, clearCanvas, color, setColor, size, setSize, isEraser, setIsEraser };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function SoloPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Game state
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [currentRound, setCurrentRound] = useState(1);
  const [currentWord, setCurrentWord] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [playerScore, setPlayerScore] = useState(0);
  const [iaScore, setIaScore] = useState(0);
  const [iaGuess, setIaGuess] = useState("");
  const [iaThinking, setIaThinking] = useState(false);
  const [iaSuccess, setIaSuccess] = useState<boolean | null>(null);
  const [playerGuessInput, setPlayerGuessInput] = useState("");
  const [playerGuessResult, setPlayerGuessResult] = useState<"correct" | "wrong" | null>(null);
  const [iaDrawing, setIaDrawing] = useState<string[]>([]);
  const [iaWord, setIaWord] = useState("");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); // true = player draws, false = player guesses
  const [roundHistory, setRoundHistory] = useState<Array<{ word: string; iaGuessed: boolean; playerGuessed: boolean }>>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvas = useCanvas(canvasRef);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-up");
  }, [isLoaded, isSignedIn, router]);

  // Countdown before drawing
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      if (isPlayerTurn) {
        setPhase("drawing");
        setTimeLeft(ROUND_TIME);
        canvas.clearCanvas();
      } else {
        setPhase("player_guessing");
        startIaDrawing();
      }
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Timer during drawing
  useEffect(() => {
    if (phase !== "drawing") return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, timeLeft]);

  const pickWord = (diff: Difficulty) => {
    const words = WORDS_BY_DIFFICULTY[diff];
    return words[Math.floor(Math.random() * words.length)];
  };

  const startGame = () => {
    const word = pickWord(difficulty);
    setCurrentWord(word);
    setCurrentRound(1);
    setPlayerScore(0);
    setIaScore(0);
    setRoundHistory([]);
    setIsPlayerTurn(true);
    setCountdown(3);
    setPhase("countdown");
  };

  const handleTimeUp = () => {
    // IA essaie de deviner
    setPhase("ia_guessing");
    setIaThinking(true);
    setIaGuess("");
    setIaSuccess(null);

    // Simulate IA analysis with delay
    const thinkTime = difficulty === "facile" ? 1500 : difficulty === "normal" ? 2500 : 3500;
    const successRate = difficulty === "facile" ? 0.75 : difficulty === "normal" ? 0.55 : 0.35;
    const success = Math.random() < successRate;

    setTimeout(() => {
      setIaThinking(false);
      if (success) {
        setIaGuess(currentWord);
        setIaSuccess(true);
        setIaScore(s => s + getPoints(timeLeft, true));
      } else {
        // Fake wrong guess
        const wrongs = ["nuage", "robot", "chapeau", "étoile", "montagne", "poisson", "train", "ballon"];
        setIaGuess(wrongs[Math.floor(Math.random() * wrongs.length)]);
        setIaSuccess(false);
      }

      setTimeout(() => {
        setRoundHistory(h => [...h, { word: currentWord, iaGuessed: success, playerGuessed: false }]);
        nextTurn();
      }, 2500);
    }, thinkTime);
  };

  const getPoints = (time: number, guessed: boolean) => {
    if (!guessed) return 0;
    return Math.max(100, Math.floor((time / ROUND_TIME) * 300));
  };

  const nextTurn = () => {
    if (!isPlayerTurn) {
      // After player guessing turn → check rounds
      const nextRound = currentRound + 1;
      if (nextRound > MAX_ROUNDS) {
        setPhase("result");
      } else {
        setCurrentRound(nextRound);
        const word = pickWord(difficulty);
        setCurrentWord(word);
        setIsPlayerTurn(true);
        setCountdown(3);
        setPhase("countdown");
      }
    } else {
      // Switch to IA draws / player guesses
      const iaWordPick = pickWord(difficulty);
      setIaWord(iaWordPick);
      setIsPlayerTurn(false);
      setCountdown(3);
      setPhase("countdown");
    }
  };

  // Simulate IA drawing (fake progressive strokes)
  const startIaDrawing = () => {
    const emojis = ["🎨", "✏️", "🖊️", "🖌️"];
    const steps: string[] = [];
    for (let i = 0; i < 6; i++) {
      steps.push(emojis[Math.floor(Math.random() * emojis.length)]);
    }
    setIaDrawing([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(interval);
        return;
      }
      setIaDrawing(d => [...d, steps[i]]);
      i++;
    }, 800);
  };

  const handlePlayerGuess = () => {
    const correct = playerGuessInput.trim().toLowerCase() === iaWord.toLowerCase();
    setPlayerGuessResult(correct ? "correct" : "wrong");
    if (correct) setPlayerScore(s => s + 200);
    setTimeout(() => {
      setRoundHistory(h => {
        const last = h[h.length - 1];
        if (last) last.playerGuessed = correct;
        return [...h];
      });
      setPlayerGuessInput("");
      setPlayerGuessResult(null);
      const nextRound = currentRound + 1;
      if (nextRound > MAX_ROUNDS) {
        setPhase("result");
      } else {
        setCurrentRound(nextRound);
        const word = pickWord(difficulty);
        setCurrentWord(word);
        setIsPlayerTurn(true);
        setCountdown(3);
        setPhase("countdown");
      }
    }, 2000);
  };

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-4xl animate-bounce">🖌️</div>
      </div>
    );
  }
  if (!isSignedIn) return null;

  const timerPercent = (timeLeft / ROUND_TIME) * 100;
  const timerColor = timeLeft > 30 ? "#6BCB77" : timeLeft > 10 ? "#FFD93D" : "#FF6B35";

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
        @keyframes pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
        @keyframes wiggle { 0%,100%{transform:rotate(-3deg);} 50%{transform:rotate(3deg);} }
        @keyframes popIn {
          0%{transform:scale(0.5);opacity:0;}
          80%{transform:scale(1.1);}
          100%{transform:scale(1);opacity:1;}
        }
        @keyframes slideDown {
          from{opacity:0;transform:translateY(-10px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes thinking {
          0%,100%{opacity:0.3;transform:scale(0.8);}
          50%{opacity:1;transform:scale(1.2);}
        }

        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .blob { animation: blob 7s ease-in-out infinite; }
        .pulse { animation: pulse 1.5s ease-in-out infinite; }
        .wiggle { animation: wiggle 0.5s ease-in-out infinite; }
        .pop-in { animation: popIn 0.4s cubic-bezier(.17,.67,.83,.67) forwards; }
        .slide-down { animation: slideDown 0.3s ease forwards; }

        .btn-main {
          transition: all 0.1s;
          box-shadow: 0 6px 0 #C94E1E;
          background: #FF6B35;
        }
        .btn-main:hover { transform: translateY(3px); box-shadow: 0 3px 0 #C94E1E; }
        .btn-main:active { transform: translateY(6px); box-shadow: none; }
        .btn-main:disabled { opacity: 0.5; transform: none; }

        .btn-green {
          transition: all 0.1s;
          box-shadow: 0 6px 0 #2e8c4a;
          background: #4CAF50;
        }
        .btn-green:hover { transform: translateY(3px); box-shadow: 0 3px 0 #2e8c4a; }
        .btn-green:active { transform: translateY(6px); box-shadow: none; }

        .btn-ghost {
          transition: all 0.1s;
          box-shadow: 0 5px 0 #d1c4b0;
          background: white;
        }
        .btn-ghost:hover { transform: translateY(2px); box-shadow: 0 3px 0 #d1c4b0; }
        .btn-ghost:active { transform: translateY(5px); box-shadow: none; }

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

        .diff-btn {
          transition: all 0.15s;
          border: 2px solid #f0e0cc;
        }
        .diff-btn.active { border-color: #FF6B35; }
        .diff-btn:hover { transform: translateY(-2px); }

        .canvas-wrap {
          border-radius: 1rem;
          overflow: hidden;
          border: 3px solid #f0e0cc;
          box-shadow: 0 6px 0 #e8d5bf;
          background: white;
          touch-action: none;
        }

        .color-dot {
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 3px solid transparent;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .color-dot:hover { transform: scale(1.2); }
        .color-dot.active { border-color: #2D2D2D; transform: scale(1.1); }

        .timer-bar {
          height: 8px;
          border-radius: 99px;
          background: #f0e0cc;
          overflow: hidden;
        }
        .timer-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 1s linear, background-color 0.5s;
        }

        .ia-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          animation: thinking 1s ease-in-out infinite;
        }

        .input-field {
          background: #FFF8F0;
          border: 2px solid #f0e0cc;
          border-radius: 0.75rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #FF6B35; }

        .score-badge {
          background: white;
          border: 2px solid #f0e0cc;
          box-shadow: 0 4px 0 #e8d5bf;
          border-radius: 1rem;
        }
      `}</style>

      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-80 h-80 bg-[#FFD93D] opacity-20 -top-20 -right-20" />
        <div className="blob absolute w-72 h-72 bg-[#6BCB77] opacity-15 -bottom-20 -left-20" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-10 pb-10">

        {/* ── HEADER ── */}
        <div className="fade-up w-full flex items-center gap-3 mb-6" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => phase === "menu" ? router.push("/home/play") : setPhase("menu")}
            className="btn-back rounded-xl px-3 py-2 text-xl"
          >
            ←
          </button>
          <h1 className="font-display text-3xl text-[#2D2D2D]">🤖 Solo vs IA</h1>
          {phase !== "menu" && (
            <div className="ml-auto flex items-center gap-2">
              <span className="font-display text-sm text-[#999]">Manche</span>
              <span className="font-display text-lg text-[#FF6B35]">{currentRound}/{MAX_ROUNDS}</span>
            </div>
          )}
        </div>

        {/* ── SCOREBOARD (in game) ── */}
        {phase !== "menu" && phase !== "result" && (
          <div className="fade-up w-full max-w-sm mb-4" style={{ animationDelay: "0.15s" }}>
            <div className="flex gap-3">
              <div className="score-badge flex-1 p-3 text-center">
                <p className="text-xs text-[#999] font-bold uppercase tracking-wide mb-1">
                  {user?.firstName || "Toi"} 🧑
                </p>
                <p className="font-display text-2xl text-[#FF6B35]">{playerScore}</p>
              </div>
              <div className="score-badge flex-1 p-3 text-center">
                <p className="text-xs text-[#999] font-bold uppercase tracking-wide mb-1">IA 🤖</p>
                <p className="font-display text-2xl text-[#4D96FF]">{iaScore}</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            PHASE : MENU
        ══════════════════════════════════════════ */}
        {phase === "menu" && (
          <>
            <div className="fade-up text-center mb-6" style={{ animationDelay: "0.2s" }}>
              <p className="text-[#999] text-sm font-semibold uppercase tracking-widest mb-1">Mode solo</p>
              <p className="font-display text-2xl text-[#2D2D2D]">Dessine, l'IA devine !</p>
              <p className="text-[#bbb] text-sm mt-1">Et toi, tu devines ses dessins 🎨</p>
            </div>

            {/* How it works */}
            <div className="fade-up card w-full max-w-sm p-4 mb-5" style={{ animationDelay: "0.25s" }}>
              <p className="font-display text-base text-[#2D2D2D] mb-3">📋 Comment ça marche</p>
              <div className="space-y-2">
                {[
                  { icon: "✏️", text: "Tu dessines un mot, l'IA essaie de deviner" },
                  { icon: "🤖", text: "L'IA dessine, tu dois trouver le mot" },
                  { icon: "⏱️", text: `${ROUND_TIME}s par dessin, ${MAX_ROUNDS} manches` },
                  { icon: "🏆", text: "Plus tu es rapide, plus tu marques de points" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-sm text-[#555] font-semibold">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="fade-up w-full max-w-sm mb-6" style={{ animationDelay: "0.3s" }}>
              <p className="font-display text-base text-[#2D2D2D] mb-3">🎯 Difficulté</p>
              <div className="flex gap-2">
                {(["facile", "normal", "difficile"] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`diff-btn flex-1 rounded-xl py-3 bg-white font-display text-sm text-center capitalize ${difficulty === d ? "active" : ""}`}
                    style={difficulty === d ? { boxShadow: "0 4px 0 #C94E1E", background: "#FFF0E8" } : { boxShadow: "0 4px 0 #e8d5bf" }}
                  >
                    {d === "facile" ? "😊 Facile" : d === "normal" ? "🎯 Normal" : "🔥 Expert"}
                  </button>
                ))}
              </div>
            </div>

            <div className="fade-up w-full max-w-sm" style={{ animationDelay: "0.4s" }}>
              <button
                onClick={startGame}
                className="btn-main w-full rounded-2xl py-5 text-white font-display text-3xl text-center"
              >
                🚀 Lancer !
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════
            PHASE : COUNTDOWN
        ══════════════════════════════════════════ */}
        {phase === "countdown" && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6">
            <div className="pop-in text-center">
              <p className="font-display text-lg text-[#999] mb-2">
                {isPlayerTurn ? "À toi de dessiner !" : "L'IA 