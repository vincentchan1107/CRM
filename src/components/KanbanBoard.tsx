"use client";

import { useMemo, useState } from "react";
import type { Case, CaseStage, CloseReason } from "@/lib/types";
import { CLOSE_REASON_META, STAGE_META, STAGE_ORDER } from "@/lib/stages";
import { formatMoney, formatPercent } from "@/lib/format";
import { useCases } from "@/hooks/useCases";
import { CaseDetailDrawer } from "./CaseDetailDrawer";

export function KanbanBoard() {
  const { cases, loading, error, update, refresh } = useCases();
  const [selected, setSelected] = useState<Case | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const columns = useMemo(() => {
    return STAGE_ORDER.map((stage) => ({
      stage,
      items: cases.filter((c) => c.stage === stage),
    }));
  }, [cases]);

  async function moveTo(
    id: string,
    stage: CaseStage,
    closeReason?: CloseReason
  ) {
    const patch: Partial<Case> = { stage };
    if (stage === "closed") {
      patch.closeReason = closeReason || "failed";
      patch.successRate = 0;
    } else {
      patch.closeReason = null;
    }
    await update(id, patch);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Case 跟進</h1>
          <p className="mt-1 text-sm text-muted">
            Case Management：拖曳卡片改 status，由會見到確認／關閉
          </p>
        </div>
        <button
          onClick={() => void refresh()}
          className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold"
        >
          重新整理
        </button>
      </div>

      {loading && <p className="text-sm text-muted">載入中…</p>}
      {error && <p className="text-sm text-rose">{error}</p>}

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {columns.map(({ stage, items }) => (
          <section
            key={stage}
            className="min-w-[260px] max-w-[280px] flex-1 rounded-panel border border-line/80 bg-white/70 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/case-id") || dragId;
              if (!id) return;
              if (stage === "closed") {
                const reason = window.confirm(
                  "按「確定」設為 Disqualified；按「取消」設為失敗"
                )
                  ? "disqualified"
                  : "failed";
                void moveTo(id, stage, reason);
              } else {
                void moveTo(id, stage);
              }
              setDragId(null);
            }}
          >
            <header className="mb-3 flex items-center justify-between gap-2">
              <div
                className="rounded-full px-2.5 py-1 text-xs font-bold"
                style={{
                  color: STAGE_META[stage].color,
                  background: STAGE_META[stage].bg,
                }}
              >
                {STAGE_META[stage].label}
              </div>
              <span className="text-xs font-semibold text-muted">
                {items.length}
              </span>
            </header>
            <p className="mb-3 text-[11px] text-muted">
              {STAGE_META[stage].description}
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <article
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    setDragId(item.id);
                    e.dataTransfer.setData("text/case-id", item.id);
                  }}
                  onClick={() => setSelected(item)}
                  className="cursor-grab rounded-2xl border border-line bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft active:cursor-grabbing"
                >
                  <h3 className="font-semibold text-ink">{item.customerName}</h3>
                  <p className="mt-1 text-xs text-muted">{item.partner}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.systems.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-teal"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold">
                      {formatMoney(item.amount)}
                    </span>
                    <span className="text-muted">
                      {formatPercent(item.successRate)}
                    </span>
                  </div>
                  {item.stage === "closed" && item.closeReason && (
                    <p className="mt-2 text-[11px] font-semibold text-rose">
                      {CLOSE_REASON_META[item.closeReason].label}
                    </p>
                  )}
                </article>
              ))}
              {items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-line px-3 py-8 text-center text-xs text-muted">
                  拖曳案件到此
                </div>
              )}
            </div>
          </section>
        ))}
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
