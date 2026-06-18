"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadSession, saveMessages, saveResult } from "@/lib/study/sessionStore";
import { ChatMessage } from "@/lib/study/types";

export default function SessionPage() {
  const [problem, setProblem] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [ending, setEnding] = useState(false);
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const initiated = useRef(false);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      router.replace("/");
      return;
    }
    setProblem(session.problem);
  }, [router]);

  const streamChat = useCallback(
    async (
      userText: string,
      currentProblem: string,
      currentMessages: ChatMessage[]
    ) => {
      const newMessages: ChatMessage[] = [
        ...currentMessages,
        { role: "user", content: userText },
      ];
      setMessages(newMessages);
      setStreamingText("");
      setIsStreaming(true);

      let aiText = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            problem: currentProblem,
            mode: "coaching",
          }),
        });

        if (!res.ok) throw new Error("API error");

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aiText += decoder.decode(value, { stream: true });
          setStreamingText(aiText);
        }
      } finally {
        setIsStreaming(false);
        setStreamingText("");
        const finalMessages: ChatMessage[] = [
          ...newMessages,
          { role: "assistant", content: aiText },
        ];
        setMessages(finalMessages);
        saveMessages(finalMessages);
      }
    },
    []
  );

  useEffect(() => {
    if (problem && !initiated.current) {
      initiated.current = true;
      streamChat("よろしく！今日の問題を始めよう！", problem, []);
    }
  }, [problem, streamChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  function handleSend() {
    if (!input.trim() || isStreaming || !problem) return;
    const text = input.trim();
    setInput("");
    streamChat(text, problem, messages);
  }

  function handleHint(level: 1 | 2 | 3) {
    if (isStreaming || !problem) return;
    setHintCount((c) => c + 1);
    const texts: Record<1 | 2 | 3, string> = {
      1: "ヒント1をください",
      2: "もう少し大きいヒントをください",
      3: "答えと解き方を全部教えてください",
    };
    streamChat(texts[level], problem, messages);
  }

  async function handleEnd() {
    if (!problem || isStreaming || messages.length < 2) return;
    setEnding(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, problem, mode: "evaluate", hintCount }),
      });
      const result = await res.json();
      saveResult(result);
      router.push("/result");
    } catch {
      setEnding(false);
    }
  }

  const displayMessages = messages.slice(1);

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <h1 className="font-bold text-white text-sm">💬 コーチと対話</h1>
        <button
          onClick={handleEnd}
          disabled={ending || isStreaming || messages.length < 4}
          className="bg-green-700 hover:bg-green-600 disabled:opacity-40
            disabled:cursor-not-allowed text-white text-xs font-bold
            px-3 py-1.5 rounded-lg transition"
        >
          {ending ? "評価中..." : "セッション終了"}
        </button>
      </div>

      {/* Problem Card */}
      <div className="mx-4 mt-4 bg-gray-800 border-l-4 border-blue-500 rounded-xl p-3 flex-shrink-0">
        <p className="text-xs text-blue-400 font-bold mb-1">📌 今日の問題</p>
        <p className="text-white text-sm leading-relaxed">{problem}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {displayMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-green-700 text-white"
                  : "bg-gray-800 text-gray-100 border-l-2 border-green-500"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-gray-800 border-l-2 border-green-500 rounded-2xl px-4 py-3 text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">
              {streamingText || (
                <span className="text-gray-500 animate-pulse">考え中...</span>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Hint Buttons */}
      <div className="px-4 pb-2 flex gap-2 flex-shrink-0">
        {([1, 2, 3] as const).map((level) => (
          <button
            key={level}
            onClick={() => handleHint(level)}
            disabled={isStreaming}
            className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-40
              border border-gray-600 rounded-lg py-2 text-xs text-gray-300 transition"
          >
            {level === 3 ? "🏳️ 答えを見る" : `💡 ヒント${level}`}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="考えを入力..."
          disabled={isStreaming}
          className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm
            text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          className="bg-green-700 hover:bg-green-600 disabled:opacity-40
            disabled:cursor-not-allowed text-white font-bold px-4 rounded-xl transition"
        >
          送信
        </button>
      </div>
    </main>
  );
}
