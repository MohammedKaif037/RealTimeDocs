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

    // In a real app, this would call the Chatanywhere API
    // For this demo, we'll simulate a response

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock improvement suggestions
    const mockSuggestions = [
      {
        type: "clarity",
        suggestion: "Consider breaking this long sentence into smaller ones for better readability.",
        context: "The entire paragraph starting with 'Furthermore...'",
      },
      {
        type: "structure",
        suggestion: "The introduction could be more engaging. Consider starting with a question or surprising fact.",
        context: "First paragraph",
      },
      {
        type: "evidence",
        suggestion: "This claim would be stronger with specific examples or data to support it.",
        context: "The statement about productivity improvements",
      },
      {
        type: "conclusion",
        suggestion: "The conclusion feels abrupt. Consider summarizing key points and providing a call to action.",
        context: "Last paragraph",
      },
    ]

    return NextResponse.json({ suggestions: mockSuggestions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
