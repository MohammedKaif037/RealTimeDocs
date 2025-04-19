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
    // Get document by ID
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        collaborators:document_collaborators(user_id, role)
      `)
      .eq("id", params.id)
      .single()

    if (error) throw error

    // Check if user has access to this document
    const isOwner = data.owner_id === session.user.id
    const isCollaborator = data.collaborators.some((c: any) => c.user_id === session.user.id)

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({ document: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, content } = await request.json()

    // Check if user has access to edit this document
    const { data: document, error: accessError } = await supabase
      .from("documents")
      .select(`
        owner_id,
        collaborators:document_collaborators(user_id, role)
      `)
      .eq("id", params.id)
      .single()

    if (accessError) throw accessError

    const isOwner = document.owner_id === session.user.id
    const isEditor = document.collaborators.some(
      (c: any) => c.user_id === session.user.id && (c.role === "editor" || c.role === "owner"),
    )

    if (!isOwner && !isEditor) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Create a version record first
    await supabase.from("document_versions").insert({
      document_id: params.id,
      content: document.content,
      title: document.title,
      created_by: session.user.id,
    })

    // Update the document
    const { data, error } = await supabase
      .from("documents")
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
        updated_by: session.user.id,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ document: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if user is the owner of this document
    const { data: document, error: accessError } = await supabase
      .from("documents")
      .select("owner_id")
      .eq("id", params.id)
      .single()

    if (accessError) throw accessError

    if (document.owner_id !== session.user.id) {
      return NextResponse.json({ error: "Only the owner can delete this document" }, { status: 403 })
    }

    // Delete the document
    const { error } = await supabase.from("documents").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
