"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Zap, DollarSign, Store, Globe, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MODES = [
  {
    id: "rapidapi",
    label: "RapidAPI (Recommended)",
    icon: "⚡",
    desc: "Real AliExpress data via RapidAPI. Free tier available — sign up takes 2 minutes.",
    color: "border-green-500 bg-green-50",
    badge: "REAL DATA",
    badgeColor: "bg-green-500",
  },
  {
    id: "affiliate",
    label: "Official Affiliate API",
    icon: "🔑",
    desc: "AliExpress DS Open Platform API. Requires official approval (1-2 days).",
    color: "border-blue-500 bg-blue-50",
    badge: "REAL DATA",
    badgeColor: "bg-blue-500",
  },
  {
    id: "scraper",
    label: "Demo / Mock Mode",
    icon: "🧪",
    desc: "Uses realistic mock product data. No credentials needed. For testing UI only.",
    color: "border-gray-400 bg-gray-50",
    badge: "MOCK",
    badgeColor: "bg-gray-500",
  },
];

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.get("/admin/settings").then((r) => r.data),
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const save = useMutation({
    mutationFn: (body: any) => api.put("/admin/settings", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast("Settings saved!");
    },
    onError: () => toast("Failed to save settings", "error"),
  });

  if (!form) return <div className="p-8 text-gray-500">Loading...</div>;

  const set = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }));

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-7 h-7 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Configure your store and AliExpress integration</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* API Mode */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-gray-900">AliExpress Data Source</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Choose how to fetch real product data from AliExpress.
          </p>
          <div className="space-y-3">
            {MODES.map((mode) => (
              <label key={mode.id}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                  form.api_mode === mode.id ? mode.color : "border-gray-200 hover:border-gray-300 bg-white"
                }`}>
                <input type="radio" name="api_mode" value={mode.id}
                  checked={form.api_mode === mode.id}
                  onChange={() => set("api_mode", mode.id)}
                  className="mt-1" />
                <span className="text-2xl">{mode.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-gray-900">{mode.label}</span>
                    <span className={`text-xs text-white px-2 py-0.5 rounded-full font-bold ${mode.badgeColor}`}>
                      {mode.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{mode.desc}</p>
                </div>
                {form.api_mode === mode.id && <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
              </label>
            ))}
          </div>
        </div>

        {/* RapidAPI credentials */}
        {form.api_mode === "rapidapi" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-green-500" />
              <h2 className="font-bold text-gray-900">RapidAPI Key</h2>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-4">
              <p className="text-sm font-semibold text-green-800 mb-2">How to get your free API key (2 minutes):</p>
              <ol className="text-sm text-green-700 space-y-1 list-decimal ml-4">
                <li>Go to{" "}
                  <a href="https://rapidapi.com/auth/sign-up" target="_blank" rel="noopener noreferrer"
                    className="underline font-medium">rapidapi.com/auth/sign-up</a>{" "}
                  and create a free account
                </li>
                <li>Search for{" "}
                  <a href="https://rapidapi.com/datascraper/api/aliexpress-datahub" target="_blank" rel="noopener noreferrer"
                    className="underline font-medium">AliExpress DataHub API <ExternalLink className="w-3 h-3 inline" /></a>
                </li>
                <li>Click <strong>Subscribe to Test</strong> → choose the free Basic plan</li>
                <li>Copy your <strong>X-RapidAPI-Key</strong> from the code snippet and paste below</li>
              </ol>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">RapidAPI Key</label>
              <Input
                value={form.rapidapi_key}
                onChange={(e) => set("rapidapi_key", e.target.value)}
                placeholder={form.rapidapi_key === "***SET***" ? "Already set — enter new key to change" : "Paste your RapidAPI key here..."}
              />
            </div>
          </div>
        )}

        {/* Affiliate API credentials */}
        {form.api_mode === "affiliate" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-gray-900">AliExpress Affiliate API Credentials</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">App Key</label>
                <Input value={form.affiliate_app_key} onChange={(e) => set("affiliate_app_key", e.target.value)}
                  placeholder="Your AliExpress App Key" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">App Secret</label>
                <Input type="password" value={form.affiliate_secret}
                  onChange={(e) => set("affiliate_secret", e.target.value)}
                  placeholder={form.affiliate_secret === "***SET***" ? "Already set — enter new to change" : "Your AliExpress App Secret"} />
                <p className="text-xs text-gray-500 mt-1">
                  Register at{" "}
                  <a href="https://portals.aliexpress.com" target="_blank" rel="noopener noreferrer"
                    className="text-blue-500 hover:underline">portals.aliexpress.com <ExternalLink className="w-3 h-3 inline" /></a>
                </p>
              </div>
            </div>
          </div>
        )}

        {form.api_mode === "scraper" && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Demo mode — mock data only</p>
              <p className="text-xs text-amber-700 mt-1">
                AliExpress blocks direct server requests with bot protection. Switch to RapidAPI (free) or the Official Affiliate API for real product data and real images.
              </p>
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h2 className="font-bold text-gray-900">Pricing Configuration</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Markup Percentage (%)</label>
              <Input type="number" min="0" max="500" value={form.markup_percent}
                onChange={(e) => set("markup_percent", parseFloat(e.target.value))} />
              <p className="text-xs text-gray-500 mt-1">Customers pay AliExpress price + {form.markup_percent}%</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">USD → LKR Rate</label>
              <Input type="number" min="1" value={form.usd_to_lkr}
                onChange={(e) => set("usd_to_lkr", parseFloat(e.target.value))} />
              <p className="text-xs text-gray-500 mt-1">1 USD = {form.usd_to_lkr} LKR</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Display Currency</label>
              <select value={form.currency} onChange={(e) => set("currency", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-orange-400">
                <option value="LKR">LKR — Sri Lankan Rupee</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Store info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-purple-500" />
            <h2 className="font-bold text-gray-900">Store Information</h2>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Store Name</label>
            <Input value={form.store_name} onChange={(e) => set("store_name", e.target.value)} placeholder="ShopDrop" />
          </div>
        </div>

        <Button onClick={() => save.mutate(form)} size="lg" className="w-full rounded-xl" disabled={save.isPending}>
          {save.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
