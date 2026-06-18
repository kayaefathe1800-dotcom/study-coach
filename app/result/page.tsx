"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  loadResult,
  loadSession,
  clearSession,
} from "@/lib/study/sessionStore";
import {
  loadGameState,
  saveGameState,
  addXP,
  addCoins,
  updateStreak,
} from "@/lib/study/gameStore";
import { EvalResult, GameState } from "@/lib/study/types";

export default function ResultPage() {
  const [result, setResult] = useState<EvalResult | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [xpFloat, setXpFloat] = useState(false);
  const router = useRouter();
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    const evalResult = loadResult();
    const session = loadSession();
    if (!evalResult || !session) {
      router.replace("/");
      return;
    }
    setResult(evalResult);

    const gs = loadGameState();
    const prevLevel = gs.level;
    let newState = updateStreak(gs);
    newState = addXP(newState, evalResult.xpEarned);
    newState = addCoins(newState, evalResult.stars * 5);
    newState = {
      ...newState,
      sessions: [
        ...newState.sessions.slice(-29),
        {
          date: new Date().toLocaleDateString("ja-JP"),
          stars: evalResult.stars,
          xpEarned: evalResult.xpEarned,
          problemPreview: session.problem.slice(0, 30),
        },
      ],
    };

    saveGameState(newState);
    setGameState(newState);

    setXpFloat(true);
    setTimeout(() => setXpFloat(false), 1200);

    if (newState.level > prevLevel) {
      setIsLevelingUp(true);
      setTimeout(() => setIsLevelingUp(false), 2500);
    }
  }, [router]);

  if (!result || !gameState) return null;

  const STARS = ["", "⭐", "⭐⭐", "⭐⭐⭐"] as const;
  const GRADE_COLOR = {
    A: "text-green-400",
    B: "text-yellow-400",
    C: "text-red-400",
  } as const;

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Level Up Overlay */}
      {isLevelingUp && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="animate-levelup text-center">
            <p className="text-5xl font-black text-yellow-400 drop-shadow-lg">
              LEVEL UP!
            </p>
            <p className="text-2xl font-bold text-white mt-2">
              Lv. {gameState.level}
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm space-y-4">
        {/* Stars & Comment */}
        <div className="text-center">
          <p className="text-green-400 font-bold text-xs tracking-widest uppercase mb-3">
            Quest Complete!
          </p>
          <div className="text-5xl mb-3">{STARS[result.stars]}</div>
          <p className="text-white font-bold text-lg leading-snug">
            {result.comment}
          </p>
        </div>

        {/* Feedback Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">粘り強さ</span>
            <span className={`font-bold text-sm ${GRADE_COLOR[result.feedback.粘り強さ]}`}>
              {result.feedback.粘り強さ}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">考え方</span>
            <span className={`font-bold text-sm ${GRADE_COLOR[result.feedback.考え方]}`}>
              {result.feedback.考え方}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">ヒント使用</span>
            <span className="text-gray-300 text-sm font-bold">
              {result.feedback.ヒント使用数}回
            </span>
          </div>
        </div>

        {/* XP Gained */}
        <div className="bg-gray-800 border border-green-800 rounded-2xl p-4 text-center relative overflow-hidden">
          {xpFloat && (
            <span className="absolute top-2 right-4 text-green-300 font-black text-xl animate-float-up pointer-events-none">
              +{result.xpEarned}
            </span>
          )}
          <p className="text-green-400 text-xs font-bold mb-1">獲得XP</p>
          <p className="text-4xl font-black text-green-400">
            +{result.xpEarned} XP
          </p>
          <p className="text-gray-500 text-xs mt-1">
            🪙 +{result.stars * 5} コイン
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => { clearSession(); router.push("/input"); }}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700
              hover:from-green-500 hover:to-emerald-600 active:scale-95
              rounded-xl py-3.5 font-bold text-white transition shadow"
          >
            ⚔️ もう1問やる！
          </button>
          <button
            onClick={() => { clearSession(); router.push("/"); }}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600
              rounded-xl py-3.5 font-bold text-gray-300 transition"
          >
            🏠 ホームへ戻る
          </button>
        </div>
      </div>
    </main>
  );
}
