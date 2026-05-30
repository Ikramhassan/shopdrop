"use client";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { toast } from "@/hooks/useToast";

interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  priceAliexpress?: number;
  rating?: number;
  orders?: number;
  currency?: string;
  source?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const currency = product.currency || "LKR";

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      quantity: 1,
      price: product.price,
      priceAliexpress: product.priceAliexpress || product.price,
    });
    toast("Added to cart!");
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.image || "https://via.placeholder.com/300"}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </div>
          )}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 w-9 h-9 bg-orange-500 text-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-600"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm text-gray-800 line-clamp-2 font-medium leading-tight">{product.title}</p>

          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">{(product.rating || 0).toFixed(1)}</span>
            {product.orders ? (
              <span className="text-xs text-gray-400 ml-1">({product.orders.toLocaleString()} orders)</span>
            ) : null}
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-bold text-gray-900">{formatPrice(product.price, currency)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice, currency)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
