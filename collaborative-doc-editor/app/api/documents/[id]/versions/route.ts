import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if user has access to this document
    const { data: document, error: accessError } = await supabase
      .from("documents")
      .select("owner_id")
      .eq("id", params.id)
      .single()

    if (accessError) throw accessError

    const isOwner = document.owner_id === session.user.id

    if (!isOwner) {
      // Check if user is a collaborator
      const { data: collaborator, error: collabError } = await supabase
        .from("document_collaborators")
        .select("role")
        .eq("document_id", params.id)
        .eq("user_id", session.user.id)
        .single()

      if (collabError || !collaborator) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
    }

    // Get versions for this document
    const { data, error } = await supabase
      .from("document_versions")
      .select(`
        id,
        title,
        created_at,
        created_by,
        users:created_by(user_metadata)
      `)
      .eq("document_id", params.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ versions: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
