"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check, Sparkles, AlertTriangle } from "lucide-react"

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  documentContent: any
  onApplySuggestion: (suggestion: string) => void
}

type SuggestionType = "grammar" | "improve" | "summarize"

export default function AIAssistant({ isOpen, onClose, documentContent, onApplySuggestion }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<SuggestionType>("grammar")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [customPrompt, setCustomPrompt] = useState("")
  const [customResponse, setCustomResponse] = useState("")
  const { toast } = useToast()

  const generateSuggestions = async (type: SuggestionType) => {
    setIsLoading(true)
    setSuggestions([])

    try {
      // In a real app, this would call the Chatanywhere API
      // For this demo, we'll simulate responses

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      let mockSuggestions: string[] = []

      switch (type) {
        case "grammar":
          mockSuggestions = [
            "Consider replacing 'their' with 'there' in paragraph 2.",
            "The sentence starting with 'However' contains a comma splice. Consider using a semicolon or period.",
            "The word 'definately' is misspelled. The correct spelling is 'definitely'.",
            "Consider breaking the third paragraph into smaller sentences for better readability.",
          ]
          break
        case "improve":
          mockSuggestions = [
            "The introduction could be more engaging. Consider starting with a question or surprising fact.",
            "The second paragraph lacks supporting evidence. Consider adding specific examples or data.",
            "The conclusion feels abrupt. Consider summarizing key points and providing a call to action.",
            "Consider adding transition phrases between paragraphs to improve flow.",
          ]
          break
        case "summarize":
          mockSuggestions = [
            "This document discusses the importance of collaborative editing in modern workplaces, highlighting how real-time collaboration tools improve productivity and reduce miscommunication.",
            "Key points include: 1) Real-time editing reduces version control issues, 2) AI assistance can improve writing quality, 3) Collaborative tools foster better team communication.",
          ]
          break
      }

      setSuggestions(mockSuggestions)
    } catch (error: any) {
      toast({
        title: "Error generating suggestions",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for the AI",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setCustomResponse("")

    try {
      // In a real app, this would call the Chatanywhere API
      // For this demo, we'll simulate a response

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockResponse = `Based on your prompt "${customPrompt}", here's my suggestion:

The document could benefit from a more structured approach. Consider organizing your content into clear sections with headings that guide the reader through your argument. Additionally, your key points would be more impactful if supported by specific examples or data points.

I also notice some repetition in paragraphs 3 and 5 that could be consolidated to make your document more concise and impactful.`

      setCustomResponse(mockResponse)
    } catch (error: any) {
      toast({
        title: "Error processing prompt",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            AI Writing Assistant
          </SheetTitle>
          <SheetDescription>Get AI-powered suggestions to improve your document</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="grammar" className="mt-6" onValueChange={(value) => setActiveTab(value as SuggestionType)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
            <TabsTrigger value="improve">Improve</TabsTrigger>
            <TabsTrigger value="summarize">Summarize</TabsTrigger>
          </TabsList>

          <TabsContent value="grammar">
            <p className="text-sm mb-4">Check your document for grammar, spelling, and punctuation errors.</p>
            <Button onClick={() => generateSuggestions("grammar")} disabled={isLoading} className="mb-4">
              {isLoading && activeTab === "grammar" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>Check Grammar</>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="improve">
            <p className="text-sm mb-4">Get suggestions to improve clarity, structure, and impact of your writing.</p>
            <Button onClick={() => generateSuggestions("improve")} disabled={isLoading} className="mb-4">
              {isLoading && activeTab === "improve" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>Improve Writing</>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="summarize">
            <p className="text-sm mb-4">Generate a concise summary of your document.</p>
            <Button onClick={() => generateSuggestions("summarize")} disabled={isLoading} className="mb-4">
              {isLoading && activeTab === "summarize" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>Generate Summary</>
              )}
            </Button>
          </TabsContent>

          {suggestions.length > 0 && (
            <div className="mt-2 space-y-3">
              <h3 className="text-sm font-medium">Suggestions:</h3>
              {suggestions.map((suggestion, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="flex">
                      <div className="mr-3 mt-0.5">
                        {activeTab === "grammar" ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{suggestion}</p>
                        {activeTab !== "summarize" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => onApplySuggestion(suggestion)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Tabs>

        <div className="mt-8 border-t pt-4">
          <h3 className="text-sm font-medium mb-3">Custom AI Prompt</h3>
          <Textarea
            placeholder="Ask the AI for specific writing help..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="mb-3"
          />
          <Button onClick={handleCustomPrompt} disabled={isLoading || !customPrompt.trim()}>
            {isLoading && !activeTab ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Send Prompt"
            )}
          </Button>

          {customResponse && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex">
                  <div className="mr-3 mt-0.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-line">{customResponse}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
