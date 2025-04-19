"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Send, Trash2, Edit2 } from 'lucide-react'
import type { Comment, User } from "@/types"

interface CommentSectionProps {
  documentId: string
}

export default function CommentSection({ documentId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true)
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          setCurrentUser({
            id: userData.user.id,
            email: userData.user.email || "",
            name: userData.user.user_metadata?.name,
            avatar_url: userData.user.user_metadata?.avatar_url,
          })
        }

        // Get comments
        const { data, error } = await supabase
          .from("document_comments")
          .select(`
            id,
            content,
            position,
            created_at,
            updated_at,
            user:user_id(
              id,
              email,
              user_metadata
            )
          `)
          .eq("document_id", documentId)
          .order("created_at", { ascending: true })

        if (error) throw error

        // Format comments
        const formattedComments = data.map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          position: comment.position,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          user: {
            id: comment.user.id,
            email: comment.user.email,
            name: comment.user.user_metadata?.name || comment.user.email?.split("@")[0],
            avatar_url: comment.user.user_metadata?.avatar_url,
          },
        }))

        setComments(formattedComments)
      } catch (error: any) {
        toast({
          title: "Error fetching comments",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [documentId])

  const addComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("document_comments")
        .insert({
          document_id: documentId,
          content: newComment,
          user_id: currentUser?.id,
        })
        .select()
        .single()

      if (error) throw error

      // Add the new comment to the list
      const newCommentObj: Comment = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user: currentUser!,
      }

      setComments([...comments, newCommentObj])
      setNewComment("")
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("document_comments")
        .delete()
        .eq("id", commentId)

      if (error) throw error

      setComments(comments.filter((comment) => comment.id !== commentId))

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted",
      })
    } catch (error: any) {
      toast({
        title: "Error deleting comment",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditText(comment.content)
  }

  const saveEdit = async () => {
    if (!editingCommentId || !editText.trim()) return

    try {
      const { error } = await supabase
        .from("document_comments")
        .update({
          content: editText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingCommentId)

      if (error) throw error

      setComments(
        comments.map((comment) =>
          comment.id === editingCommentId
            ? { ...comment, content: editText, updated_at: new Date().toISOString() }
            : comment
        )
      )

      setEditingCommentId(null)
      setEditText("")

      toast({
        title: "Comment updated",
        description: "Your comment has been updated",
      })
    } catch (error: any) {
      toast({
        title: "Error updating comment",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comments</h3>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatar_url || ""} />
                    <AvatarFallback>
                      {comment.user.name?.charAt(0).toUpperCase() || comment.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{comment.user.name || comment.user.email}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          {comment.updated_at !== comment.created_at && " (edited)"}
                        </p>
                      </div>
                      {currentUser?.id === comment.user.id && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => startEditing(comment)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="mt-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCommentId(null)}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveEdit}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm">{comment.content}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
        />
        <div className="flex justify-end">
          <Button onClick={addComment} disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
