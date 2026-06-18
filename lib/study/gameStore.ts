import { GameState } from "./types";

const STORAGE_KEY = "study-coach-game";

export const LEVEL_THRESHOLDS = [0, 50, 120, 220, 350, 520, 730, 990, 1300, 1700];

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return Math.min(level, 10);
}

const defaultState: GameState = {
  xp: 0,
  level: 1,
  coins: 0,
  streak: 0,
  lastStudiedDate: null,
  selectedCharacter: "brave",
  sessions: [],
};

export function loadGameState(): GameState {
  if (typeof window === "undefined") return { ...defaultState };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultState, ...JSON.parse(stored) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addXP(state: GameState, amount: number): GameState {
  const newXP = state.xp + amount;
  return { ...state, xp: newXP, level: getLevelFromXP(newXP) };
}

export function addCoins(state: GameState, amount: number): GameState {
  return { ...state, coins: state.coins + amount };
}

export function updateStreak(state: GameState): GameState {
  const today = new Date().toDateString();
  if (state.lastStudiedDate === today) return state;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isConsecutive = state.lastStudiedDate === yesterday.toDateString();
  return {
    ...state,
    streak: isConsecutive ? state.streak + 1 : 1,
    lastStudiedDate: today,
  };
}
