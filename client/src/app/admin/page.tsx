"use client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, ShoppingBag, Users, DollarSign, Clock } from "lucide-react";
import api from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api.get("/admin/analytics").then((r) => r.data),
  });

  const stats = [
    {
      label: "Total Orders",
      value: data?.totalOrders || 0,
      icon: <ShoppingBag className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      label: "Total Revenue",
      value: formatPrice(data?.totalRevenue || 0, "LKR"),
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      bg: "bg-green-50",
    },
    {
      label: "Net Profit",
      value: formatPrice(data?.totalProfit || 0, "LKR"),
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
      bg: "bg-orange-50",
    },
    {
      label: "Customers",
      value: data?.totalCustomers || 0,
      icon: <Users className="w-6 h-6 text-purple-500" />,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your store performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? <span className="animate-pulse bg-gray-200 rounded w-24 h-6 block" /> : s.value}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {data?.ordersByStatus?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between">
                <Badge label={item.status} />
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-orange-500 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {data?.recentOrders?.map((order: any) => (
              <div key={order.id} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{order.customer_name}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatPrice(order.total_customer, "LKR")}</p>
                  <Badge label={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
