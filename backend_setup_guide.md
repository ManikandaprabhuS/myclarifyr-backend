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

## 5. Coding the Backend

### A. Server Entry Point (`server.js`)
Create `server.js` in the root.

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);

// Base route for testing
app.get('/', (req, res) => {
    res.send('MyClarifyr Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### B. Auth Routes (`routes/auth.js`)
Create a folder `routes`, then a file `auth.js` inside it.

```javascript
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// 1. SIGNUP Route
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'User registered successfully!', user: data.user });
});

// 2. LOGIN Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Login successful!', session: data.session });
});

// 3. FORGOT PASSWORD Route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/rest-password-page', // Update with frontend URL
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Password reset email sent!' });
});

module.exports = router;
```

---

## 6. Testing API
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

## 7. Next Steps
- Connect this backend to your Frontend (React/Vue/etc).
- Add Middleware to protect other routes using the Supabase token.
- Enable Social Login (Google/GitHub) in Supabase dashboard.
