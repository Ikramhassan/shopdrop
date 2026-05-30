"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Search, User, LogOut, Package, Settings, Menu, X, Zap } from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { Button } from "./ui/button";

export default function Navbar() {
  const { count } = useCart();
  const { user, logout, init } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { init(); }, [init]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const cartCount = count();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">ShopDrop</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search millions of products..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white transition"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition text-sm"
                >
                  <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-xs">{user.name[0].toUpperCase()}</span>
                  </div>
                  <span className="hidden md:block text-gray-700 font-medium">{user.name.split(" ")[0]}</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <Link href="/orders" onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <Link href="/profile" onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button onClick={() => { logout(); setOpen(false); router.push("/"); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="outline">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </header>
  );
}
