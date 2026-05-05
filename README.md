## 💳 No Credit Card Required
All technologies used in this project are **completely free** and do not require a credit card for initial setup:
- **Google AI Studio (Gemini):** The free tier for Gemini 1.5 Flash does not require a card.
- **Scraping (Axios/Cheerio):** Runs locally on your server for $0.
- **Hosting:** Can be hosted on free tiers like Render, Railway, or Google Cloud (Free tier) often with simple email verification.

## 🚀 Key Features

- **Cross-Platform Aggregation**: Scrapes real-time data from sources like eBay.
- **AI Normalization**: Uses Gemini 3 Flash to convert messy search titles into clean brand, product, and unit data.
- **Smart Comparison**:
  - Sort by **Cheapest Total**.
  - Sort by **Best Unit Value** (Price per Liter, Kg, etc.).
- **Dynamic Filtering**: Filter results by Brand or Store source.
- **Polished UI**: Built with React, Tailwind CSS, and Motion.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Motion.
- **Backend**: Node.js, Express, Axios, Cheerio.
- **AI Engine**: Google Gemini 3 Flash (via `@google/genai`).

## 📦 Installation & Running Locally

1. **Clone and Install**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Create a `.env` file (or use the platform secrets) and add:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. **Start Development**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 🌐 Deployment

### Backend (Express)
- Can be deployed to **Render**, **Railway**, or **Google Cloud Run**.
- Ensure the `PORT` is set correctly (default is 3000).

### Frontend (Static)
- Since this is a full-stack app, the frontend is served by the Express server.
- For a static-only deploy, you would need to mock the scraping logic or use serverless functions for the `/api/search` endpoint.

---

*Note: Scraping logic is modular and can be extended in `server.ts` by adding more adapter functions.*
