import { NextRequest, NextResponse } from "next/server";
import { parseVoiceTranscript } from "@/lib/voice-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = (await req.json()) as { transcript?: string };
    if (!transcript?.trim()) {
      return NextResponse.json({ error: "缺少語音內容" }, { status: 400 });
    }

    const heuristic = parseVoiceTranscript(transcript);

    // Optional LLM enhancement when OPENAI_API_KEY is set
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      try {
        const enhanced = await enhanceWithLLM(transcript, key);
        return NextResponse.json({
          ...heuristic,
          ...Object.fromEntries(
            Object.entries(enhanced).filter(
              ([, v]) => v !== undefined && v !== null && v !== ""
            )
          ),
          transcript,
          source: "llm",
        });
      } catch (err) {
        console.warn("LLM parse fallback:", err);
      }
    }

    return NextResponse.json({ ...heuristic, source: "heuristic" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "解析失敗" }, { status: 500 });
  }
}

async function enhanceWithLLM(
  transcript: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract CRM lead fields from Cantonese/Chinese sales notes. Return JSON keys: customerName, partner, systems (string array), requirements, quantity, budget (number in HKD). Omit unknown fields.",
        },
        { role: "user", content: transcript },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return content ? JSON.parse(content) : {};
}
