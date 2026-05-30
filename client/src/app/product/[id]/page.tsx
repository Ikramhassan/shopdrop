"use client";
import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, Package, Shield, Truck, ChevronLeft, Plus, Minus, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedSku, setSelectedSku] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
  });

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-gray-100 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="h-6 bg-gray-100 rounded w-1/2" />
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const sku = selectedSku || product.skus?.[0];
  const price = sku?.price || product.price;
  const currency = product.currency || "LKR";

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productTitle: product.title,
      productImage: product.images?.[0] || product.image,
      skuId: sku?.skuId,
      variantName: sku?.properties,
      quantity: qty,
      price,
      priceAliexpress: sku?.priceAliexpress || product.priceAliexpress,
    });
    toast(`Added ${qty}x to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            <img
              src={product.images?.[mainImg] || product.image || "https://via.placeholder.com/600"}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.slice(0, 6).map((img: string, i: number) => (
                <button key={i} onClick={() => setMainImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${mainImg === i ? "border-orange-500" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">{product.title}</h1>
            <Badge label={product.source?.replace("_mock", "")} className="shrink-0" />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
              ))}
              <span className="text-sm text-gray-500 ml-1">{(product.rating || 0).toFixed(1)}</span>
            </div>
            {product.orders && (
              <span className="text-sm text-gray-500">{product.orders.toLocaleString()} orders</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-extrabold text-gray-900">{formatPrice(price, currency)}</span>
            {product.originalPrice && product.originalPrice > price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice, currency)}</span>
                <span className="text-sm font-bold text-green-600">
                  {Math.round(((product.originalPrice - price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* SKU selector */}
          {product.skus?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Variants</p>
              <div className="flex flex-wrap gap-2">
                {product.skus.map((s: any) => (
                  <button
                    key={s.skuId}
                    onClick={() => setSelectedSku(s)}
                    className={`px-3 py-1.5 text-sm rounded-lg border-2 transition ${
                      (selectedSku?.skuId || product.skus[0]?.skuId) === s.skuId
                        ? "border-orange-500 bg-orange-50 text-orange-700 font-medium"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {s.properties || `Option ${s.skuId}`}
                    {s.stock < 10 && s.stock > 0 && (
                      <span className="ml-1 text-xs text-orange-500">({s.stock} left)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-sm font-semibold text-gray-700">Quantity</p>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-100 transition">
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-gray-100 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <Button onClick={handleBuyNow} size="lg" className="flex-1 rounded-xl">
              Buy Now
            </Button>
            <Button onClick={handleAddToCart} variant="outline" size="lg" className="flex-1 rounded-xl">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </Button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
            {[
              { icon: <Shield className="w-5 h-5 text-green-500" />, text: "Buyer Protection" },
              { icon: <Truck className="w-5 h-5 text-blue-500" />, text: "Free Shipping" },
              { icon: <Package className="w-5 h-5 text-orange-500" />, text: "Easy Returns" },
            ].map((g) => (
              <div key={g.text} className="flex flex-col items-center gap-1 text-center">
                {g.icon}
                <span className="text-xs text-gray-600">{g.text}</span>
              </div>
            ))}
          </div>

          {product.url && (
            <a href={product.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-4 transition">
              View on AliExpress <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
