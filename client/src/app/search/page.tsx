"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, Suspense } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => { setPage(1); }, [q]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", "search", q, page],
    queryFn: () =>
      api.get(`/products/search?q=${encodeURIComponent(q)}&page=${page}&pageSize=20`).then((r) => r.data),
    enabled: !!q,
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const sorted = [...products].sort((a: any, b: any) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "orders") return (b.orders || 0) - (a.orders || 0);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {q ? `Results for "${q}"` : "All Products"}
          </h1>
          {!isLoading && (
            <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} products found</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-orange-400"
          >
            <option value="default">Best Match</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="orders">Most Popular</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20">
          <p className="text-red-500 font-medium">Failed to load products. Is the server running?</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No products found</h2>
          <p className="text-gray-500 mt-2">Try a different search term</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sorted.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <Button
                variant="secondary" size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary" size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
