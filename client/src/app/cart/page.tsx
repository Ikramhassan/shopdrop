"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clear } = useCart();
  const router = useRouter();
  const cartTotal = total();
  const currency = "LKR";

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some products to get started!</p>
        <Button onClick={() => router.push("/")} size="lg">Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length} item{items.length !== 1 ? "s" : ""})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.skuId}`}
              className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <img src={item.productImage} alt={item.productTitle}
                className="w-20 h-20 rounded-xl object-cover bg-gray-50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.productId}`}>
                  <p className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-orange-600 transition">{item.productTitle}</p>
                </Link>
                {item.variantName && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.productId, item.skuId, item.quantity - 1)}
                      className="px-2.5 py-1 hover:bg-gray-100 transition">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-sm font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.skuId, item.quantity + 1)}
                      className="px-2.5 py-1 hover:bg-gray-100 transition">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity, currency)}</span>
                    <button onClick={() => removeItem(item.productId, item.skuId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.skuId}`} className="flex justify-between text-sm text-gray-600">
                  <span className="line-clamp-1 flex-1 mr-2">{item.productTitle} ×{item.quantity}</span>
                  <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity, currency)}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(cartTotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-semibold text-sm">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-gray-100">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-xl font-extrabold text-orange-600">{formatPrice(cartTotal, currency)}</span>
              </div>
            </div>
            <Button onClick={() => router.push("/checkout")} size="lg" className="w-full mt-4 rounded-xl">
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Button>
            <button onClick={clear} className="w-full mt-3 text-sm text-gray-400 hover:text-red-500 transition py-2">
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
