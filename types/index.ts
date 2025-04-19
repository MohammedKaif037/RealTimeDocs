export interface User {
    id: string
    email: string
    name?: string
    avatar_url?: string
  }
  
  export interface Document {
    id: string
    title: string
    content: any
    owner_id: string
    created_at: string
    updated_at: string
    updated_by?: string
    owner?: User
    lastEditor?: User
    collaborators?: Collaborator[]
    role?: "owner" | "editor" | "viewer"
  }
  
  export interface Collaborator {
    id: string
    role: "owner" | "editor" | "viewer"
    user: User
  }
  
  export interface Version {
    id: string
    title: string
    content?: any
    created_at: string
    created_by: string
    creator_name?: string
  }
  
  export interface Comment {
    id: string
    content: string
    position?: any
    created_at: string
    updated_at: string
    user: User
  }
  
  export interface AISuggestion {
    id: string
    content: string
    type: "grammar" | "improve" | "summarize" | "custom"
    applied: boolean
    created_at: string
    user: User
  }
  
  export interface GrammarSuggestion {
    original: string
    suggestion: string
    reason: string
    context: string
    position?: { from: number; to: number }
  }
  
  export interface ImprovementSuggestion {
    type: string
    suggestion: string
    context: string
  }
  
  export interface SummarySuggestion {
    summary: string
    keyPoints: string[]
    wordCount: number
    readingTime: string
  }
  