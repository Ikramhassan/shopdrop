"use client";
import { useEffect, useState } from "react";
import { registerToast } from "@/hooks/useToast";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

interface Toast {
  id: number;
  msg: string;
  type: "success" | "error" | "info";
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  useEffect(() => {
    registerToast((msg, type = "success") => {
      const id = ++counter;
      setToasts((t) => [...t, { id, msg, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
    });
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 min-w-64 animate-in slide-in-from-right"
        >
          {icons[t.type]}
          <p className="text-sm text-gray-800 font-medium flex-1">{t.msg}</p>
          <button onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}>
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      ))}
    </div>
  );
}
