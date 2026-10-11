"use client";

import { useEffect, useState } from "react";
import type { Case, CaseStage, CloseReason } from "@/lib/types";
import { CLOSE_REASON_META, STAGE_META, STAGE_ORDER } from "@/lib/stages";
import { formatMoney } from "@/lib/format";

type Props = {
  caseItem: Case | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Case>) => Promise<void>;
};

export function CaseDetailDrawer({ caseItem, open, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Case | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(caseItem ? { ...caseItem } : null);
  }, [caseItem]);

  if (!open || !draft) return null;

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      await onSave(draft.id, {
        customerName: draft.customerName,
        partner: draft.partner,
        systems: draft.systems,
        requirements: draft.requirements,
        quantity: draft.quantity,
        budget: draft.budget,
        amount: draft.amount,
        successRate: draft.successRate,
        targetClosingDate: draft.targetClosingDate,
        stage: draft.stage,
        closeReason: draft.closeReason,
        notes: draft.notes,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-sm">
      <button className="absolute inset-0" aria-label="關閉" onClick={onClose} />
      <aside className="relative h-full w-full max-w-md animate-rise overflow-y-auto bg-white shadow-soft scrollbar-thin">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
              Case details
            </p>
            <h2 className="font-display text-xl font-extrabold">{draft.customerName}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted"
          >
            關閉
          </button>
        </div>

        <div className="space-y-4 p-5">
          <Field label="客戶名稱">
            <input
              className="w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
              value={draft.customerName}
              onChange={(e) =>
                setDraft({ ...draft, customerName: e.target.value })
              }
            />
          </Field>
          <Field label="Partner">
            <input
              className="w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
              value={draft.partner}
              onChange={(e) => setDraft({ ...draft, partner: e.target.value })}
            />
          </Field>
          <Field label="系統">
            <input
              className="w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
              value={draft.systems.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  systems: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
          <Field label="需求">
            <textarea
              className="min-h-24 w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
              value={draft.requirements}
              onChange={(e) =>
                setDraft({ ...draft, requirements: e.target.value })
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="數量">
              <input
                className="w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
                value={draft.quantity}
                onChange={(e) =>
                  setDraft({ ...draft, quantity: e.target.value })
                }
              />
            </Field>
            <Field label="Budget">
              <input
                type="number"
                className="w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
                value={draft.budget}
                onChange={(e) =>
                  setDraft({ ...draft, budget: Number(e.target.value) || 0 })
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Case Amount">
              <input
                type="number"
                className="w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
                value={draft.amount}
                onChange={(e) =>
                  setDraft({ ...draft, amount: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="成功機率 %">
              <input
                type="number"
                min={0}
                max={100}
                className="w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
                value={draft.successRate}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    successRate: Number(e.target.value) || 0,
                  })
                }
              />
            </Field>
          </div>
          <Field label="Target Closing Date">
            <input
              type="date"
              className="w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
              value={draft.targetClosingDate}
              onChange={(e) =>
                setDraft({ ...draft, targetClosingDate: e.target.value })
              }
            />
          </Field>
          <Field label="Stage">
            <select
              className="w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
              value={draft.stage}
              onChange={(e) => {
                const stage = e.target.value as CaseStage;
                setDraft({
                  ...draft,
                  stage,
                  closeReason:
                    stage === "closed"
                      ? draft.closeReason || "failed"
                      : null,
                });
              }}
            >
              {STAGE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STAGE_META[s].label}
                </option>
              ))}
            </select>
          </Field>
          {draft.stage === "closed" && (
            <Field label="關閉原因">
              <select
                className="w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
                value={draft.closeReason || "failed"}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    closeReason: e.target.value as CloseReason,
                  })
                }
              >
                {Object.entries(CLOSE_REASON_META).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="備註">
            <textarea
              className="min-h-20 w-full rounded-xl border border-line bg-[#f8fbfc] px-3 py-2.5 text-sm outline-none focus:border-teal/50"
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </Field>

          <div className="rounded-2xl bg-paper p-3 text-sm text-muted">
            預計成交 {formatMoney(draft.amount)} · 加權{" "}
            {formatMoney(draft.amount * (draft.successRate / 100))}
          </div>

          <button
            onClick={() => void save()}
            disabled={saving}
            className="w-full rounded-full bg-teal py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "儲存中…" : "儲存變更"}
          </button>
        </div>
      </aside>
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
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
