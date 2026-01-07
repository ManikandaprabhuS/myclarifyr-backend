# MyClarifyr – Authentication Backend Setup Guide

**Goal**: Build a secure email authentication system (Signup, Login, Forgot Password) using Node.js, Express, and Supabase.
**Audience**: Beginner developers.

---

## 1. Prerequisites
- **Node.js** installed ([Download](https://nodejs.org/)).
- **Supabase Account** ([Sign up](https://supabase.com/)).
- A code editor (like VS Code).

---

## 2. Supabase Setup
1. **Create a Project**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard).
   - Click **"New Project"**.
   - Enter Name (e.g., `MyClarifyr-Auth`) and database password.
   - Choose a region close to you.
   - Click **"Create new project"**.

2. **Get API Keys**:
   - Once the project is ready, go to **Project Settings** (cog icon) -> **API**.
   - Copy the following:
     - **Project URL**
     - **anon public key**
   - *Keep these safe! You'll need them for the environment variables.*

3. **Verify Auth Settings**:
   - Go to **Authentication** -> **Providers**.
   - Ensure **Email** is enabled.
   - (Optional) Disable "Confirm email" for faster testing in development (under **Authentication** -> **URL Configuration** or **Providers** -> **Email** settings).

---

## 3. Project Setup (Local Machine)

### A. Initialize Project
Open your terminal and run:

```bash
mkdir myclarifyr-backend
cd myclarifyr-backend
npm init -y
```

### B. Install Dependencies
```bash
npm install express dotenv @supabase/supabase-js cors
npm install --save-dev nodemon
```
- **express**: Web framework.
- **dotenv**: Loads environment variables from `.env`.
- **@supabase/supabase-js**: Official Supabase client.
- **cors**: Allows your frontend to talk to this backend.
- **nodemon**: Automatically restarts server on code changes.

### C. Configure Scripts
Open `package.json` and add a start script:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## 4. Environment Variables
Create a file named `.env` in the root folder.
**DO NOT share this file.** Add it to `.gitignore`.

```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```
*Replace values with the ones you copied from Supabase.*

---

## 5. Testing API
You can use **Postman**, **Insomnia**, or **curl** to test.

1. **Start Server**:
   ```bash
   npm run dev
   ```

2. **Test Signup**:
   - **Method**: POST
   - **URL**: `http://localhost:3000/api/auth/signup`
   - **Body (JSON)**:
     ```json
     {
       "email": "test@example.com",
       "password": "securepassword123"
     }
     ```

3. **Test Login**:
   - **Method**: POST
   - **URL**: `http://localhost:3000/api/auth/login`
   - **Body (JSON)**: Same as above.
   - **Response**: Should return an access token.

---

## 6. Next Steps
- Connect this backend to your Frontend (React/Vue/etc).
- Add Middleware to protect other routes using the Supabase token.
- Enable Social Login (Google/GitHub) in Supabase dashboard.
