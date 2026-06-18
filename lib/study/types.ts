export type CharacterId = "brave" | "wizard" | "ninja";
export type Stars = 1 | 2 | 3;

export interface GameState {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  lastStudiedDate: string | null;
  selectedCharacter: CharacterId;
  sessions: SessionSummary[];
}

export interface SessionSummary {
  date: string;
  stars: Stars;
  xpEarned: number;
  problemPreview: string;
}

export interface SessionData {
  problem: string;
  startedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface EvalResult {
  stars: Stars;
  comment: string;
  feedback: {
    粘り強さ: "A" | "B" | "C";
    考え方: "A" | "B" | "C";
    ヒント使用数: number;
  };
  xpEarned: number;
}
