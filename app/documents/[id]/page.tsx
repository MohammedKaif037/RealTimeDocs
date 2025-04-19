"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import DocumentHeader from "@/components/document-header"
import DocumentEditor from "@/components/document-editor"
import CollaboratorsList from "@/components/collaborators-list"
import VersionHistory from "@/components/version-history"
import AIAssistant from "@/components/ai-assistant"

type DocumentData = {
  id: string
  title: string
  content: any
  owner_id: string
  created_at: string
  updated_at: string
}

export default function DocumentPage({ params }: { params: { id: string } }) {
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/login")
        return
      }

      fetchDocument()
      setupRealtimeSubscription()
    }

    checkSession()

    return () => {
      supabase.removeChannel("document-changes")
    }
  }, [params.id])

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("document-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
          filter: `id=eq.${params.id}`,
        },
        (payload) => {
          // Only update if the change wasn't made by the current user
          if (payload.new.updated_by !== supabase.auth.getSession().then(({ data }) => data.session?.user.id)) {
            setDocument(payload.new as DocumentData)
          }
        },
      )
      .subscribe()
  }

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase.from("documents").select("*").eq("id", params.id).single()

      if (error) throw error

      setDocument(data)
    } catch (error: any) {
      toast({
        title: "Error fetching document",
        description: error.message,
        variant: "destructive",
      })
      router.push("/documents")
    } finally {
      setIsLoading(false)
    }
  }

  const saveDocument = async (title: string, content: any) => {
    if (!document) return

    setIsSaving(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const userId = session.session?.user.id

      // Create a version record first
      await supabase.from("document_versions").insert({
        document_id: document.id,
        content: document.content,
        title: document.title,
        created_by: userId,
      })

      // Then update the document
      const { error } = await supabase
        .from("documents")
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq("id", document.id)

      if (error) throw error

      setDocument({
        ...document,
        title,
        content,
        updated_at: new Date().toISOString(),
      })

      toast({
        title: "Document saved",
        description: "Your changes have been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error saving document",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DocumentHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex min-h-screen flex-col">
        <DocumentHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Document not found</h2>
            <p className="text-gray-500 mb-4">
              The document you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DocumentHeader
        documentTitle={document.title}
        isSaving={isSaving}
        onShowCollaborators={() => setShowCollaborators(true)}
        onShowVersionHistory={() => setShowVersionHistory(true)}
        onShowAIAssistant={() => setShowAIAssistant(true)}
      />
      <main className="flex-1 container py-6">
        <DocumentEditor document={document} onSave={saveDocument} />
      </main>

      <CollaboratorsList
        documentId={document.id}
        isOpen={showCollaborators}
        onClose={() => setShowCollaborators(false)}
      />

      <VersionHistory
        documentId={document.id}
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
      />

      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        documentContent={document.content}
        onApplySuggestion={(suggestion) => {
          // Logic to apply AI suggestion to the document
          toast({
            title: "Suggestion applied",
            description: "The AI suggestion has been applied to your document",
          })
        }}
      />
    </div>
  )
}
