"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/useToast";

const STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [aeOrderId, setAeOrderId] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter, page],
    queryFn: () =>
      api.get(`/orders?${statusFilter !== "all" ? `status=${statusFilter}&` : ""}page=${page}&limit=15`)
         .then((r) => r.data),
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, ...body }: any) => api.patch(`/orders/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast("Order updated!");
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / 15);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.total || 0} total orders</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
              statusFilter === s
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Order</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Items</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Profit</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.orders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {order.items?.slice(0, 2).map((item: any) => (
                          <img key={item.id} src={item.product_image} alt=""
                            className="w-9 h-9 rounded-lg object-cover bg-gray-100" />
                        ))}
                        {order.items?.length > 2 && (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                            +{order.items.length - 2}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatPrice(order.total_customer, "LKR")}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      {formatPrice(order.markup, "LKR")}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrder.mutate({ id: order.id, status: e.target.value })}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-orange-400"
                      >
                        {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setSelectedOrder(order); setAeOrderId(order.aliexpress_order_id || ""); }}
                        className="text-orange-500 hover:text-orange-600 font-medium text-xs flex items-center gap-1">
                        Edit <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Order #{selectedOrder.id.slice(0, 8)}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  AliExpress Order ID
                </label>
                <Input value={aeOrderId} onChange={(e) => setAeOrderId(e.target.value)}
                  placeholder="Enter AliExpress order number..." />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Items to order on AliExpress:</p>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                    <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product_title}</p>
                      <p className="text-xs text-gray-500">×{item.quantity} · Cost: {formatPrice(item.price_aliexpress * item.quantity, "LKR")}</p>
                    </div>
                    <a href={`https://www.aliexpress.com/item/${item.product_id}.html`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setSelectedOrder(null)} variant="secondary" className="flex-1">Cancel</Button>
              <Button
                onClick={() => {
                  updateOrder.mutate({ id: selectedOrder.id, aliexpressOrderId: aeOrderId, status: "confirmed" });
                  setSelectedOrder(null);
                }}
                className="flex-1"
              >
                Save & Mark Confirmed
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
