"use client";

import { useMemo, useState } from "react";
import type { Case, CaseStage } from "@/lib/types";
import { CLOSE_REASON_META, STAGE_META, STAGE_ORDER } from "@/lib/stages";
import { formatDate, formatMoney, formatPercent } from "@/lib/format";
import { useCases } from "@/hooks/useCases";
import { CaseDetailDrawer } from "./CaseDetailDrawer";

export function CasesTable() {
  const { cases, loading, error, update } = useCases();
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<CaseStage | "all">("all");
  const [selected, setSelected] = useState<Case | null>(null);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (stage !== "all" && c.stage !== stage) return false;
      if (!q.trim()) return true;
      const hay = [
        c.customerName,
        c.partner,
        c.requirements,
        c.systems.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [cases, q, stage]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">案件列表</h1>
          <p className="mt-1 text-sm text-muted">
            查看 details、target closing date、case amount
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋客戶／partner／需求…"
          className="min-w-[220px] flex-1 rounded-full border border-line bg-white px-4 py-2 text-sm outline-none focus:border-teal"
        />
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as CaseStage | "all")}
          className="rounded-full border border-line bg-white px-4 py-2 text-sm"
        >
          <option value="all">全部階段</option>
          {STAGE_ORDER.map((s) => (
            <option key={s} value={s}>
              {STAGE_META[s].label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-muted">載入中…</p>}
      {error && <p className="text-sm text-rose">{error}</p>}

      <div className="overflow-x-auto rounded-panel border border-line bg-white/80 shadow-soft scrollbar-thin">
        <table className="min-w-[960px] w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">客戶</th>
              <th className="px-4 py-3 font-semibold">Partner</th>
              <th className="px-4 py-3 font-semibold">系統</th>
              <th className="px-4 py-3 font-semibold">階段</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">機率</th>
              <th className="px-4 py-3 font-semibold">Target Close</th>
              <th className="px-4 py-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-t border-line/70 hover:bg-paper/70"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold">{c.customerName}</div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-muted">
                    {c.requirements || "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{c.partner}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.systems.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-teal"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2 py-1 text-[11px] font-bold"
                    style={{
                      color: STAGE_META[c.stage].color,
                      background: STAGE_META[c.stage].bg,
                    }}
                  >
                    {STAGE_META[c.stage].short}
                  </span>
                  {c.stage === "closed" && c.closeReason && (
                    <div className="mt-1 text-[10px] text-rose">
                      {CLOSE_REASON_META[c.closeReason].label}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold">
                  {formatMoney(c.amount)}
                </td>
                <td className="px-4 py-3">{formatPercent(c.successRate)}</td>
                <td className="px-4 py-3">{formatDate(c.targetClosingDate)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(c)}
                    className="rounded-full border border-line px-3 py-1 text-xs font-semibold hover:border-teal"
                  >
                    詳情
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-muted"
                >
                  沒有符合的案件
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CaseDetailDrawer
        caseItem={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onSave={async (id, patch) => {
          const updated = await update(id, patch);
          setSelected(updated);
        }}
      />
    </div>
  );
}
