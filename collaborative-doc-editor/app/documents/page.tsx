"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Search, Loader2, MoreVertical, Clock, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import DocumentHeader from "@/components/document-header"

type Document = {
  id: string
  title: string
  created_at: string
  updated_at: string
  owner_id: string
  collaborators: number
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newDocTitle, setNewDocTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
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

      fetchDocuments()
    }

    checkSession()
  }, [])

  const fetchDocuments = async () => {
    try {
      const { data: documents, error } = await supabase
        .from("documents")
        .select(`
          id,
          title,
          created_at,
          updated_at,
          owner_id,
          collaborators:document_collaborators(count)
        `)
        .order("updated_at", { ascending: false })

      if (error) throw error

      setDocuments(documents || [])
    } catch (error: any) {
      toast({
        title: "Error fetching documents",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createDocument = async () => {
    if (!newDocTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your document",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const userId = session.session?.user.id

      if (!userId) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("documents")
        .insert({
          title: newDocTitle,
          owner_id: userId,
          content: JSON.stringify({
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: newDocTitle }],
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

      toast({
        title: "Document created",
        description: "Your new document has been created successfully",
      })

      setIsDialogOpen(false)
      setNewDocTitle("")
      router.push(`/documents/${data.id}`)
    } catch (error: any) {
      toast({
        title: "Error creating document",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id)

      if (error) throw error

      setDocuments(documents.filter((doc) => doc.id !== id))

      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredDocuments = documents.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex min-h-screen flex-col">
      <DocumentHeader />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Documents</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="w-full md:w-[300px] pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                  <DialogDescription>Enter a title for your new document</DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="Document Title"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="my-4"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createDocument} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              {searchQuery ? (
                <>
                  <p className="text-lg font-medium mb-2">No documents found</p>
                  <p className="text-sm text-gray-500">
                    We couldn&apos;t find any documents matching &quot;{searchQuery}&quot;
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">No documents yet</p>
                  <p className="text-sm text-gray-500 mb-4">Create your first document to get started</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Document
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <Link href={`/documents/${doc.id}`} className="block h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate pr-6">{doc.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 absolute top-3 right-3">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              router.push(`/documents/${doc.id}`)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              deleteDocument(doc.id)
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="truncate">
                      Last edited {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{(doc.collaborators as any)[0]?.count || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
