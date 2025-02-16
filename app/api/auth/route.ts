import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const data = await request.json()

  // Dummy authentication
  if (data.email === "rahul@joinrally.io" && data.password === "password") {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
}

