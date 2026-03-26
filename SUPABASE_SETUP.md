## Supabase Setup Guide

This application now uses **Supabase Storage** for image uploads instead of local file storage.

### Prerequisites
- Supabase account (create one at https://supabase.com)
- A Supabase project with storage enabled

### Setup Steps

#### 1. Create a Supabase Project
- Go to https://supabase.com and sign up/login
- Create a new project
- Note your **Project URL** and **Anon Key** (found in Settings → API)

#### 2. Create a Storage Bucket
- Go to Storage in your Supabase dashboard
- Click "Create a new bucket"
- Name it `animah-uploads` (or use a different name - you'll set it in `.env`)
- Make it **Public** so images can be viewed

#### 3. Update Environment Variables
Edit `.env` in the backend directory:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_BUCKET_NAME=animah-uploads
```

#### 4. Test the Configuration
- Start the backend: `npm run dev`
- Upload an image through add-title form
- Check Supabase dashboard → Storage → animah-uploads to verify files are uploaded

### How It Works

**Before (Local Storage):**
```
File Upload → Multer → /uploads folder → Serve via /uploads endpoint
```

**Now (Supabase):**
```
File Upload → Multer (validation) → Supabase Storage → Get public URL → Store URL in database
```

### Key Changes

1. **upload.ts** - Now uses memory storage for temporary buffering
2. **title.controller.ts** - Uploads files to Supabase and stores the public URL
3. **app.ts** - Removed local `/uploads` static file serving
4. **supabase.ts** - Supabase client initialization
5. **supabase-utils.ts** - Helper functions for managing Supabase images

### Image Deletion

When a title is deleted, the associated image is automatically removed from Supabase storage via the utility functions in `supabase-utils.ts`.

### Troubleshooting

**"Missing Supabase credentials"** → Update `.env` with your Supabase credentials

**"Image upload failed"** → Check:
- Supabase credentials are correct
- Bucket exists and is public
- Network connectivity

**Images not loading** → Verify:
- Bucket is set to public
- Image URL format is correct
- CORS settings in Supabase (should allow your domain)
