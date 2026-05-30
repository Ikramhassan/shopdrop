"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, Package, CheckCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/useToast";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: "💵", desc: "Pay when you receive your order" },
  { id: "bank_transfer", label: "Bank Transfer", icon: "🏦", desc: "Transfer to our account before shipping" },
  { id: "card", label: "Card Payment", icon: "💳", desc: "Online card payment (coming soon)" },
];

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user, init } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [address, setAddress] = useState({
    name: "", phone: "", address: "", city: "", state: "", postalCode: "", country: "Sri Lanka",
  });

  useEffect(() => {
    init();
    if (user) setAddress((a) => ({ ...a, name: user.name }));
  }, []);

  useEffect(() => {
    if (items.length === 0 && step < 3) router.push("/cart");
  }, [items]);

  const cartTotal = total();

  const handlePlaceOrder = async () => {
    if (!user) {
      toast("Please sign in to place an order", "error");
      router.push("/login?redirect=/checkout");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/orders", {
        items: items.map((i) => ({
          productId: i.productId,
          productTitle: i.productTitle,
          productImage: i.productImage,
          skuId: i.skuId,
          variantName: i.variantName,
          quantity: i.quantity,
          price: i.price,
          priceAliexpress: i.priceAliexpress,
        })),
        shippingAddress: address,
        paymentMethod,
      });
      setOrderId(res.data.id);
      clear();
      setStep(3);
    } catch (err: any) {
      toast(err.response?.data?.error || "Failed to place order", "error");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-gray-600 mb-2">Thank you for your order. We&apos;ll process it shortly.</p>
        <p className="text-sm text-gray-500 mb-8">Order ID: <span className="font-mono font-medium text-gray-700">{orderId.slice(0, 8)}...</span></p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push("/orders")} size="lg">Track My Order</Button>
          <Button onClick={() => router.push("/")} variant="outline" size="lg">Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-10">
        {[
          { n: 1, label: "Shipping" },
          { n: 2, label: "Payment" },
          { n: 3, label: "Confirmation" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s.n ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"
            }`}>{s.n}</div>
            <span className={`text-sm font-medium hidden sm:block ${step >= s.n ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
            {i < 2 && <div className={`flex-1 h-0.5 w-8 ${step > s.n ? "bg-orange-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                  <Input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone *</label>
                  <Input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="+94 77 123 4567" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Address *</label>
                  <Input value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} placeholder="123 Main Street" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">City *</label>
                  <Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Colombo" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Postal Code</label>
                  <Input value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} placeholder="10001" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
                  <Input value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                </div>
              </div>
              <Button
                onClick={() => setStep(2)} size="lg" className="w-full mt-6 rounded-xl"
                disabled={!address.name || !address.phone || !address.address || !address.city}
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <label key={pm.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === pm.id ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <input type="radio" name="payment" value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="text-orange-500" />
                    <span className="text-2xl">{pm.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{pm.label}</p>
                      <p className="text-sm text-gray-500">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setStep(1)} variant="secondary" size="lg" className="rounded-xl">Back</Button>
                <Button onClick={handlePlaceOrder} size="lg" className="flex-1 rounded-xl" disabled={loading}>
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
            </div>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.skuId}`} className="flex items-center gap-3">
                  <img src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2">{item.productTitle}</p>
                    <p className="text-xs text-gray-500">×{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">
                    {formatPrice(item.price * item.quantity, "LKR")}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-xl font-extrabold text-orange-600">{formatPrice(cartTotal, "LKR")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
