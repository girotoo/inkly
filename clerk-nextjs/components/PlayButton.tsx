"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function PlayButton() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleClick = () => {
    if (isSignedIn) {
      router.push("/home"); // connecté → va à /home
    } else {
      router.push("/sign-up"); // pas connecté → va à /sign-up
    }
  };

  return (
    <button
      onClick={handleClick}
      className="btn-play rounded-2xl py-4 px-8 text-white font-display text-2xl w-full text-center"
    >
      🎮 Jouer maintenant
    </button>
  );
}