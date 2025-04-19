"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import DocumentHeader from "@/components/document-header"
import ProfileForm from "@/components/profile-form"
import { Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/login")
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        setUser(userData.user)
      }
      setIsLoading(false)
    }

    checkSession()
  }, [])

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

  return (
    <div className="flex min-h-screen flex-col">
      <DocumentHeader />
      <main className="flex-1 container py-6">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
        <div className="flex justify-center">
          <ProfileForm user={user} />
        </div>
      </main>
    </div>
  )
}
