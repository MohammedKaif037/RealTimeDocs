import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { cache } from "react"

export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
})

export async function getSession() {
  const supabase = createServerSupabaseClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getUserDetails() {
  const supabase = createServerSupabaseClient()
  try {
    const { data: userDetails } = await supabase.from("profiles").select("*").single()
    return userDetails
  } catch (error) {
    console.error("Error getting user details:", error)
    return null
  }
}

export async function getDocuments() {
  const supabase = createServerSupabaseClient()
  const session = await getSession()
  
  if (!session) {
    return { documents: [] }
  }
  
  try {
    // Get documents owned by the user
    const { data: ownedDocuments, error: ownedError } = await supabase
      .from("documents")
      .select(`
        id,
        title,
        created_at,
        updated_at,
        owner_id,
        updated_by
      `)
      .eq("owner_id", session.user.id)
      .order("updated_at", { ascending: false })

    if (ownedError) throw ownedError

    // Get documents shared with the user
    const { data: sharedDocuments, error: sharedError } = await supabase
      .from("document_collaborators")
      .select(`
        document_id,
        role,
        documents:document_id(
          id,
          title,
          created_at,
          updated_at,
          owner_id,
          updated_by
        )
      `)
      .eq("user_id", session.user.id)

    if (sharedError) throw sharedError

    // Process and combine the results
    const processedOwnedDocs = ownedDocuments.map((doc) => ({
      ...doc,
      role: "owner",
    }))

    const processedSharedDocs = sharedDocuments
      .filter((doc) => doc.documents) // Filter out any null documents
      .map((doc) => ({
        ...doc.documents,
        role: doc.role,
      }))

    // Combine and sort by updated_at
    const allDocuments = [...processedOwnedDocs, ...processedSharedDocs].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    return { documents: allDocuments }
  } catch (error) {
    console.error("Error getting documents:", error)
    return { documents: [] }
  }
}
