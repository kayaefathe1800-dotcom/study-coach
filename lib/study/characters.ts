import { CharacterId } from "./types";

export interface CharacterStage {
  minLevel: number;
  maxLevel: number;
  stageName: string;
  emoji: string;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  emoji: string;
  description: string;
  color: string;
  stages: CharacterStage[];
}

export const CHARACTER_DEFS: CharacterDef[] = [
  {
    id: "brave",
    name: "勇者",
    emoji: "⚔️",
    description: "真っ向から挑む熱血タイプ！",
    color: "from-yellow-500 to-orange-600",
    stages: [
      { minLevel: 1,  maxLevel: 2,  stageName: "たまご",  emoji: "🥚" },
      { minLevel: 3,  maxLevel: 4,  stageName: "ひよこ",  emoji: "🐣" },
      { minLevel: 5,  maxLevel: 6,  stageName: "見習い",  emoji: "🧒" },
      { minLevel: 7,  maxLevel: 8,  stageName: "勇者",    emoji: "🦸" },
      { minLevel: 9,  maxLevel: 10, stageName: "大勇者",  emoji: "👑" },
    ],
  },
  {
    id: "wizard",
    name: "魔法使い",
    emoji: "🔮",
    description: "知識と魔法で世界を変える！",
    color: "from-purple-500 to-indigo-700",
    stages: [
      { minLevel: 1,  maxLevel: 2,  stageName: "たまご",        emoji: "🥚" },
      { minLevel: 3,  maxLevel: 4,  stageName: "ひな",          emoji: "🐤" },
      { minLevel: 5,  maxLevel: 6,  stageName: "見習い魔法使い", emoji: "🧙" },
      { minLevel: 7,  maxLevel: 8,  stageName: "魔法使い",       emoji: "🔮" },
      { minLevel: 9,  maxLevel: 10, stageName: "大賢者",         emoji: "⭐" },
    ],
  },
  {
    id: "ninja",
    name: "忍者",
    emoji: "🥷",
    description: "素早さと冷静さで切り抜ける！",
    color: "from-gray-600 to-gray-900",
    stages: [
      { minLevel: 1,  maxLevel: 2,  stageName: "たまご",     emoji: "🥚" },
      { minLevel: 3,  maxLevel: 4,  stageName: "ひよこ",     emoji: "🐥" },
      { minLevel: 5,  maxLevel: 6,  stageName: "見習い忍者", emoji: "🥷" },
      { minLevel: 7,  maxLevel: 8,  stageName: "上忍",       emoji: "🗡️" },
      { minLevel: 9,  maxLevel: 10, stageName: "影の王",     emoji: "💀" },
    ],
  },
];

export function getCharacterDef(id: CharacterId): CharacterDef {
  return CHARACTER_DEFS.find((c) => c.id === id) ?? CHARACTER_DEFS[0];
}

export function getStageForLevel(charId: CharacterId, level: number): CharacterStage {
  const def = getCharacterDef(charId);
  return (
    def.stages.find((s) => level >= s.minLevel && level <= s.maxLevel) ??
    def.stages[0]
  );
}
