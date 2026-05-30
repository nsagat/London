export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
