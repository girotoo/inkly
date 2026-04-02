"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifs, setNotifs] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [music, setMusic] = useState(false);

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

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-up");
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-all duration-200 ${value ? "bg-[#FF6B35]" : "bg-[#e0d0c0]"}`}
      style={{ boxShadow: value ? "0 3px 0 #C94E1E" : "0 3px 0 #c4b0a0" }}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? "left-7" : "left-1"}`}
      />
    </button>
  );

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

        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .blob { animation: blob 7s ease-in-out infinite; }

        .btn-back {
          transition: all 0.1s;
          box-shadow: 0 4px 0 #d1c4b0;
          background: white;
        }
        .btn-back:hover { transform: translateY(2px); box-shadow: 0 2px 0 #d1c4b0; }
        .btn-back:active { transform: translateY(4px); box-shadow: none; }

        .btn-danger {
          transition: all 0.1s;
          box-shadow: 0 5px 0 #b52020;
          background: #E63946;
        }
        .btn-danger:hover { transform: translateY(2px); box-shadow: 0 3px 0 #b52020; }
        .btn-danger:active { transform: translateY(5px); box-shadow: none; }

        .card {
          background: white;
          border-radius: 1rem;
          border: 2px solid #f0e0cc;
          box-shadow: 0 6px 0 #e8d5bf;
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-80 h-80 bg-[#FFD93D] opacity-20 -top-20 -right-20" />
        <div className="blob absolute w-72 h-72 bg-[#6BCB77] opacity-15 -bottom-20 -left-20" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6 pt-12 pb-10">

        {/* Header */}
        <div className="fade-up w-full flex items-center gap-3 mb-8" style={{ animationDelay: "0.1s" }}>
          <button onClick={() => router.push("/")} className="btn-back rounded-xl px-3 py-2 text-xl">
            ←
          </button>
          <h1 className="font-display text-3xl text-[#2D2D2D]">⚙️ Réglages</h1>
        </div>

        {/* Profile card */}
        <div className="fade-up card w-full max-w-xs p-5 mb-4" style={{ animationDelay: "0.2s" }}>
          <p className="font-display text-base text-[#2D2D2D] mb-4">👤 Profil</p>
          <div className="flex items-center gap-4">
            {user?.imageUrl && (
              <img
                src={user.imageUrl}
                alt="avatar"
                className="w-14 h-14 rounded-full border-2 border-[#f0e0cc] shadow"
              />
            )}
            <div>
              <p className="font-display text-xl text-[#2D2D2D]">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-[#999]">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </div>

        {/* Sound settings */}
        <div className="fade-up card w-full max-w-xs p-5 mb-4" style={{ animationDelay: "0.3s" }}>
          <p className="font-display text-base text-[#2D2D2D] mb-4">🔊 Audio</p>
          <div className="space-y-4">
            {[
              { label: "Effets sonores", sub: "Sons du jeu", value: sounds, set: () => setSounds(!sounds) },
              { label: "Musique", sub: "Musique de fond", value: music, set: () => setMusic(!music) },
              { label: "Notifications", sub: "Alertes et rappels", value: notifs, set: () => setNotifs(!notifs) },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#2D2D2D] text-sm">{item.label}</p>
                  <p className="text-xs text-[#999]">{item.sub}</p>
                </div>
                <Toggle value={item.value} onChange={item.set} />
              </div>
            ))}
          </div>
        </div>

        {/* App info */}
        <div className="fade-up card w-full max-w-xs p-5 mb-4" style={{ animationDelay: "0.4s" }}>
          <p className="font-display text-base text-[#2D2D2D] mb-3">📱 Application</p>
          <div className="space-y-2">
            {[
              { label: "Version", value: "1.0.0" },
              { label: "Développeur", value: "Inkly Team" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <p className="text-sm font-semibold text-[#999]">{item.label}</p>
                <p className="text-sm font-bold text-[#2D2D2D]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="fade-up w-full max-w-xs mt-2" style={{ animationDelay: "0.5s" }}>
          <button onClick={handleSignOut} className="btn-danger w-full rounded-2xl py-4 text-white font-display text-xl text-center">
            🚪 Se déconnecter
          </button>
        </div>

      </div>
    </main>
  );
}
