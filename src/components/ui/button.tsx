import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "danger";
    size?: "sm" | "md";
  }
>(function Button(
  { className, variant = "default", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm",
        variant === "default" &&
          "bg-slate-900 text-white hover:bg-slate-800",
        variant === "outline" &&
          "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
        className,
      )}
      {...props}
    />
  );
});
