"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Shield, Truck, Star, ArrowRight, Zap, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { name: "Electronics", emoji: "📱", query: "electronics" },
  { name: "Fashion", emoji: "👗", query: "fashion clothing" },
  { name: "Home & Living", emoji: "🏠", query: "home decor" },
  { name: "Beauty", emoji: "💄", query: "beauty skincare" },
  { name: "Sports", emoji: "⚽", query: "sports fitness" },
  { name: "Toys", emoji: "🎮", query: "toys kids" },
  { name: "Watches", emoji: "⌚", query: "watches" },
  { name: "Bags", emoji: "👜", query: "bags handbags" },
];

const TRENDING = ["wireless earbuds", "smart watch", "led lights", "phone case", "yoga mat"];

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const { data: featured, isLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => api.get("/products/search?q=trending&pageSize=8").then((r) => r.data),
  });

  const { data: deals } = useQuery({
    queryKey: ["products", "deals"],
    queryFn: () => api.get("/products/search?q=wireless earbuds&pageSize=4").then((r) => r.data),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-200" />
              <span className="text-sm font-semibold text-orange-100 uppercase tracking-wide">
                AliExpress Products · Sri Lankan Prices
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Shop Global,<br />
              <span className="text-yellow-200">Save Big</span>
            </h1>
            <p className="text-lg text-orange-100 mb-8 leading-relaxed">
              Millions of products from AliExpress delivered to your door. We handle everything so you don&apos;t have to.
            </p>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 bg-white text-base focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                />
              </div>
              <Button type="submit" size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-6 rounded-xl shadow-lg">
                Search
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-orange-200 font-medium">Trending:</span>
              {TRENDING.map((t) => (
                <button key={t} onClick={() => router.push(`/search?q=${encodeURIComponent(t)}`)}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="w-6 h-6 text-green-500" />, title: "Secure Payments", desc: "100% safe & encrypted" },
              { icon: <Truck className="w-6 h-6 text-blue-500" />, title: "Fast Delivery", desc: "Delivered to your door" },
              { icon: <TrendingUp className="w-6 h-6 text-orange-500" />, title: "Best Prices", desc: "We compare & save" },
              { icon: <Star className="w-6 h-6 text-yellow-500" />, title: "Quality Assured", desc: "Top-rated only" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-xl">{item.icon}</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <button key={cat.name}
                onClick={() => router.push(`/search?q=${encodeURIComponent(cat.query)}`)}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-gray-700 text-center group-hover:text-orange-600">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-sm text-gray-500 mt-1">Hand-picked deals just for you</p>
            </div>
            <button onClick={() => router.push("/search?q=trending")}
              className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured?.products?.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Flash Deals */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">⚡ Flash Deals</h2>
              <p className="text-sm text-gray-500 mt-1">Limited time offers</p>
            </div>
            <button onClick={() => router.push("/search?q=wireless")}
              className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium text-sm">
              See more <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deals?.products?.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Banner CTA */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Can&apos;t find what you&apos;re looking for?</h2>
          <p className="text-gray-300 mb-6 text-lg">Search from millions of AliExpress products and we&apos;ll get it for you.</p>
          <Button onClick={() => router.push("/search?q=popular")} size="xl" className="bg-orange-500 hover:bg-orange-600">
            Browse All Products
          </Button>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">ShopDrop</span>
            </div>
            <p className="text-sm text-gray-500">© 2024 ShopDrop · Products sourced from AliExpress</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
