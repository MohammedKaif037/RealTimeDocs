"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Loader2, RotateCcw } from "lucide-react"

interface VersionHistoryProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
}

type Version = {
  id: string
  title: string
  created_at: string
  created_by: string
  creator_name?: string
}

export default function VersionHistory({ documentId, isOpen, onClose }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRestoring, setIsRestoring] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (isOpen) {
      fetchVersions()
    }
  }, [isOpen, documentId])

  const fetchVersions = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch from a document_versions table
      // For this demo, we'll simulate with mock data

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate mock versions
      const mockVersions: Version[] = Array.from({ length: 5 }).map((_, index) => {
        const date = new Date()
        date.setDate(date.getDate() - index)

        return {
          id: `version-${index}`,
          title: index === 0 ? "Current Version" : `Version ${5 - index}`,
          created_at: date.toISOString(),
          created_by: "user-id",
          creator_name: "John Doe",
        }
      })

      setVersions(mockVersions)
    } catch (error: any) {
      toast({
        title: "Error fetching version history",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const restoreVersion = async (versionId: string) => {
    setIsRestoring(true)
    try {
      // In a real app, this would restore from a document_versions table
      // For this demo, we'll simulate success

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Version restored",
        description: "The document has been restored to the selected version",
      })

      onClose()
    } catch (error: any) {
      toast({
        title: "Error restoring version",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Version History</SheetTitle>
          <SheetDescription>View and restore previous versions of this document</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No version history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`p-4 rounded-lg border ${index === 0 ? "bg-primary/5 border-primary/20" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{version.title}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                        {version.creator_name && ` by ${version.creator_name}`}
                      </p>
                    </div>
                    {index !== 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreVersion(version.id)}
                        disabled={isRestoring}
                      >
                        {isRestoring ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </>
                        )}
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
