import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  unpaid: "bg-red-100 text-red-800",
  affiliate: "bg-blue-100 text-blue-800",
  scraper: "bg-orange-100 text-orange-800",
  default: "bg-gray-100 text-gray-800",
};

export function Badge({ label, className }: { label: string; className?: string }) {
  const color = colorMap[label?.toLowerCase()] || colorMap.default;
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", color, className)}>
      {label}
    </span>
  );
}
