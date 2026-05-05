import { motion } from "motion/react";
import { NormalizedProduct } from "../services/geminiService";
import { ICONS } from "../constants";

interface ProductCardProps {
  product: NormalizedProduct;
  isCheapest?: boolean;
  isBestValue?: boolean;
}

export function ProductCard({ product, isCheapest, isBestValue }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-4">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="max-w-full max-h-full object-contain mix-blend-multiply"
            referrerPolicy="no-referrer"
          />
        ) : (
          <ICONS.Package className="w-12 h-12 text-gray-200" />
        )}
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isCheapest && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Cheapest
            </span>
          )}
          {isBestValue && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Best Value
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col h-[180px]">
        <div className="mb-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 truncate">
            {product.brand}
          </p>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 h-10 mb-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <ICONS.Globe className="w-3 h-3" />
              {product.source}
            </div>
            <span className="text-[10px] text-gray-400">{product.unit}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-50 flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-gray-900 leading-none">
              {product.currency === 'USD' ? '$' : ''}{product.price.toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              {product.currency === 'USD' ? '$' : ''}{product.price_per_unit.toFixed(2)} / unit
            </p>
          </div>
          
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Buy Now
            <ICONS.ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
