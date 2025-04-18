-- Create tables for the collaborative document editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- This is just a reference, Supabase Auth already creates this
-- CREATE TABLE auth.users (
--   id UUID PRIMARY KEY,
--   email TEXT UNIQUE,
--   encrypted_password TEXT,
--   email_confirmed_at TIMESTAMP WITH TIME ZONE,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Document collaborators table
CREATE TABLE document_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'owner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Document versions table for version history
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Document comments table
CREATE TABLE document_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position JSONB, -- Store position information for inline comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI suggestions table
CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('grammar', 'improve', 'summarize', 'custom')),
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_document_collaborators_document_id ON document_collaborators(document_id);
CREATE INDEX idx_document_collaborators_user_id ON document_collaborators(user_id);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX idx_ai_suggestions_document_id ON ai_suggestions(document_id);

-- Create RLS policies for security

-- Documents table policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view documents they collaborate on"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_id = documents.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Editors can update documents they collaborate on"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_id = documents.id AND user_id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (owner_id = auth.uid());

-- Document collaborators table policies
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document owners can manage collaborators"
  ON document_collaborators
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_collaborators.document_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view collaborators for their documents"
  ON document_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_collaborators.document_id AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM document_collaborators AS dc
      WHERE dc.document_id = document_collaborators.document_id AND dc.user_id = auth.uid()
    )
  );

-- Document versions table policies
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document owners can view versions"
  ON document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_versions.document_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can view versions"
  ON document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_id = document_versions.document_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Document owners and editors can create versions"
  ON document_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_versions.document_id AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_id = document_versions.document_id AND user_id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

-- Document comments table policies
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document owners and collaborators can view comments"
  ON document_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_comments.document_id AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_id = document_comments.document_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Document owners and collaborators can create comments"
  ON document_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_comments.document_id AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_id = document_comments.document_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON document_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON document_comments FOR DELETE
  USING (user_id = auth.uid());

-- AI suggestions table policies
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI suggestions"
  ON ai_suggestions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Document owners can view all AI suggestions"
  ON ai_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = ai_suggestions.document_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create AI suggestions for their documents"
  ON ai_suggestions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = ai_suggestions.document_id AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_id = ai_suggestions.document_id AND user_id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

CREATE POLICY "Users can update their own AI suggestions"
  ON ai_suggestions FOR UPDATE
  USING (user_id = auth.uid());

-- Create functions for real-time collaboration

-- Function to notify about document changes
CREATE OR REPLACE FUNCTION notify_document_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'document_changes',
    json_build_object(
      'document_id', NEW.id,
      'title', NEW.title,
      'updated_at', NEW.updated_at,
      'updated_by', NEW.updated_by
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for document changes
CREATE TRIGGER document_change_trigger
AFTER UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION notify_document_change();

-- Function to handle document version creation
CREATE OR REPLACE FUNCTION create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create a version if content or title changed
  IF OLD.content <> NEW.content OR OLD.title <> NEW.title THEN
    INSERT INTO document_versions (document_id, title, content, created_by)
    VALUES (OLD.id, OLD.title, OLD.content, NEW.updated_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic version creation
CREATE TRIGGER document_version_trigger
BEFORE UPDATE ON documents
FOR EACH ROW
WHEN (OLD.content <> NEW.content OR OLD.title <> NEW.title)
EXECUTE FUNCTION create_document_version();
