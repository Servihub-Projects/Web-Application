import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { name, email, company, useCase } = body as {
      name?: string;
      email?: string;
      company?: string;
      useCase?: string;
    };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Placeholder for persistence logic.
    // You can plug in Drizzle ORM + Postgres here to store waitlist entries.
    console.log("New waitlist signup:", {
      name: name ?? null,
      email,
      company: company ?? null,
      useCase: useCase ?? null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling waitlist request:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

