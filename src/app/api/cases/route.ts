import { NextRequest, NextResponse } from "next/server";
import { createCase, listCases } from "@/lib/store";
import type { CaseInput } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const cases = await listCases();
  return NextResponse.json({ cases });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CaseInput;
    if (!body.customerName?.trim()) {
      return NextResponse.json(
        { error: "客戶名稱為必填" },
        { status: 400 }
      );
    }
    const item = await createCase(body);
    return NextResponse.json({ case: item }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "無法建立案件" }, { status: 500 });
  }
}
