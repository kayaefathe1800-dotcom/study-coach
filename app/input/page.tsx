"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/lib/study/sessionStore";

type Tab = "photo" | "text";

export default function InputPage() {
  const [tab, setTab] = useState<Tab>("photo");
  const [textInput, setTextInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  async function handleStart() {
    setError(null);
    setLoading(true);
    try {
      let problem = textInput.trim();

      if (tab === "photo") {
        if (!imageBase64) {
          setError("写真を選んでください");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "extract",
            imageBase64,
            imageMimeType,
            messages: [],
            problem: "",
          }),
        });
        const data = await res.json();
        problem = data.problem ?? "";
        if (!problem) {
          setError("問題文を読み取れませんでした。テキスト入力で試してください。");
          setLoading(false);
          return;
        }
      }

      if (!problem) {
        setError("問題を入力してください");
        setLoading(false);
        return;
      }

      saveSession({ problem, startedAt: new Date().toISOString() });
      router.push("/session");
    } catch {
      setError("エラーが発生しました。もう一度試してください。");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white text-lg transition"
        >
          ←
        </button>
        <h1 className="font-bold text-white">📝 問題を入力</h1>
      </div>

      <div className="max-w-sm mx-auto px-4 pt-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-2">
          {(["photo", "text"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${
                tab === t
                  ? "bg-green-700 text-white shadow"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {t === "photo" ? "📸 写真" : "✍️ テキスト"}
            </button>
          ))}
        </div>

        {/* Photo Tab */}
        {tab === "photo" && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            {imagePreview ? (
              <div>
                <img
                  src={imagePreview}
                  alt="問題の写真"
                  className="w-full rounded-xl border border-gray-600 object-contain max-h-64"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageBase64(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="mt-2 text-xs text-gray-400 hover:text-white transition"
                >
                  やり直す
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-600 hover:border-green-500
                  rounded-xl p-12 flex flex-col items-center gap-3 text-gray-400
                  hover:text-green-400 transition"
              >
                <span className="text-5xl">📷</span>
                <span className="text-sm font-medium">タップして撮影 / 選択</span>
                <span className="text-xs text-gray-600">
                  スマホなら直接カメラが開きます
                </span>
              </button>
            )}
          </div>
        )}

        {/* Text Tab */}
        {tab === "text" && (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="問題文を入力してください&#10;例: x + 5 = 12 のとき、x の値を求めよ"
            rows={7}
            className="w-full bg-gray-800 border border-gray-600 rounded-xl p-4 text-white
              placeholder-gray-500 resize-none focus:outline-none focus:border-green-500
              text-sm leading-relaxed"
          />
        )}

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700
            hover:from-green-500 hover:to-emerald-600
            disabled:opacity-50 disabled:cursor-not-allowed
            rounded-xl py-4 font-bold text-lg transition active:scale-95 shadow-lg"
        >
          {loading ? "読み取り中..." : "⚔️ クエスト開始！"}
        </button>
      </div>
    </main>
  );
}
