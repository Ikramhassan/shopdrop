import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
