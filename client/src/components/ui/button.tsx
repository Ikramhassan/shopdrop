"use client";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { forwardRef } from "react";

const variants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700",
        outline: "border-2 border-orange-500 text-orange-600 hover:bg-orange-50",
        ghost: "text-gray-600 hover:bg-gray-100",
        danger: "bg-red-500 text-white hover:bg-red-600",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        dark: "bg-gray-900 text-white hover:bg-gray-800",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        xl: "px-8 py-4 text-lg",
        icon: "p-2",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(variants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = "Button";
