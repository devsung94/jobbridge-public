// components/ui/Badge.tsx
import React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "gray";
  className?: string;
};

const variantStyles = {
  default: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-700",
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className }) => {
  return (
    <span
      className={cn(
        "inline-block px-2 py-1 text-xs font-medium rounded-full",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
