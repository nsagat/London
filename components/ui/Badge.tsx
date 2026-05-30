import { cn } from "./cn";

type Tone =
  | "neutral"
  | "brand"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "mono";

const TONES: Record<Tone, string> = {
  neutral:
    "bg-[var(--color-surface-muted)] text-[var(--color-ink-soft)] border-[var(--color-border)]",
  brand: "bg-[var(--color-brand-soft)] text-[var(--color-brand)] border-transparent",
  blue: "bg-[var(--color-blue-soft)] text-[var(--color-blue)] border-transparent",
  emerald:
    "bg-[var(--color-emerald-soft)] text-[var(--color-emerald)] border-transparent",
  amber: "bg-[var(--color-amber-soft)] text-[var(--color-amber)] border-transparent",
  rose: "bg-[var(--color-rose-soft)] text-[var(--color-rose)] border-transparent",
  mono: "bg-[#0b1220] text-[#e7e9ee] border-transparent font-mono",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      ) : null}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "active" || s === "online" || s === "success" || s === "approved")
    return (
      <Badge tone="emerald" dot>
        {cap(status)}
      </Badge>
    );
  if (s === "busy" || s === "preview" || s === "skipped")
    return (
      <Badge tone="amber" dot>
        {cap(status)}
      </Badge>
    );
  if (s === "error" || s === "blocked")
    return (
      <Badge tone="rose" dot>
        {cap(status)}
      </Badge>
    );
  return <Badge tone="neutral">{cap(status)}</Badge>;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
