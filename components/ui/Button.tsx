"use client";

import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand)] text-white hover:brightness-105 shadow-[0_1px_2px_rgba(16,24,40,0.12)] disabled:opacity-60",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]",
  ghost:
    "bg-transparent text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]",
};

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
