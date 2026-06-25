import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

export const GlowButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", className = "", children, icon, ...rest }, ref) => {
    const base =
      "group relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 select-none";
    if (variant === "primary") {
      return (
        <button
          ref={ref}
          {...rest}
          className={`${base} text-white bg-[oklch(0.58_0.22_25)] hover:bg-[oklch(0.62_0.22_25)] shadow-[0_10px_40px_-10px_rgba(219,17,37,0.6)] hover:shadow-[0_20px_60px_-10px_rgba(219,17,37,0.85)] hover:-translate-y-0.5 ${className}`}
        >
          <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(120%_120%_at_50%_0%,rgba(255,255,255,0.35),transparent_50%)]" />
          <span className="relative z-10 flex items-center gap-2">
            {children}
            {icon}
          </span>
        </button>
      );
    }
    return (
      <button
        ref={ref}
        {...rest}
        className={`${base} text-foreground border border-foreground/15 bg-foreground/[0.04] backdrop-blur-md hover:bg-foreground/[0.08] hover:-translate-y-0.5 ${className}`}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
          {icon}
        </span>
      </button>
    );
  },
);
GlowButton.displayName = "GlowButton";