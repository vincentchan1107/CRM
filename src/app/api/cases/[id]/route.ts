import { NextRequest, NextResponse } from "next/server";
import { deleteCase, getCase, updateCase } from "@/lib/store";
import type { CaseInput } from "@/lib/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const item = await getCase(id);
  if (!item) return NextResponse.json({ error: "找不到案件" }, { status: 404 });
  return NextResponse.json({ case: item });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as Partial<CaseInput>;
    const item = await updateCase(id, body);
    if (!item) return NextResponse.json({ error: "找不到案件" }, { status: 404 });
    return NextResponse.json({ case: item });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "無法更新案件" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const ok = await deleteCase(id);
  if (!ok) return NextResponse.json({ error: "找不到案件" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
