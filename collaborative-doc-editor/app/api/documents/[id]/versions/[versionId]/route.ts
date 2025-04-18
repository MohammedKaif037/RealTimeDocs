import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string; versionId: string } }) {
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

    // Get specific version
    const { data, error } = await supabase
      .from("document_versions")
      .select("*")
      .eq("id", params.versionId)
      .eq("document_id", params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ version: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string; versionId: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if user has edit access to this document
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

    // Get the version to restore
    const { data: version, error: versionError } = await supabase
      .from("document_versions")
      .select("title, content")
      .eq("id", params.versionId)
      .eq("document_id", params.id)
      .single()

    if (versionError) throw versionError

    // Create a version record of the current state first
    await supabase.from("document_versions").insert({
      document_id: params.id,
      content: document.content,
      title: document.title,
      created_by: session.user.id,
    })

    // Restore the document to the selected version
    const { data, error } = await supabase
      .from("documents")
      .update({
        title: version.title,
        content: version.content,
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
