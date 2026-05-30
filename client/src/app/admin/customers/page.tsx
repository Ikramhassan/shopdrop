"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";
import api from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers", page],
    queryFn: () => api.get(`/admin/customers?page=${page}&limit=20`).then((r) => r.data),
  });

  const totalPages = Math.ceil((data?.total || 0) / 20);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-7 h-7 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{data?.total || 0} registered customers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Orders</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Total Spent</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.customers?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                          {c.name[0].toUpperCase()}
                        </div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Mail className="w-3.5 h-3.5" /> {c.email}
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                          <Phone className="w-3.5 h-3.5" /> {c.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{c.order_count || 0}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatPrice(c.total_spent || 0, "LKR")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
