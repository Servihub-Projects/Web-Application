import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid data sent" }, { status: 400 })
    }
    const { email } = body as { email: string }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    //add email for password reset here
    console.log(email)
    return NextResponse.json({ success: true })
  }
  catch (error) {
    console.error("Error handling forgot password request:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}
