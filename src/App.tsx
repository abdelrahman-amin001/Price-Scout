import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ICONS } from "./constants";
import { ProductCard } from "./components/ProductCard";
import { normalizeProducts, NormalizedProduct } from "./services/geminiService";

export default function App() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<NormalizedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<"price" | "value">("price");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedSource, setSelectedSource] = useState<string>("All");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      // 1. Fetch raw results from our backend
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Backend search failed");
      const { results: rawData } = await response.json();

      if (rawData.length === 0) {
        setError("No products found for this search.");
        setIsSearching(false);
        return;
      }

      // 2. Normalize results using Gemini AI (on the frontend)
      const normalized = await normalizeProducts(query, rawData);
      setResults(normalized);
    } catch (err) {
      console.error(err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const processedResults = useMemo(() => {
    let filtered = [...results];

    // Apply Filters
    if (selectedBrand !== "All") {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }
    if (selectedSource !== "All") {
      filtered = filtered.filter(p => p.source === selectedSource);
    }

    // Apply Sorting
    filtered.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "value") return a.price_per_unit - b.price_per_unit;
      return 0;
    });

    return filtered;
  }, [results, sortBy, selectedBrand, selectedSource]);

  const brands = useMemo(() => ["All", ...new Set(results.map(p => p.brand))], [results]);
  const sources = useMemo(() => ["All", ...new Set(results.map(p => p.source))], [results]);

  const cheapestId = useMemo(() => {
    if (results.length === 0) return null;
    return [...results].sort((a, b) => a.price - b.price)[0].id;
  }, [results]);

  const bestValueId = useMemo(() => {
    if (results.length === 0) return null;
    return [...results].sort((a, b) => a.price_per_unit - b.price_per_unit)[0].id;
  }, [results]);

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-gray-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
              <ICONS.ShoppingCart className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">PriceScout</h1>
          </div>

          <form onSubmit={handleSearch} className="flex-1 w-full relative">
            <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for? (e.g. Milk, Headphones, Coffee)"
              className="w-full bg-gray-100/50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-gray-900/10 transition-all outline-none"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </form>

          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <ICONS.ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Live Aggregation Active</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {results.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex flex-col gap-8">
              <div>
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-100 pb-2">
                  <ICONS.Filter className="w-3 h-3" />
                  Filter Results
                </h3>
                
                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Brand</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-colors"
                    >
                      {brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Source</label>
                    <select
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-colors"
                    >
                      {sources.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-100 pb-2">
                  <ICONS.ArrowUpDown className="w-3 h-3" />
                  Sort By
                </h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSortBy("price")}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${sortBy === 'price' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                  >
                    Cheapest Total
                  </button>
                  <button
                    onClick={() => setSortBy("value")}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${sortBy === 'value' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                  >
                    Best Unit Value
                  </button>
                </div>
              </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-1">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                  Search Results <span className="text-gray-300 ml-2">/</span> <span className="text-gray-400 font-medium normal-case tracking-normal">{processedResults.length} found</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {processedResults.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      isCheapest={product.id === cheapestId}
                      isBestValue={product.id === bestValueId}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
            {!isSearching ? (
              <>
                <div className="w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center transform rotate-12 mb-4">
                  <ICONS.Search className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic text-gray-300">Start Scouting</h2>
                <p className="text-gray-400 max-w-sm font-medium">Search for any product to compare prices across different brands and stores instantly.</p>
              </>
            ) : (
              <div className="space-y-8 flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-gray-100 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold italic uppercase tracking-tight text-gray-900">Scouting the web...</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 justify-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    AI-Powered Normalization in progress
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 bg-red-50 px-6 py-3 rounded-2xl text-sm font-semibold border border-red-100 mt-4">
                {error}
              </p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 grayscale brightness-50 opacity-50">
            <ICONS.ShoppingCart className="w-4 h-4" />
            <h1 className="text-xs font-black tracking-tighter uppercase italic">PriceScout</h1>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">© 2026 Smart Aggregator Systems</p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">API Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
