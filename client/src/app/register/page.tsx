"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { useAuth } from "@/store/auth";
import { toast } from "@/hooks/useToast";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.token, res.data.user);
      toast("Account created! Welcome to ShopDrop!");
      router.push("/");
    } catch (err: any) {
      toast(err.response?.data?.error || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ShopDrop</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Create your account</h1>
          <p className="text-gray-500 mt-1">Start shopping in minutes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
              { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
              { key: "phone", label: "Phone (optional)", type: "tel", placeholder: "+94 77 123 4567" },
              { key: "password", label: "Password", type: "password", placeholder: "At least 8 characters" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{f.label}</label>
                <Input type={f.type} value={(form as any)[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  required={f.key !== "phone"} />
              </div>
            ))}
            <Button type="submit" size="lg" className="w-full rounded-xl mt-2" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
