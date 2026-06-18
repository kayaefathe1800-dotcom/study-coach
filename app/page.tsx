"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CharacterDisplay from "@/components/study/CharacterDisplay";
import { loadGameState } from "@/lib/study/gameStore";
import { clearSession } from "@/lib/study/sessionStore";
import { GameState } from "@/lib/study/types";

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const router = useRouter();

  useEffect(() => {
    setGameState(loadGameState());
    clearSession();
  }, []);

  if (!gameState) return null;

  const recent = gameState.sessions.slice(-5).reverse();

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-10">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-30">
        <h1 className="font-bold text-lg text-yellow-400 tracking-wider">
          📚 STUDY QUEST
        </h1>
      </div>

      <div className="max-w-sm mx-auto px-4 pt-6 space-y-5">
        {/* Character Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <CharacterDisplay gameState={gameState} />
        </div>

        {/* Start Button */}
        <button
          onClick={() => router.push("/input")}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700
            hover:from-green-500 hover:to-emerald-600 active:scale-95
            rounded-2xl p-6 text-center transition border border-white/10 shadow-lg"
        >
          <div className="text-4xl mb-2">📸</div>
          <p className="font-bold text-white text-xl">今日の問題を解く</p>
          <p className="text-white/60 text-sm mt-1">写真 or テキストで入力</p>
        </button>

        {/* Recent Sessions */}
        {recent.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
            <h2 className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">
              📜 最近のセッション
            </h2>
            <div className="space-y-2">
              {recent.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-800 rounded-xl px-3 py-2.5"
                >
                  <div className="min-w-0 mr-3">
                    <p className="text-white text-sm font-medium truncate">
                      {s.problemPreview}
                    </p>
                    <p className="text-gray-500 text-xs">{s.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base">{["⭐", "⭐⭐", "⭐⭐⭐"][s.stars - 1]}</p>
                    <p className="text-green-400 text-xs">+{s.xpEarned} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
