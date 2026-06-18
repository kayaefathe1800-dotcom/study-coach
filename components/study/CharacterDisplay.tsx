"use client";
import { GameState } from "@/lib/study/types";
import { getStageForLevel } from "@/lib/study/characters";
import { LEVEL_THRESHOLDS } from "@/lib/study/gameStore";

interface Props {
  gameState: GameState;
  isLevelingUp?: boolean;
  onChangeChar?: () => void;
}

export default function CharacterDisplay({
  gameState,
  isLevelingUp,
  onChangeChar,
}: Props) {
  const stage = getStageForLevel(gameState.selectedCharacter, gameState.level);

  const currentThreshold = LEVEL_THRESHOLDS[gameState.level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[gameState.level] ?? 9999;
  const xpInLevel = gameState.xp - currentThreshold;
  const xpRange = nextThreshold - currentThreshold;
  const progressPct = Math.min(100, Math.max(0, (xpInLevel / xpRange) * 100));

  return (
    <div className="flex items-center gap-4">
      <div
        className={`text-6xl select-none transition-all ${
          isLevelingUp ? "animate-char-bounce" : ""
        }`}
      >
        {stage.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-yellow-400 font-bold text-xl">
            Lv.{gameState.level}
          </span>
          <span className="text-gray-400 text-sm">{stage.stageName}</span>
          {onChangeChar && (
            <button
              onClick={onChangeChar}
              className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition"
            >
              変更
            </button>
          )}
        </div>

        <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-0.5">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{gameState.xp} XP</span>
          <span>次のLv: {nextThreshold} XP</span>
        </div>

        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-yellow-300">🪙 {gameState.coins}</span>
          {gameState.streak > 0 && (
            <span className="text-orange-400">🔥 {gameState.streak}日連続</span>
          )}
        </div>
      </div>
    </div>
  );
}
