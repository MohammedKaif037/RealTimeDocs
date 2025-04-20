# DocCollab - Collaborative Document Editor

DocCollab is a real-time collaborative document editor with AI-powered writing assistance. It allows teams to work together on documents, track changes, and get AI suggestions to improve their writing.

## Features

- **Real-time Collaboration**: Work together with your team in real-time
- **Version History**: Track changes and restore previous versions
- **AI Writing Assistant**: Get grammar checking and content suggestions
- **Document Sharing**: Invite collaborators with different permission levels
- **Rich Text Editor**: Format your documents with a powerful WYSIWYG editor
- **Comments**: Discuss specific parts of your documents
- **User Profiles**: Customize your profile and preferences

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Realtime)
- **Editor**: TipTap (based on ProseMirror)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/doccollab.git
   cd doccollab
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file in the root directory with your Supabase credentials:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   \`\`\`

4. Set up the database schema:
   - Go to your Supabase project
   - Navigate to the SQL Editor
   - Run the SQL commands from `supabase/schema.sql`

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- `documents`: Stores document content and metadata
- `document_collaborators`: Manages user access to documents
- `document_versions`: Tracks document version history
- `document_comments`: Stores comments on documents
- `ai_suggestions`: Stores AI-generated writing suggestions

## Deployment

### Deploy on Vercel

The easiest way to deploy DocCollab is to use the [Vercel Platform](https://vercel.com):

1. Push your code to a GitHub repository
2. Import the project to Vercel
3. Add your environment variables
4. Deploy!

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side operations)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [TipTap](https://tiptap.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
