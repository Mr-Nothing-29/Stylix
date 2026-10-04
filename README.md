# Stylix — Module 1: Auth & User Profiles

Fashion customization & tailoring marketplace. This module covers signup, login,
role selection (customer / tailor / supplier), and profile view/edit.

**Stack:** React (Vite) frontend, FastAPI backend, Supabase for auth + database.

## Design

- Palette: ivory `#F6F3EC`, ink `#16140F`, brass `#A9803E`, wine `#4E1B22`.
- Type: Cormorant Garamond (headings), Jost (body/UI).
- Signature element: a measuring-tape tick-mark motif on the auth screens —
  a nod to the tailoring theme instead of generic decoration.

## Setup

### 1. Supabase

1. Create a project at supabase.com.
2. In the SQL editor, run `backend/supabase_schema.sql` to create the `profiles` table.
3. Grab your project URL, anon key, and service role key from Project Settings → API.

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
uvicorn app.main:app --reload
```

Runs at `http://localhost:8000`. Visit `/docs` for interactive API docs.

### 3. Frontend

```bash
cd frontend
npm create vite@latest . -- --template react   # if not scaffolded yet
npm install react-router-dom @supabase/supabase-js
cp .env.example .env          # fill in Supabase URL + anon key
npm run dev
```

Runs at `http://localhost:5173`. Visit `/signup` to create an account, then `/login`.

## What's in this module

```
frontend/src/
  lib/supabaseClient.js       Supabase client (auth session handling)
  context/AuthContext.jsx     Session state, signup/login/logout
  services/api.js             Calls to the FastAPI backend
  components/BrandPanel.jsx   Shared dark panel + measuring-tape motif
  pages/Login.jsx
  pages/Signup.jsx            Includes role selection
  pages/Profile.jsx           View + edit profile, sign out
  styles/theme.css            Design tokens and shared classes

backend/app/
  main.py                     FastAPI app + CORS
  database.py                 Supabase client (service role)
  schemas.py                  Request/response models
  deps.py                     JWT verification dependency
  routers/auth.py             POST /auth/signup, POST /auth/login
  routers/users.py            GET/PUT /users/me
```

## Next module

Say the word when you're ready for **Module 2 — Garment Customization Studio**.
