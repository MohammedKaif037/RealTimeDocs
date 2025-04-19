"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, X } from "lucide-react"

interface CollaboratorsListProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
}

type Collaborator = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: "viewer" | "editor" | "owner"
}

export default function CollaboratorsList({ documentId, isOpen, onClose }: CollaboratorsListProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators()
    }
  }, [isOpen, documentId])

  const fetchCollaborators = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from a document_collaborators table
      // For this demo, we'll simulate with mock data
      const { data: session } = await supabase.auth.getSession()
      const currentUserId = session.session?.user.id

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockCollaborators: Collaborator[] = [
        {
          id: currentUserId || "owner-id",
          email: session.session?.user.email || "owner@example.com",
          name: session.session?.user.user_metadata?.name || "Document Owner",
          role: "owner",
        },
        // Add some mock collaborators
        {
          id: "collab-1",
          email: "collaborator1@example.com",
          name: "Jane Smith",
          role: "editor",
        },
        {
          id: "collab-2",
          email: "collaborator2@example.com",
          name: "John Doe",
          role: "viewer",
        },
      ]

      setCollaborators(mockCollaborators)
    } catch (error: any) {
      toast({
        title: "Error fetching collaborators",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      // In a real app, this would add to a document_collaborators table
      // For this demo, we'll simulate success

      // Check if already a collaborator
      if (collaborators.some((c) => c.email === newCollaboratorEmail)) {
        toast({
          title: "Already a collaborator",
          description: "This person is already a collaborator on this document",
          variant: "destructive",
        })
        setIsAdding(false)
        return
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add the new collaborator to the list
      const newCollaborator: Collaborator = {
        id: `collab-${Date.now()}`,
        email: newCollaboratorEmail,
        name: newCollaboratorEmail.split("@")[0],
        role: "editor",
      }

      setCollaborators([...collaborators, newCollaborator])
      setNewCollaboratorEmail("")

      toast({
        title: "Collaborator added",
        description: `${newCollaboratorEmail} has been added as a collaborator`,
      })
    } catch (error: any) {
      toast({
        title: "Error adding collaborator",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      // In a real app, this would remove from a document_collaborators table
      // For this demo, we'll just update the state

      // Don't allow removing the owner
      const collaborator = collaborators.find((c) => c.id === collaboratorId)
      if (collaborator?.role === "owner") {
        toast({
          title: "Cannot remove owner",
          description: "The document owner cannot be removed",
          variant: "destructive",
        })
        return
      }

      setCollaborators(collaborators.filter((c) => c.id !== collaboratorId))

      toast({
        title: "Collaborator removed",
        description: "The collaborator has been removed from this document",
      })
    } catch (error: any) {
      toast({
        title: "Error removing collaborator",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Share Document</SheetTitle>
          <SheetDescription>Add people to collaborate on this document</SheetDescription>
        </SheetHeader>

        <div className="flex items-center space-x-2 mt-4">
          <Input
            placeholder="Email address"
            value={newCollaboratorEmail}
            onChange={(e) => setNewCollaboratorEmail(e.target.value)}
            disabled={isAdding}
          />
          <Button onClick={addCollaborator} disabled={isAdding}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">People with access</h3>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.avatar_url || ""} />
                      <AvatarFallback>
                        {collaborator.name?.charAt(0).toUpperCase() || collaborator.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{collaborator.name || collaborator.email}</p>
                      <p className="text-xs text-gray-500">{collaborator.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs capitalize bg-primary/10 text-primary px-2 py-1 rounded">
                      {collaborator.role}
                    </span>
                    {collaborator.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeCollaborator(collaborator.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
