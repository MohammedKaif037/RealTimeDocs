"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Collaboration from "@tiptap/extension-collaboration"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"
import debounce from "lodash.debounce"
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  LinkIcon,
  Highlighter,
  Undo,
  Redo,
} from "lucide-react"

interface DocumentEditorProps {
  document: {
    id: string
    title: string
    content: any
  }
  onSave: (title: string, content: any) => void
}

export default function DocumentEditor({ document, onSave }: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Parse the content if it's a string
  const initialContent = typeof document.content === "string" ? JSON.parse(document.content) : document.content

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      // This would be replaced with actual Supabase collaboration in a production app
      Collaboration.configure({
        document: document.id,
      }),
    ],
    content: initialContent,
    autofocus: "end",
    onUpdate: ({ editor }) => {
      debouncedSave(title, editor.getJSON())
    },
  })

  // Debounce save to avoid too many requests
  const debouncedSave = useCallback(
    debounce((title: string, content: any) => {
      onSave(title, content)
    }, 1500),
    [onSave],
  )

  useEffect(() => {
    if (editor && typeof document.content === "string") {
      try {
        editor.commands.setContent(JSON.parse(document.content))
      } catch (e) {
        console.error("Error parsing document content:", e)
        editor.commands.setContent("")
      }
    }
  }, [document.id])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    debouncedSave(newTitle, editor?.getJSON() || {})
  }

  const handleImageUpload = async () => {
    if (!editor) return

    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      if (!input.files?.length) return

      const file = input.files[0]

      try {
        // In a real app, you'd upload to Supabase storage
        // For this demo, we'll use a placeholder
        const imageUrl = URL.createObjectURL(file)

        editor.chain().focus().setImage({ src: imageUrl }).run()

        toast({
          title: "Image added",
          description: "The image has been added to your document",
        })
      } catch (error: any) {
        toast({
          title: "Error adding image",
          description: error.message,
          variant: "destructive",
        })
      }
    }
    input.click()
  }

  const handleLinkAdd = () => {
    if (!editor) return

    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) {
      return
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <Input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="text-2xl font-bold border-none px-0 mb-4 focus-visible:ring-0"
        placeholder="Document Title"
      />

      <TooltipProvider delayDuration={300}>
        <div className="border rounded-md p-1 mb-4 flex flex-wrap gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "bg-accent" : ""}
              >
                <Bold className="h-4 w-4" />
                <span className="sr-only">Bold</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "bg-accent" : ""}
              >
                <Italic className="h-4 w-4" />
                <span className="sr-only">Italic</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive("underline") ? "bg-accent" : ""}
              >
                <Underline className="h-4 w-4" />
                <span className="sr-only">Underline</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={editor.isActive("highlight") ? "bg-accent" : ""}
              >
                <Highlighter className="h-4 w-4" />
                <span className="sr-only">Highlight</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Highlight</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
              >
                <Heading1 className="h-4 w-4" />
                <span className="sr-only">Heading 1</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
              >
                <Heading2 className="h-4 w-4" />
                <span className="sr-only">Heading 2</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}
              >
                <Heading3 className="h-4 w-4" />
                <span className="sr-only">Heading 3</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive("bulletList") ? "bg-accent" : ""}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">Bullet List</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? "bg-accent" : ""}
              >
                <ListOrdered className="h-4 w-4" />
                <span className="sr-only">Ordered List</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ordered List</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={editor.isActive({ textAlign: "left" }) ? "bg-accent" : ""}
              >
                <AlignLeft className="h-4 w-4" />
                <span className="sr-only">Align Left</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""}
              >
                <AlignCenter className="h-4 w-4" />
                <span className="sr-only">Align Center</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""}
              >
                <AlignRight className="h-4 w-4" />
                <span className="sr-only">Align Right</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleImageUpload}>
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">Add Image</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLinkAdd}
                className={editor.isActive("link") ? "bg-accent" : ""}
              >
                <LinkIcon className="h-4 w-4" />
                <span className="sr-only">Add Link</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Link</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <Undo className="h-4 w-4" />
                <span className="sr-only">Undo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <Redo className="h-4 w-4" />
                <span className="sr-only">Redo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div className="border rounded-lg p-4 flex-1 overflow-auto">
        <EditorContent editor={editor} className="prose max-w-none" />
      </div>
    </div>
  )
}
