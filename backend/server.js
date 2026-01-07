require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const cheerio = require('cheerio');


const app = express();
const PORT = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);

// Protected Route Example
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({
        message: 'You have accessed a protected route!',
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

// Base route for testing
app.get('/', (req, res) => {
    res.send('MyClarifyr Backend is running!');
});

app.post("/api/explain", authMiddleware, async (req, res) => {
    try {
        const { url, text } = req.body;
        let contentToExplain = text || "";

        // 1. If URL is provided, fetch and scrape it
        if (url) {
            console.log(`Fetching URL: ${url}`);
            try {
                const { data } = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    timeout: 10000 // 10 second timeout
                });

                const $ = cheerio.load(data);
                // Remove junk
                $('script, style, iframe, nav, footer, header, .ads, .cookie-consent').remove();

                // Get text and clean it
                let scrapedText = $('body').text().replace(/\s+/g, ' ').trim();

                // Limit to ~10,000 chars to avoid huge payloads (Flash handles 1M, but smaller is faster)
                if (scrapedText.length > 15000) {
                    scrapedText = scrapedText.substring(0, 15000) + "...[TRUNCATED]";
                }

                contentToExplain = scrapedText;
                console.log(`Scraped content length: ${contentToExplain.length}`);

            } catch (scrapeError) {
                console.error("Scraping failed:", scrapeError.message);
                return res.status(400).json({ error: "Failed to fetch content from URL", details: scrapeError.message });
            }
        }

        if (!contentToExplain) {
            return res.status(400).json({ error: "Please provide 'url' or 'text' to explain." });
        }


        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest"
        });

        const prompt = `
You are an expert tutor. Create a CLEAR, CONCISE, and SIMPLE explanation of the following content.

Requirements:
- Target audience: Beginner / Non-technical
- Tone: Friendly and helpful
- Format:
  1. 📌 **Quick Summary** (1-2 sentences)
  2. 💡 **Key Concepts** (Bullet points, max 3)
  3. 🚀 **Real-World Example** (1 short paragraph)
- Strict limit: Keep the total response under 200 words if possible.

Content to Explain:
${contentToExplain}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const explanation = response.text();

        res.json({
            success: true,
            explainedForUser: req.user.email,
            source: url ? "url" : "text",
            explanation
        });

    } catch (error) {
        console.error("Error generating content:", error);
        console.error("Error Details:", JSON.stringify(error, null, 2));
        res.status(500).json({
            error: "Failed to generate explanation",
            details: error.message
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
