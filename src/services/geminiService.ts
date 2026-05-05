import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface NormalizedProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  unit: string;
  price_per_unit: number;
  source: string;
  url: string;
  image_url: string;
}

export async function normalizeProducts(query: string, rawResults: any[]): Promise<NormalizedProduct[]> {
  if (rawResults.length === 0) return [];

  const prompt = `
    I have a list of raw search results for the product query: "${query}".
    Please normalize these results into a clean JSON array of products.
    
    For each item:
    1. Extract a clean Product Name (e.g., "Organic Whole Milk").
    2. Extract the Brand/Company (e.g., "Horizon").
    3. Parse the Price as a number (remove currency symbols).
    4. Detect the Currency (e.g., "USD").
    5. Detect the Unit (e.g., "1 Gallon", "500ml", "1kg").
    6. Calculate 'price_per_unit' if possible (e.g., price per liter or per kg). If not possible, estimate based on common benchmarks or set to the price.
    7. Retain the 'source', 'url', and 'image_url' from the raw data.
    8. Merge identical products from the SAME source into a single entry if they are clearly duplicates.
    
    Raw results:
    ${JSON.stringify(rawResults)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              brand: { type: Type.STRING },
              price: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              unit: { type: Type.STRING },
              price_per_unit: { type: Type.NUMBER },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              image_url: { type: Type.STRING },
            },
            required: ["name", "brand", "price", "currency", "unit", "price_per_unit", "source", "url"],
          }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((item: any, index: number) => ({
      ...item,
      id: `${item.source}-${index}`
    }));
  } catch (error) {
    console.error("Gemini normalization error:", error);
    // Fallback: simple mapping if AI fails (though it should work)
    return rawResults.map((r, i) => ({
      id: `fallback-${i}`,
      name: r.raw_title,
      brand: "Unknown",
      price: parseFloat(r.raw_price.replace(/[^0-9.]/g, "")) || 0,
      currency: "USD",
      unit: "Piece",
      price_per_unit: parseFloat(r.raw_price.replace(/[^0-9.]/g, "")) || 0,
      source: r.source,
      url: r.url,
      image_url: r.image_url
    }));
  }
}
