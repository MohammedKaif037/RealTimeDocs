import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Users, History, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileText className="h-6 w-6" />
            <span className="text-xl">DocCollab</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Collaborative Document Editing with AI Assistance
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Create, edit, and collaborate on documents in real-time with AI-powered writing suggestions.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/documents">
                    <Button className="gap-1">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button variant="outline">View Demo</Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mr-0 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <div className="h-[350px] w-full max-w-[500px] overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                  <div className="p-4 border-b">
                    <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900"></div>
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900"></div>
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900"></div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="w-4/6 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Key Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need for collaborative document editing
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-white dark:bg-gray-950">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-900">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Real-time Collaboration</h3>
                <p className="text-sm text-gray-500 text-center">
                  Work together with your team in real-time, seeing changes as they happen.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-white dark:bg-gray-950">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-900">
                  <History className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Version Control</h3>
                <p className="text-sm text-gray-500 text-center">
                  Track changes and revert to previous versions of your documents at any time.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-white dark:bg-gray-950">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-900">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">AI Assistance</h3>
                <p className="text-sm text-gray-500 text-center">
                  Get grammar checking and content suggestions powered by AI as you write.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <FileText className="h-6 w-6" />
              <span className="text-xl">DocCollab</span>
            </div>
            <p className="text-sm text-gray-500">A collaborative document editor with AI-powered writing assistance.</p>
          </div>
          <div className="flex flex-col gap-2 md:gap-4">
            <h3 className="font-semibold">Links</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/about" className="hover:underline">
                About
              </Link>
              <Link href="/features" className="hover:underline">
                Features
              </Link>
              <Link href="/pricing" className="hover:underline">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2 md:gap-4">
            <h3 className="font-semibold">Legal</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
