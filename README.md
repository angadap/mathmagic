# MathMagic Space Academy — Deploy to Vercel

## Deploy in 3 steps (no coding needed)

### Step 1 — Upload to GitHub
1. Go to github.com → Sign in → click **"New repository"**
2. Name it `mathmagic-space-academy` → click **Create repository**
3. Click **"uploading an existing file"**
4. Drag ALL files from this folder into the upload area
5. Click **"Commit changes"**

### Step 2 — Deploy on Vercel
1. Go to vercel.com → Sign in with GitHub
2. Click **"Add New Project"**
3. Select your `mathmagic-space-academy` repo → click **Import**
4. Framework: **Vite** (auto-detected)
5. Click **Deploy** — wait ~60 seconds
6. Vercel gives you a URL like `mathmagic-space-academy.vercel.app`

### Step 3 — Update Supabase URL Configuration
1. Go to supabase.com → your project → Authentication → URL Configuration
2. Change **Site URL** to your Vercel URL (e.g. `https://mathmagic-space-academy.vercel.app`)
3. Add to **Redirect URLs**: `https://mathmagic-space-academy.vercel.app/**`
4. Click **Save changes**

## That's it!
- Your app is now live at the Vercel URL
- Supabase DB writes will work (no claude.ai sandbox restrictions)
- Share the URL with anyone — works on mobile too
