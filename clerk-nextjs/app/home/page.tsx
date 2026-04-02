"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase"; // adapte selon ton chemin
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

export default function PlayPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // UI state
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-up");
  }, [isLoaded, isSignedIn, router]);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-4xl animate-bounce">🖌️</div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  // Génère un code de salle à 6 caractères
  const generateCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  // Créer une salle
  const handleCreateRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const code = generateCode();
      await addDoc(collection(db, "rooms"), {
        code,
        hostId: user.id,
        hostName: user.firstName || "Joueur",
        hostAvatar: user.imageUrl || "",
        players: [
          {
            id: user.id,
            name: user.firstName || "Joueur",
            avatar: user.imageUrl || "",
          },
        ],
        status: "waiting", // waiting | playing | finished
        mode: "multiplayer",
        createdAt: serverTimestamp(),
      });
      setRoomCode(code);
      setMode("create");
    } catch (e) {
      setError("Erreur lors de la création. Réessaie !");
    } finally {
      setLoading(false);
    }
  };

  // Rejoindre une salle
  const handleJoinRoom = async () => {
    if (inputCode.length < 6) {
      setError("Le code doit faire 6 caractères.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Cherche la salle par code
      const { getDocs, query, where } = await import("firebase/firestore");
      const q = query(collection(db, "rooms"), where("code", "==", inputCode.toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("Salle introuvable. Vérifie le code !");
        setLoading(false);
        return;
      }

      const roomDoc = snap.docs[0];
      const roomData = roomDoc.data();

      if (roomData.status !== "waiting") {
        setError("Cette partie a déjà commencé !");
        setLoading(false);
        return;
      }

      if (roomData.players?.length >= 8) {
        setError("La salle est pleine (8 joueurs max) !");
        setLoading(false);
        return;
      }

      // Vérifie si déjà dans la salle
      const alreadyIn = roomData.players?.some((p: any) => p.id === user.id);
      if (!alreadyIn) {
        await updateDoc(doc(db, "rooms", roomDoc.id), {
          players: arrayUnion({
            id: user.id,
            name: user.firstName || "Joueur",
            avatar: user.imageUrl || "",
          }),
        });
      }

      router.push(`/room/${roomDoc.id}`);
    } catch (e) {
      setError("Erreur de connexion. Réessaie !");
    } finally {
      setLoading(false);
    }
  };

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
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .blob { animation: blob 7s ease-in-out infinite; }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        .spin { animation: spin 1s linear infinite; }

        .btn-main {
          transition: all 0.1s;
          box-shadow: 0 6px 0 #C94E1E;
          background: #FF6B35;
        }
        .btn-main:hover { transform: translateY(3px); box-shadow: 0 3px 0 #C94E1E; }
        .btn-main:active { transform: translateY(6px); box-shadow: none; }
        .btn-main:disabled { opacity: 0.6; transform: none; box-shadow: 0 6px 0 #C94E1E; }

        .btn-green {
          transition: all 0.1s;
          box-shadow: 0 6px 0 #2e8c4a;
          background: #4CAF50;
        }
        .btn-green:hover { transform: translateY(3px); box-shadow: 0 3px 0 #2e8c4a; }
        .btn-green:active { transform: translateY(6px); box-shadow: none; }
        .btn-green:disabled { opacity: 0.6; transform: none; }

        .btn-blue {
          transition: all 0.1s;
          box-shadow: 0 6px 0 #2d6fcc;
          background: #4D96FF;
        }
        .btn-blue:hover { transform: translateY(3px); box-shadow: 0 3px 0 #2d6fcc; }
        .btn-blue:active { transform: translateY(6px); box-shadow: none; }
        .btn-blue:disabled { opacity: 0.6; transform: none; }

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

        .code-display {
          background: #FFF8F0;
          border: 3px dashed #FF6B35;
          border-radius: 1rem;
          letter-spacing: 0.3em;
        }

        .input-field {
          background: #FFF8F0;
          border: 2px solid #f0e0cc;
          border-radius: 0.75rem;
          outline: none;
          transition: border-color 0.2s;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .input-field:focus { border-color: #FF6B35; }

        .mode-btn {
          transition: all 0.15s;
          border: 2px solid #f0e0cc;
        }
        .mode-btn:hover { transform: translateY(-2px); }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-80 h-80 bg-[#FFD93D] opacity-20 -top-20 -right-20" />
        <div className="blob absolute w-72 h-72 bg-[#6BCB77] opacity-15 -bottom-20 -left-20" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6 pt-12 pb-10">

        {/* Header */}
        <div className="fade-up w-full flex items-center gap-3 mb-8" style={{ animationDelay: "0.1s" }}>
          <button
            onClick={() => mode === "menu" ? router.push("/") : setMode("menu")}
            className="btn-back rounded-xl px-3 py-2 text-xl"
          >
            ←
          </button>
          <h1 className="font-display text-3xl text-[#2D2D2D]">🎮 Jouer</h1>
        </div>

        {/* ── MENU PRINCIPAL ── */}
        {mode === "menu" && (
          <>
            <div className="fade-up text-center mb-8" style={{ animationDelay: "0.2s" }}>
              <p className="font-display text-2xl text-[#2D2D2D]">Choisis ton mode</p>
              <p className="text-[#bbb] text-sm mt-1">Solo ou avec des amis ?</p>
            </div>

            {/* Solo */}
            <div className="fade-up w-full max-w-xs mb-3" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={() => router.push("/home/solo")}
                className="mode-btn w-full bg-white rounded-2xl p-4 text-left"
                style={{ boxShadow: "0 6px 0 #e8d5bf" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FFF8F0] rounded-xl flex items-center justify-center text-3xl border-2 border-[#f0e0cc]">
                    🤖
                  </div>
                  <div>
                    <p className="font-display text-xl text-[#2D2D2D]">Solo vs IA</p>
                    <p className="text-xs text-[#999] font-semibold">Joue contre l'intelligence artificielle</p>
                    <span className="inline-block mt-1 text-[10px] font-bold bg-[#6BCB77] text-white px-2 py-0.5 rounded-full">
                      🟢 Disponible
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Créer salle */}
            <div className="fade-up w-full max-w-xs mb-3" style={{ animationDelay: "0.35s" }}>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="mode-btn w-full bg-white rounded-2xl p-4 text-left"
                style={{ boxShadow: "0 6px 0 #e8d5bf" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FFF8F0] rounded-xl flex items-center justify-center text-3xl border-2 border-[#f0e0cc]">
                    {loading ? <span className="spin text-2xl">⏳</span> : "🏠"}
                  </div>
                  <div>
                    <p className="font-display text-xl text-[#2D2D2D]">Créer une salle</p>
                    <p className="text-xs text-[#999] font-semibold">Invite tes amis avec un code</p>
                    <span className="inline-block mt-1 text-[10px] font-bold bg-[#FF6B35] text-white px-2 py-0.5 rounded-full">
                      👥 Multijoueur
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Rejoindre salle */}
            <div className="fade-up w-full max-w-xs mb-6" style={{ animationDelay: "0.4s" }}>
              <button
                onClick={() => { setMode("join"); setError(""); }}
                className="mode-btn w-full bg-white rounded-2xl p-4 text-left"
                style={{ boxShadow: "0 6px 0 #e8d5bf" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#FFF8F0] rounded-xl flex items-center justify-center text-3xl border-2 border-[#f0e0cc]">
                    🔑
                  </div>
                  <div>
                    <p className="font-display text-xl text-[#2D2D2D]">Rejoindre</p>
                    <p className="text-xs text-[#999] font-semibold">Entre le code d'une salle</p>
                    <span className="inline-block mt-1 text-[10px] font-bold bg-[#4D96FF] text-white px-2 py-0.5 rounded-full">
                      🔗 Rejoindre
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {error && (
              <div className="fade-up w-full max-w-xs">
                <div className="bg-[#FFE5E5] border-2 border-[#ffb3b3] rounded-xl p-3 text-center">
                  <p className="text-[#E63946] text-sm font-bold">⚠️ {error}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── SALLE CRÉÉE ── */}
        {mode === "create" && (
          <>
            <div className="fade-up text-center mb-6" style={{ animationDelay: "0.2s" }}>
              <p className="text-[#999] text-sm font-semibold uppercase tracking-widest mb-1">Salle créée !</p>
              <p className="font-display text-2xl text-[#2D2D2D]">Partage ce code 🎉</p>
            </div>

            <div className="fade-up w-full max-w-xs mb-6" style={{ animationDelay: "0.3s" }}>
              <div className="code-display py-6 text-center">
                <p className="font-display text-5xl text-[#FF6B35] pulse">{roomCode}</p>
                <p className="text-xs text-[#999] mt-2 font-semibold">Code à partager avec tes amis</p>
              </div>
            </div>

            <div className="fade-up card w-full max-w-xs p-4 mb-6" style={{ animationDelay: "0.4s" }}>
              <p className="font-display text-sm text-[#2D2D2D] mb-3">👥 Joueurs (1/8)</p>
              <div className="flex items-center gap-3">
                {user?.imageUrl && (
                  <img src={user.imageUrl} alt="avatar" className="w-9 h-9 rounded-full border-2 border-[#FF6B35]" />
                )}
                <div>
                  <p className="font-bold text-[#2D2D2D] text-sm">{user?.firstName} <span className="text-[#FF6B35] text-xs font-bold">👑 Hôte</span></p>
                  <p className="text-xs text-[#999]">En attente des autres joueurs…</p>
                </div>
              </div>
            </div>

            <div className="fade-up w-full max-w-xs flex flex-col gap-3" style={{ animationDelay: "0.5s" }}>
              <button
                onClick={() => router.push(`/play/lobby?code=${roomCode}`)}
                className="btn-green w-full rounded-2xl py-4 text-white font-display text-xl text-center"
              >
                🚀 Lancer la partie
              </button>
              <button
                onClick={() => { setMode("menu"); setRoomCode(""); }}
                className="btn-ghost w-full rounded-2xl py-3 text-[#2D2D2D] font-display text-base text-center"
              >
                Annuler
              </button>
            </div>
          </>
        )}

        {/* ── REJOINDRE UNE SALLE ── */}
        {mode === "join" && (
          <>
            <div className="fade-up text-center mb-6" style={{ animationDelay: "0.2s" }}>
              <p className="text-[#999] text-sm font-semibold uppercase tracking-widest mb-1">Multijoueur</p>
              <p className="font-display text-2xl text-[#2D2D2D]">Entre le code 🔑</p>
            </div>

            <div className="fade-up w-full max-w-xs mb-4" style={{ animationDelay: "0.3s" }}>
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => { setInputCode(e.target.value); setError(""); }}
                placeholder="ABC123"
                className="input-field w-full py-5 px-4 font-display text-3xl text-center text-[#2D2D2D]"
              />
            </div>

            {error && (
              <div className="fade-up w-full max-w-xs mb-4" style={{ animationDelay: "0.1s" }}>
                <div className="bg-[#FFE5E5] border-2 border-[#ffb3b3] rounded-xl p-3 text-center">
                  <p className="text-[#E63946] text-sm font-bold">⚠️ {error}</p>
                </div>
              </div>
            )}

            <div className="fade-up w-full max-w-xs flex flex-col gap-3" style={{ animationDelay: "0.4s" }}>
              <button
                onClick={handleJoinRoom}
                disabled={loading || inputCode.length < 6}
                className="btn-blue w-full rounded-2xl py-4 text-white font-display text-xl text-center"
              >
                {loading ? "⏳ Connexion…" : "🔗 Rejoindre"}
              </button>
              <button
                onClick={() => { setMode("menu"); setError(""); setInputCode(""); }}
                className="btn-ghost w-full rounded-2xl py-3 text-[#2D2D2D] font-display text-base text-center"
              >
                Retour
              </button>
            </div>
          </>
        )}

      </div>
    </main>
  );
}
