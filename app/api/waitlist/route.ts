import { db } from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, company, useCase } = body;

  if (!email?.includes("@")) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  if (!useCase) {
    return NextResponse.json({ error: "Use case is required." }, { status: 400 });
  }

  try {
    const entry = await db.waitlist.create({
      data: { name: name ?? null, email, company: company ?? null, useCase },
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}
