"use client";

import { useCallback, useEffect, useState } from "react";
import type { Case, CaseInput } from "@/lib/types";

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cases", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "載入失敗");
      setCases(data.cases);
    } catch (e) {
      setError(e instanceof Error ? e.message : "載入失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const update = useCallback(
    async (id: string, patch: Partial<CaseInput>) => {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "更新失敗");
      setCases((prev) =>
        prev.map((c) => (c.id === id ? data.case : c)).sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
      return data.case as Case;
    },
    []
  );

  return { cases, loading, error, refresh, update };
}
