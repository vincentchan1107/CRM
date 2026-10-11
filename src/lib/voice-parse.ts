import type { VoiceParseResult } from "./types";
import { PARTNER_OPTIONS, SYSTEM_OPTIONS } from "./stages";

/**
 * Heuristic parser for Cantonese / Chinese voice transcripts.
 * Works offline; optionally enhanced by /api/voice/parse with LLM if configured.
 */
export function parseVoiceTranscript(transcript: string): VoiceParseResult {
  const text = transcript.trim();
  const normalized = text.replace(/\s+/g, "");

  const customerName =
    matchOne(normalized, [
      /客戶(?:名稱|名叫|叫|係|是|為)?[:：]?([^，,。；;跟而然後需求預算系統partner來源數量幾多有冇]+)/i,
      /客(?:戶)?(?:名稱)?[:：]?([^，,。；;]+)/i,
      /見(?:咗|了)?([^，,。；;]{2,20})(?:呢個客|客戶)/,
    ]) || undefined;

  const knownPartner = PARTNER_OPTIONS.find((p) =>
    normalized.toLowerCase().includes(p.toLowerCase().replace(/\s+/g, ""))
  );

  let partner =
    knownPartner ||
    matchOne(normalized, [
      /來自(?:邊個|哪個)?(?:partner)?[:：]?([^，,。；;]+)/i,
      /partner(?:係|是|為)?[:：]?([^，,。；;]+)/i,
      /來源(?:partner)?[:：]?([^，,。；;]+)/i,
      /(?:經|透過|由)([^，,。；;]{1,20})(?:轉介|介紹)/,
    ]) ||
    undefined;

  const systems = SYSTEM_OPTIONS.filter((s) =>
    normalized.toUpperCase().includes(s.toUpperCase())
  );

  const requirements =
    matchOne(text.replace(/\n/g, " "), [
      /需求(?:係|是|為|：|:)?(.+?)(?:預算|數量|幾多|amount|成功|$)/i,
      /想要(.+?)(?:預算|數量|幾多|$)/i,
    ]) || undefined;

  const quantity =
    matchOne(normalized, [
      /數量(?:係|是|為)?[:：]?([0-9０-９]+(?:個|套|用戶|人|店|模組)?)/,
      /(?:要|買|用)([0-9０-９]+(?:個|套|用戶|人|店|模組))/,
      /幾多[:：]?([0-9０-９]+(?:個|套|用戶|人|店|模組)?)/,
    ]) || undefined;

  const budgetRaw = matchOne(normalized, [
    /budget(?:係|是|大約|約)?[:：]?([0-9０-９,.一二三四五六七八九十兩]+[萬千]?)/i,
    /預算(?:係|是|大約|約|有)?[:：]?([0-9０-９,.一二三四五六七八九十兩]+[萬千]?)/,
    /有冇budget[:：]?([0-9０-９,.一二三四五六七八九十兩]+[萬千]?)/i,
    /([0-9０-９,.一二三四五六七八九十兩]+萬)/,
  ]);

  const quantityText = quantity
    ? toHalfWidth(quantity)
    : matchOne(normalized, [/([一二三四五六七八九十兩]+個模組)/]) || undefined;

  return {
    transcript: text,
    customerName: cleanName(customerName),
    partner: cleanPartner(partner),
    systems: systems.length ? systems : undefined,
    requirements: requirements?.trim().replace(/[，,；;]+$/g, ""),
    quantity: quantityText,
    budget: budgetRaw ? parseMoney(budgetRaw) : undefined,
  };
}

function matchOne(text: string, patterns: RegExp[]): string | undefined {
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return undefined;
}

function cleanName(name?: string): string | undefined {
  if (!name) return undefined;
  return name
    .replace(/^(係|是|為|叫|名稱)/, "")
    .replace(/(公司|有限公司)$/, "$1")
    .trim()
    .slice(0, 40);
}

function cleanPartner(partner?: string): string | undefined {
  if (!partner) return undefined;
  const cleaned = partner.replace(/^(係|是|為)/, "").trim();
  const known = PARTNER_OPTIONS.find(
    (p) => p.toLowerCase() === cleaned.toLowerCase()
  );
  return known || cleaned.slice(0, 40);
}

function toHalfWidth(s: string): string {
  return s.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
}

function parseMoney(raw: string): number {
  const half = toHalfWidth(raw).replace(/,/g, "");
  const chinese = half.match(/([一二三四五六七八九十兩]+)(萬|千)?/);
  if (chinese) {
    let n = chineseToNumber(chinese[1]);
    if (chinese[2] === "萬") n *= 10000;
    if (chinese[2] === "千") n *= 1000;
    return Math.round(n);
  }
  const m = half.match(/([0-9.]+)(萬|千)?/);
  if (!m) return 0;
  let n = parseFloat(m[1]);
  if (Number.isNaN(n)) return 0;
  if (m[2] === "萬") n *= 10000;
  if (m[2] === "千") n *= 1000;
  return Math.round(n);
}

function chineseToNumber(raw: string): number {
  const map: Record<string, number> = {
    零: 0,
    一: 1,
    二: 2,
    兩: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  if (raw === "十") return 10;
  if (raw.includes("十")) {
    const [left, right] = raw.split("十");
    const tens = left ? map[left] || 0 : 1;
    const ones = right ? map[right] || 0 : 0;
    return tens * 10 + ones;
  }
  return [...raw].reduce((sum, ch) => sum * 10 + (map[ch] || 0), 0);
}
