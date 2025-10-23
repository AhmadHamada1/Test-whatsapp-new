import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch messages for a connection
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get("connectionId")

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    // In a real implementation, fetch from database
    return NextResponse.json({
      messages: [],
      connectionId,
    })
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    const body = await request.json()
    const { connectionId, phoneNumber, message } = body

    if (!connectionId || !phoneNumber || !message) {
      return NextResponse.json({ error: "Connection ID, phone number, and message are required" }, { status: 400 })
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // In a real implementation:
    // 1. Verify connection exists and is active
    // 2. Send message via WhatsApp Business API
    // 3. Store message in database
    // 4. Return message ID and status

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const newMessage = {
      id: messageId,
      connectionId,
      phoneNumber,
      message,
      status: "pending",
      timestamp: new Date().toISOString(),
    }

    // Simulate async message sending
    console.log("[v0] Sending message:", newMessage)

    return NextResponse.json(
      {
        message: newMessage,
        success: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
