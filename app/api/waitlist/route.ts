// pages/api/waitlist.ts
import { db } from "@/src/db/db";
import { waitlist } from "@/src/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { name, email, company, useCase } = body as {
      name?: string;
      email?: string;
      company?: string;
      useCase?: string;
    };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (!useCase || typeof useCase !== "string") {
      return NextResponse.json({ error: "Use case is required." }, { status: 400 });
    }

    // Insert into database using Drizzle
    await db.insert(waitlist).values({
      name: name ?? null,
      email,
      company: company ?? null,
      useCase,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling waitlist request:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}
