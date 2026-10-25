"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DashboardStats } from "@/lib/types";
import { STAGE_META, STAGE_ORDER } from "@/lib/stages";
import { formatMoney, formatPercent } from "@/lib/format";

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "載入失敗");
        setStats(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "載入失敗");
      }
    })();
  }, []);

  if (error) return <p className="text-sm text-rose">{error}</p>;
  if (!stats) return <p className="text-sm text-muted">載入 Dashboard…</p>;

  const maxAmount = Math.max(
    ...stats.months.map((m) => m.totalAmount),
    1
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            未來幾個月 closing 預測、簽單額與成功機率
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/board"
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
          >
            開 Case Management
          </Link>
          <Link
            href="/admin/cases"
            className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold"
          >
            睇列表
          </Link>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["進行中案件", String(stats.openCases), "open pipeline"],
          ["Pipeline 額", formatMoney(stats.pipelineAmount), "未關閉案件總額"],
          [
            "加權預測",
            formatMoney(stats.weightedPipeline),
            "額 × 成功機率",
          ],
          [
            "平均成功機率",
            formatPercent(stats.avgSuccessRate),
            `${stats.closedCases} 宗已關閉`,
          ],
        ].map(([label, value, sub], i) => (
          <article
            key={label}
            className="animate-rise rounded-panel border border-line bg-white/80 p-4 shadow-soft"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {label}
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold text-ink">
              {value}
            </p>
            <p className="mt-1 text-xs text-muted">{sub}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-panel border border-line bg-white/80 p-5 shadow-soft">
          <h2 className="font-display text-xl font-bold">未來 6 個月 Closing</h2>
          <p className="mt-1 text-sm text-muted">
            依 target closing date 統計預算簽單額
          </p>
          <div className="mt-5 space-y-3">
            {stats.months.map((m) => (
              <div key={m.month}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold">{m.label}</span>
                  <span className="text-muted">
                    {m.caseCount} 宗 · {formatMoney(m.totalAmount)} · 機率{" "}
                    {formatPercent(m.avgSuccessRate)}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-paper">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal to-sky transition-all duration-700"
                    style={{
                      width: `${Math.max(4, (m.totalAmount / maxAmount) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  加權預測 {formatMoney(m.weightedAmount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-panel border border-line bg-white/80 p-5 shadow-soft">
          <h2 className="font-display text-xl font-bold">Stage 分佈</h2>
          <div className="mt-4 space-y-2">
            {STAGE_ORDER.map((stage) => (
              <div
                key={stage}
                className="flex items-center justify-between rounded-2xl bg-paper px-3 py-2"
              >
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{
                    color: STAGE_META[stage].color,
                    background: STAGE_META[stage].bg,
                  }}
                >
                  {STAGE_META[stage].label}
                </span>
                <span className="font-display text-lg font-bold">
                  {stats.byStage[stage]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-panel border border-line bg-white/80 p-5 shadow-soft">
        <h2 className="font-display text-xl font-bold">本月／未來重點案件</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stats.months
            .flatMap((m) => m.cases.map((c) => ({ ...c, monthLabel: m.label })))
            .slice(0, 6)
            .map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-line bg-paper/60 p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {c.monthLabel}
                </p>
                <h3 className="mt-1 font-semibold">{c.customerName}</h3>
                <p className="mt-2 text-sm">
                  {formatMoney(c.amount)} · {formatPercent(c.successRate)}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {STAGE_META[c.stage].label} · {c.targetClosingDate}
                </p>
              </article>
            ))}
          {stats.months.every((m) => m.caseCount === 0) && (
            <p className="text-sm text-muted">未來月份尚未設定 closing date</p>
          )}
        </div>
      </section>
    </div>
  );
}
