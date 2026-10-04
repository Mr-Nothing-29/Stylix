# Deploying Stylix

Frontend → Vercel. Backend → Render. Database → Supabase (already hosted,
nothing to deploy there).

## 1. Push your code to GitHub

1. Create a new repository on github.com (public or private, either works).
2. In your project's root folder (the one containing `frontend/` and
   `backend/`), run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
   The `.gitignore` in this project already excludes `node_modules`,
   `venv`, and your `.env` files — your Supabase keys will NOT be pushed.

## 2. Deploy the backend to Render

1. Go to render.com, sign up/sign in with GitHub.
2. Click **New +** → **Web Service** → connect your repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, add:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase secret key
   - `GEMINI_API_KEY` = (optional, only if you're using real AI recommendations)
   - `ALLOWED_ORIGINS` = leave blank for now, you'll fill this in after step 3
5. Click **Create Web Service**. First deploy takes a few minutes.
6. Once live, copy your Render URL (looks like
   `https://stylix-backend.onrender.com`).

**Free tier note:** Render's free web services "spin down" after 15
minutes of no traffic, and the next request wakes it back up — which
takes 30-60 seconds. If you're demoing live, open your app a minute or
two before you need it so the backend is already awake.

## 3. Deploy the frontend to Vercel

1. Go to vercel.com, sign up/sign in with GitHub.
2. Click **Add New** → **Project** → import your repo.
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (should auto-detect)
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase publishable key
   - `VITE_API_BASE_URL` = your Render URL from step 2 (e.g.
     `https://stylix-backend.onrender.com`)
   - `VITE_UPI_ID` = your real UPI ID (if using Module 5's real QR payment)
   - `VITE_UPI_PAYEE_NAME` = your name or "Stylix"
5. Click **Deploy**. A couple minutes later you'll get a URL like
   `https://stylix.vercel.app`.

## 4. Connect them — update CORS

Now that you have your real Vercel URL:

1. Go back to Render → your backend service → **Environment**.
2. Set `ALLOWED_ORIGINS` to your Vercel URL (e.g.
   `https://stylix.vercel.app`) — no trailing slash.
3. Save. Render will automatically redeploy with the new setting.

## 5. Test the live version

Open your Vercel URL and try signup, login, and browsing tailors. If
something fails, open your browser's dev tools (F12) → Console/Network
tab — a "CORS" or "Failed to fetch" error usually means step 4 didn't
save correctly, or `VITE_API_BASE_URL` has a typo.

## Redeploying after changes

- **Frontend:** Vercel auto-redeploys every time you `git push` to `main`.
- **Backend:** Render also auto-redeploys on push, by default.

So once this is set up, your normal workflow is just: make changes
locally → test with `npm run dev` / `uvicorn` → `git push` → both
platforms redeploy automatically within a couple minutes.
