import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Product Search
  // We perform the raw fetches here because of CORS and backend-only capabilities
  app.get("/api/search", async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    try {
      console.log(`Searching for: ${q}`);
      
      // Parallel fetch from different sources
      const [ebayResults, etsyResults] = await Promise.all([
        searchEbay(q),
        searchEtsy(q)
      ]);
      
      const combinedResults = [...ebayResults, ...etsyResults];
      
      if (combinedResults.length === 0) {
        return res.status(404).json({ error: "No products found across sources" });
      }

      res.json({ results: combinedResults });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to perform search" });
    }
  });

  async function searchEtsy(query: string) {
    const url = `https://www.etsy.com/search?q=${encodeURIComponent(query)}`;
    try {
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        },
        timeout: 8000
      });
      const $ = cheerio.load(html);
      const items: any[] = [];

      $('.wt-grid__item-section').each((i, el) => {
        const title = $(el).find('h3').text().trim();
        const price = $(el).find('.currency-value').first().text().trim();
        const link = $(el).find('a.listing-link').attr('href');
        const image = $(el).find('img').attr('src');
        
        if (title && price) {
          items.push({
            raw_title: title,
            raw_price: `$${price}`,
            url: link,
            image_url: image,
            source: "Etsy",
            seller_info: "Unknown"
          });
        }
      });

      return items.slice(0, 10);
    } catch (err: any) {
      console.error("Etsy fetch failed:", err?.response?.status || err.message);
      return [];
    }
  }

  async function searchEbay(query: string) {
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_ipg=25`;
    try {
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000
      });
      const $ = cheerio.load(html);
      const items: any[] = [];

      $('.s-item__wrapper').each((i, el) => {
        // Skip decorative/ad items
        const title = $(el).find('.s-item__title').text();
        const price = $(el).find('.s-item__price').text();
        
        if (title && price && !title.includes('Shop on eBay')) {
          const link = $(el).find('.s-item__link').attr('href');
          const image = $(el).find('.s-item__image-img').attr('src') || $(el).find('.s-item__image-img').attr('data-src');
          const seller = $(el).find('.s-item__seller-info').text();

          items.push({
            raw_title: title.replace('New Listing', '').trim(),
            raw_price: price,
            url: link,
            image_url: image,
            source: "eBay",
            seller_info: seller
          });
        }
      });

      return items.slice(0, 20);
    } catch (err: any) {
      console.error("eBay fetch failed:", err?.response?.status || err.message);
      return [];
    }
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
