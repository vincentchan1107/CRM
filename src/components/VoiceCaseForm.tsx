"use client";

import { useEffect, useRef, useState } from "react";
import { PARTNER_OPTIONS, SYSTEM_OPTIONS } from "@/lib/stages";

type FormState = {
  customerName: string;
  partner: string;
  systems: string[];
  requirements: string;
  quantity: string;
  budget: string;
};

const emptyForm: FormState = {
  customerName: "",
  partner: "直銷",
  systems: [],
  requirements: "",
  quantity: "",
  budget: "",
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function VoiceCaseForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("按住麥克風，用廣東話／普通話講出案件資料");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalBuffer = useRef("");

  useEffect(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      setStatus("此瀏覽器不支援語音輸入，可手動填寫或貼上文字解析");
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "zh-HK";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalBuffer.current += piece;
        } else {
          interim += piece;
        }
      }
      setTranscript((finalBuffer.current + " " + interim).trim());
    };
    recognition.onerror = (event) => {
      setListening(false);
      setStatus(
        event.error === "not-allowed"
          ? "請允許麥克風權限後再試"
          : `語音錯誤：${event.error}`
      );
    };
    recognition.onend = () => {
      setListening(false);
      if (finalBuffer.current.trim()) {
        void parseTranscript(finalBuffer.current.trim());
      }
    };
    recognitionRef.current = recognition;
  }, []);

  async function parseTranscript(text: string) {
    setStatus("正在用 AI 解析語音內容…");
    try {
      const res = await fetch("/api/voice/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "解析失敗");
      setForm((prev) => ({
        customerName: data.customerName || prev.customerName,
        partner: data.partner || prev.partner,
        systems: data.systems?.length ? data.systems : prev.systems,
        requirements: data.requirements || prev.requirements,
        quantity: data.quantity || prev.quantity,
        budget:
          data.budget !== undefined && data.budget !== null
            ? String(data.budget)
            : prev.budget,
      }));
      setStatus("已填入相關欄位，請確認後提交");
    } catch {
      setStatus("解析失敗，請手動修正欄位");
    }
  }

  function startListening() {
    if (!recognitionRef.current) return;
    setSavedId(null);
    finalBuffer.current = "";
    setTranscript("");
    setListening(true);
    setStatus("聆聽中…講出客戶、partner、系統、需求、數量、budget");
    recognitionRef.current.lang = "zh-HK";
    recognitionRef.current.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function toggleSystem(sys: string) {
    setForm((prev) => {
      const has = prev.systems.includes(sys);
      return {
        ...prev,
        systems: has
          ? prev.systems.filter((s) => s !== sys)
          : [...prev.systems, sys],
      };
    });
  }

  async function submit() {
    if (!form.customerName.trim()) {
      setStatus("請先填寫客戶名稱");
      return;
    }
    setSaving(true);
    setStatus("提交中…");
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          partner: form.partner,
          systems: form.systems,
          requirements: form.requirements,
          quantity: form.quantity,
          budget: Number(form.budget) || 0,
          amount: Number(form.budget) || 0,
          stage: "first_interview",
          notes: transcript ? `語音原文：${transcript}` : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "提交失敗");
      setSavedId(data.case.id);
      setForm(emptyForm);
      setTranscript("");
      finalBuffer.current = "";
      setStatus("案件已建立，可於後台跟進");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "提交失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg pb-10">
      <div className="animate-rise rounded-panel border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
              Mobile Portal
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">
              語音建案
            </h1>
          </div>
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            disabled={!supported}
            className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white transition ${
              listening
                ? "listening-pulse bg-rose"
                : "bg-teal hover:bg-teal-deep"
            } disabled:cursor-not-allowed disabled:bg-slate-300`}
            aria-label={listening ? "停止錄音" : "開始語音輸入"}
          >
            <MicIcon listening={listening} />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">{status}</p>

        <div className="mt-4 rounded-2xl border border-line bg-paper/80 p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted">語音／文字輸入</span>
            {!supported && (
              <span className="text-[10px] font-semibold text-amber">
                此瀏覽器無麥克風語音，可用文字解析
              </span>
            )}
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            placeholder="例如：客戶係新里程製造，來自 Partner A，用緊 ERP 同 SCM，需求係整合庫存，數量三個模組，budget 大約四十五萬"
            className="w-full resize-none bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => void parseTranscript(transcript)}
            disabled={!transcript.trim()}
            className="mt-2 text-xs font-semibold text-teal disabled:opacity-40"
          >
            解析並填入表格
          </button>
        </div>
      </div>

      <form
        className="animate-rise-delay mt-4 space-y-3 rounded-panel border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field label="客戶名稱">
          <input
            value={form.customerName}
            onChange={(e) =>
              setForm((p) => ({ ...p, customerName: e.target.value }))
            }
            className="w-full rounded-2xl border border-line bg-[#f8fbfc] px-3.5 py-3 outline-none focus:border-teal/60 focus:ring-4 focus:ring-teal/10"
            placeholder="公司／客戶名稱"
            required
          />
        </Field>

        <Field label="來自邊個 Partner">
          <select
            value={form.partner}
            onChange={(e) => setForm((p) => ({ ...p, partner: e.target.value }))}
            className="w-full rounded-2xl border border-line bg-[#f8fbfc] px-3.5 py-3 outline-none focus:border-teal/60 focus:ring-4 focus:ring-teal/10"
          >
            {PARTNER_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>

        <Field label="客見有用咩系統">
          <div className="flex flex-wrap gap-2">
            {SYSTEM_OPTIONS.map((sys) => {
              const on = form.systems.includes(sys);
              return (
                <button
                  key={sys}
                  type="button"
                  onClick={() => toggleSystem(sys)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    on
                      ? "bg-teal text-white"
                      : "border border-line bg-paper text-muted"
                  }`}
                >
                  {sys}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="需求">
          <textarea
            value={form.requirements}
            onChange={(e) =>
              setForm((p) => ({ ...p, requirements: e.target.value }))
            }
            rows={3}
            className="w-full rounded-2xl border border-line bg-[#f8fbfc] px-3.5 py-3 outline-none focus:border-teal/60 focus:ring-4 focus:ring-teal/10"
            placeholder="客戶主要需求"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="數量">
            <input
              value={form.quantity}
              onChange={(e) =>
                setForm((p) => ({ ...p, quantity: e.target.value }))
              }
              className="w-full rounded-2xl border border-line bg-[#f8fbfc] px-3.5 py-3 outline-none focus:border-teal/60 focus:ring-4 focus:ring-teal/10"
              placeholder="例如 20 用戶"
            />
          </Field>
          <Field label="Budget (HKD)">
            <input
              type="number"
              inputMode="decimal"
              value={form.budget}
              onChange={(e) =>
                setForm((p) => ({ ...p, budget: e.target.value }))
              }
              className="w-full rounded-2xl border border-line bg-[#f8fbfc] px-3.5 py-3 outline-none focus:border-teal/60 focus:ring-4 focus:ring-teal/10"
              placeholder="0"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-teal-deep disabled:opacity-60"
        >
          {saving ? "提交中…" : "建立案件（首次會見）"}
        </button>

        {savedId && (
          <p className="text-center text-sm text-teal">
            已建立 {savedId} ·{" "}
            <a href="/admin/board" className="underline">
              去後台睇
            </a>
          </p>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function MicIcon({ listening }: { listening: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
        fill="currentColor"
      />
      <path
        d="M5 11a7 7 0 0 0 14 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 18v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {listening ? null : (
        <path
          d="M8 21h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
