import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch specific message status
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = request.headers.get("x-api-key")
    const { id } = await params

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    // In a real implementation, fetch from database
    return NextResponse.json({
      message: {
        id,
        status: "delivered",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching message:", error)
    return NextResponse.json({ error: "Failed to fetch message" }, { status: 500 })
  }
}
