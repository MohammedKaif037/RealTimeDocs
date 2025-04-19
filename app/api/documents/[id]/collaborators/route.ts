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

    // Get collaborators for this document
    const { data, error } = await supabase
      .from("document_collaborators")
      .select(`
        id,
        role,
        users:user_id(id, email, user_metadata)
      `)
      .eq("document_id", params.id)

    if (error) throw error

    // Add owner to the list
    const { data: owner, error: ownerError } = await supabase
      .from("users")
      .select("id, email, user_metadata")
      .eq("id", document.owner_id)
      .single()

    if (ownerError) throw ownerError

    const collaborators = [
      {
        id: "owner",
        role: "owner",
        user: owner,
      },
      ...data.map((c: any) => ({
        id: c.id,
        role: c.role,
        user: c.users,
      })),
    ]

    return NextResponse.json({ collaborators })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ error: "Only the owner can add collaborators" }, { status: 403 })
    }

    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("email", email).single()

    if (userError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if already a collaborator
    const { data: existingCollab, error: collabError } = await supabase
      .from("document_collaborators")
      .select("id")
      .eq("document_id", params.id)
      .eq("user_id", user.id)

    if (existingCollab && existingCollab.length > 0) {
      return NextResponse.json({ error: "User is already a collaborator" }, { status: 400 })
    }

    // Add collaborator
    const { data, error } = await supabase
      .from("document_collaborators")
      .insert({
        document_id: params.id,
        user_id: user.id,
        role: role,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ collaborator: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
