"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, Save, Users, History, Sparkles, LogOut, User, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DocumentHeaderProps {
  documentTitle?: string
  isSaving?: boolean
  onShowCollaborators?: () => void
  onShowVersionHistory?: () => void
  onShowAIAssistant?: () => void
}

export default function DocumentHeader({
  documentTitle,
  isSaving,
  onShowCollaborators,
  onShowVersionHistory,
  onShowAIAssistant,
}: DocumentHeaderProps) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useState(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }

    getUser()
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/documents" className="flex items-center gap-2 font-semibold">
            <FileText className="h-6 w-6" />
            <span className="text-xl hidden md:inline">DocCollab</span>
          </Link>
          {documentTitle && (
            <>
              <span className="text-gray-500">/</span>
              <span className="font-medium truncate max-w-[200px] md:max-w-[400px]">{documentTitle}</span>
              {isSaving && (
                <div className="flex items-center text-gray-500 text-sm">
                  <Save className="h-3 w-3 mr-1 animate-pulse" />
                  <span>Saving...</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {documentTitle && (
            <>
              {onShowAIAssistant && (
                <Button variant="outline" size="sm" className="hidden md:flex" onClick={onShowAIAssistant}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              )}

              {onShowVersionHistory && (
                <Button variant="outline" size="sm" className="hidden md:flex" onClick={onShowVersionHistory}>
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              )}

              {onShowCollaborators && (
                <Button variant="outline" size="sm" onClick={onShowCollaborators}>
                  <Users className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Share</span>
                </Button>
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>
                    {user?.user_metadata?.name
                      ? user.user_metadata.name.charAt(0).toUpperCase()
                      : user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.user_metadata?.name && <p className="font-medium">{user.user_metadata.name}</p>}
                  {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/documents">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>My Documents</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
