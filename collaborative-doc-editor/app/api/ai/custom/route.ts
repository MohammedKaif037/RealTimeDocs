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
    const { prompt, text } = await request.json()

    if (!prompt || !text) {
      return NextResponse.json({ error: "Prompt and text are required" }, { status: 400 })
    }

    // In a real app, this would call the Chatanywhere API
    // For this demo, we'll simulate a response

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock response based on prompt
    let response = ""

    if (prompt.toLowerCase().includes("summarize")) {
      response = `Here's a summary of your document:

The document discusses collaborative document editing with AI assistance. It highlights the benefits of real-time collaboration, version control, and AI-powered writing suggestions. The main argument is that modern document editing should combine human creativity with AI assistance for optimal results.

Key points:
1. Real-time collaboration improves team productivity
2. Version history provides accountability and safety
3. AI grammar checking reduces errors
4. Content suggestions enhance writing quality`
    } else if (prompt.toLowerCase().includes("improve") || prompt.toLowerCase().includes("suggestion")) {
      response = `Based on your request for improvement suggestions, here are my recommendations:

1. Structure: Consider organizing your content into clearer sections with descriptive headings.
2. Evidence: The second paragraph would benefit from specific examples or data points to support your claims.
3. Transitions: Add transition phrases between paragraphs to improve flow.
4. Conclusion: Your ending feels abrupt. Consider summarizing key points and providing a call to action.
5. Tone: The document shifts between formal and casual tones. Consider maintaining a consistent voice throughout.`
    } else {
      response = `I've analyzed your document based on your prompt: "${prompt}"

Here are my thoughts:
- Your document has a clear main idea but could benefit from more structured organization
- Consider adding more specific examples to support your key points
- The introduction could be more engaging to hook the reader
- Some sentences are quite long and could be broken up for better readability
- Overall, your arguments are sound but would be stronger with additional supporting evidence

I hope this feedback helps you improve your document!`
    }

    return NextResponse.json({ response })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
