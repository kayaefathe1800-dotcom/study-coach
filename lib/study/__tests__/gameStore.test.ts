import { describe, it, expect } from "vitest";
import {
  getLevelFromXP,
  addXP,
  addCoins,
  updateStreak,
  LEVEL_THRESHOLDS,
} from "../gameStore";
import { GameState } from "../types";

const base: GameState = {
  xp: 0,
  level: 1,
  coins: 0,
  streak: 0,
  lastStudiedDate: null,
  selectedCharacter: "brave",
  sessions: [],
};

describe("getLevelFromXP", () => {
  it("0 XP はレベル1", () => {
    expect(getLevelFromXP(0)).toBe(1);
  });
  it("50 XP でレベル2", () => {
    expect(getLevelFromXP(50)).toBe(2);
  });
  it("49 XP はまだレベル1", () => {
    expect(getLevelFromXP(49)).toBe(1);
  });
  it("最大レベルは10", () => {
    expect(getLevelFromXP(9999)).toBe(10);
  });
  it("各境界値でレベルが正しく上がる", () => {
    LEVEL_THRESHOLDS.slice(1).forEach((xp, i) => {
      expect(getLevelFromXP(xp)).toBe(i + 2);
    });
  });
});

describe("addXP", () => {
  it("XP が加算されレベルが再計算される", () => {
    const next = addXP({ ...base, xp: 40 }, 20);
    expect(next.xp).toBe(60);
    expect(next.level).toBe(2);
  });
  it("レベルは10を超えない", () => {
    const next = addXP({ ...base, xp: 2200 }, 100);
    expect(next.level).toBe(10);
  });
});

describe("addCoins", () => {
  it("コインが加算される", () => {
    expect(addCoins({ ...base, coins: 10 }, 5).coins).toBe(15);
  });
});

describe("updateStreak", () => {
  it("初回は連続1日", () => {
    expect(updateStreak(base).streak).toBe(1);
  });
  it("同日に2回呼んでも変わらない", () => {
    const today = new Date().toDateString();
    const s = updateStreak({ ...base, streak: 5, lastStudiedDate: today });
    expect(s.streak).toBe(5);
  });
  it("前日から連続なら +1", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const s = updateStreak({ ...base, streak: 3, lastStudiedDate: yesterday.toDateString() });
    expect(s.streak).toBe(4);
  });
  it("2日以上空いたらリセットして1", () => {
    const old = new Date();
    old.setDate(old.getDate() - 2);
    const s = updateStreak({ ...base, streak: 10, lastStudiedDate: old.toDateString() });
    expect(s.streak).toBe(1);
  });
});
