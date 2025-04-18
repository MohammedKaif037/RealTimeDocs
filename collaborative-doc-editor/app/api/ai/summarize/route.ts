import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // In a real app, this would call the actual Chatanywhere API
    // For this demo, we'll simulate a response

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock summary
    const mockSummary = {
      summary:
        "This document discusses the importance of collaborative editing in modern workplaces, highlighting how real-time collaboration tools improve productivity and reduce miscommunication. Key points include: 1) Real-time editing reduces version control issues, 2) AI assistance can improve writing quality, 3) Collaborative tools foster better team communication.",
      keyPoints: [
        "Real-time collaboration eliminates version control problems",
        "AI-powered writing assistance improves document quality",
        "Team communication is enhanced through collaborative editing",
        "Document history tracking provides accountability",
      ],
      wordCount: 250,
      readingTime: "2 minutes",
    }

    return NextResponse.json({ summary: mockSummary })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
