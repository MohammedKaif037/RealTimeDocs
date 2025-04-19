import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get documents for the current user
    const { data, error } = await supabase
      .from("documents")
      .select(`
        id,
        title,
        created_at,
        updated_at,
        owner_id,
        collaborators:document_collaborators(count)
      `)
      .or(`owner_id.eq.${session.user.id},document_collaborators.user_id.eq.${session.user.id}`)
      .order("updated_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ documents: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

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
    const { title } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Create a new document
    const { data, error } = await supabase
      .from("documents")
      .insert({
        title,
        owner_id: session.user.id,
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: title }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Start writing here..." }],
            },
          ],
        }),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ document: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
