import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string; collaboratorId: string } }) {
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
      return NextResponse.json({ error: "Only the owner can remove collaborators" }, { status: 403 })
    }

    // Remove collaborator
    const { error } = await supabase.from("document_collaborators").delete().eq("id", params.collaboratorId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string; collaboratorId: string } }) {
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
      return NextResponse.json({ error: "Only the owner can update collaborator roles" }, { status: 403 })
    }

    const { role } = await request.json()

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 })
    }

    // Update collaborator role
    const { data, error } = await supabase
      .from("document_collaborators")
      .update({ role })
      .eq("id", params.collaboratorId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ collaborator: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
