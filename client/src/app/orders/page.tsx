"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Package, ChevronRight, Clock } from "lucide-react";
import { useAuth } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrdersPage() {
  const { user, init } = useAuth();
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.push("/login?redirect=/orders");
    }
  }, []);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => import("@/lib/api").then((m) => m.default.get("/orders/my").then((r) => r.data)),
    enabled: !!user,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-7 h-7 text-orange-500" />
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-32" />
          ))}
        </div>
      ) : !orders?.length ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No orders yet</h2>
          <p className="text-gray-500 mt-2 mb-6">Your orders will appear here once you place them</p>
          <button onClick={() => router.push("/")}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const stepIdx = STATUS_STEPS.indexOf(order.status);
            const address = (() => { try { return JSON.parse(order.shipping_address); } catch { return {}; } })();
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                    <span className="text-xs text-gray-300 font-mono">#{order.id.slice(0, 8)}</span>
                  </div>
                  <Badge label={order.status} />
                </div>

                {/* Items */}
                <div className="p-4">
                  <div className="flex gap-3 mb-4">
                    {order.items?.slice(0, 3).map((item: any) => (
                      <img key={item.id} src={item.product_image} alt={item.product_title}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100" />
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {order.status !== "cancelled" && (
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        {STATUS_STEPS.map((s, i) => (
                          <span key={s} className={`text-xs capitalize ${i <= stepIdx ? "text-orange-600 font-medium" : "text-gray-400"}`}>{s}</span>
                        ))}
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${((stepIdx + 1) / STATUS_STEPS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} · {address.city}
                      </p>
                      <p className="text-lg font-bold text-gray-900">{formatPrice(order.total_customer, "LKR")}</p>
                    </div>
                    <Badge label={order.payment_status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
