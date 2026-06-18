import { SessionData, ChatMessage, EvalResult } from "./types";

const PROBLEM_KEY = "study-coach-session";
const MESSAGES_KEY = "study-coach-messages";
const RESULT_KEY = "study-coach-result";

export function saveSession(data: SessionData): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PROBLEM_KEY, JSON.stringify(data));
}

export function loadSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(PROBLEM_KEY);
    return s ? (JSON.parse(s) as SessionData) : null;
  } catch {
    return null;
  }
}

export function saveMessages(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const s = sessionStorage.getItem(MESSAGES_KEY);
    return s ? (JSON.parse(s) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveResult(result: EvalResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadResult(): EvalResult | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(RESULT_KEY);
    return s ? (JSON.parse(s) as EvalResult) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PROBLEM_KEY);
  sessionStorage.removeItem(MESSAGES_KEY);
  sessionStorage.removeItem(RESULT_KEY);
}
