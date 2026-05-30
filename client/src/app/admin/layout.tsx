"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import {
  LayoutDashboard, ShoppingBag, Users, Settings, Zap, LogOut, ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, init, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u.role !== "admin") router.push("/");
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="flex items-center gap-2 p-6 border-b border-gray-800">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">ShopDrop</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-orange-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}>
                <Icon className="w-5 h-5" />
                {label}
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          {user && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-orange-400 font-bold text-sm">{user.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
