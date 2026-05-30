import { cn } from "./cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-ink-soft)]">
            {icon}
          </div>
        ) : null}
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}
