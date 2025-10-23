import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

// GET - Generate QR code for connection
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = request.headers.get("x-api-key")
    const { id } = await params

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    // In a real implementation:
    // 1. Fetch connection from database
    // 2. Generate WhatsApp Business API pairing code
    // 3. Create QR code with pairing data

    const qrData = {
      connectionId: id,
      timestamp: Date.now(),
      apiEndpoint: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    }

    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData))

    return NextResponse.json({
      qrCode: qrCodeUrl,
      connectionId: id,
    })
  } catch (error) {
    console.error("[v0] Error generating QR code:", error)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}
