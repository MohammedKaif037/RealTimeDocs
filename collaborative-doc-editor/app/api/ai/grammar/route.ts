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

    // Generate mock grammar suggestions
    const mockSuggestions = [
      {
        original: "their",
        suggestion: "there",
        reason: "Incorrect usage of 'their'. 'There' indicates a place.",
        context: "I want to go their tomorrow.",
      },
      {
        original: "definately",
        suggestion: "definitely",
        reason: "Spelling error. The correct spelling is 'definitely'.",
        context: "I will definately attend the meeting.",
      },
      {
        original: "its",
        suggestion: "it's",
        reason: "Missing apostrophe. 'It's' is a contraction of 'it is'.",
        context: "Its going to rain today.",
      },
    ]

    return NextResponse.json({ suggestions: mockSuggestions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
