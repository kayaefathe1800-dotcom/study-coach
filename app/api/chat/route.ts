import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { coachSystemPrompt, EVALUATE_PROMPT } from "@/lib/study/systemPrompt";
import { ChatMessage } from "@/lib/study/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ChatRequest {
  messages: ChatMessage[];
  problem: string;
  mode: "coaching" | "evaluate" | "extract";
  imageBase64?: string;
  imageMimeType?: string;
  hintCount?: number;
}

export async function POST(req: NextRequest) {
  const body: ChatRequest = await req.json();
  const { messages, problem, mode, imageBase64, imageMimeType, hintCount = 0 } = body;

  if (mode === "extract") {
    if (!imageBase64) {
      return Response.json({ error: "imageBase64 required" }, { status: 400 });
    }
    const mimeType = (imageMimeType ?? "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/gif";

    const res = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: imageBase64 },
            },
            {
              type: "text",
              text: "この画像に写っている数学の問題文を正確にテキストで書き出してください。数式もそのまま表記してください。問題文だけを返してください。",
            },
          ],
        },
      ],
    });
    const text = res.content[0].type === "text" ? res.content[0].text : "";
    return Response.json({ problem: text });
  }

  if (mode === "evaluate") {
    const conversation = messages
      .map((m) => `${m.role === "user" ? "生徒" : "コーチ"}: ${m.content}`)
      .join("\n");

    const res = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `問題: ${problem}\n\nヒントボタンが押された回数: ${hintCount}\n\n会話履歴:\n${conversation}\n\n${EVALUATE_PROMPT}`,
        },
      ],
    });

    const raw = res.content[0].type === "text" ? res.content[0].text.trim() : "{}";
    try {
      return Response.json(JSON.parse(raw));
    } catch {
      return Response.json({
        stars: 2,
        comment: "よくがんばった！次も一緒に挑戦しよう！💪",
        feedback: { 粘り強さ: "B", 考え方: "B", ヒント使用数: hintCount },
        xpEarned: 30,
      });
    }
  }

  const stream = client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: coachSystemPrompt(problem),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
