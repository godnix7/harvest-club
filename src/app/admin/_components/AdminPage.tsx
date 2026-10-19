import Link from "next/link";

export function AdminHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>}
      </div>
      {children}
    </div>
  );
}

/** Link styled like the row action buttons. */
export function ChipLink({ href, children, target }: { href: string; children: React.ReactNode; target?: string }) {
  return <Link href={href} target={target} className="chip">{children}</Link>;
}

/** Container for a list of AdminRow items. */
export function AdminList({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y divide-[var(--color-line)]">{children}</ul>;
}

/**
 * One consistent row for every admin list: title + badges + details on the left,
 * action buttons on the right (stacked underneath on narrow screens).
 */
export function AdminRow({
  title,
  badges,
  subtitle,
  details,
  highlight = false,
  actions,
}: {
  title: React.ReactNode;
  badges?: React.ReactNode;
  subtitle?: React.ReactNode;
  details?: React.ReactNode;
  highlight?: boolean;
  actions: React.ReactNode;
}) {
  return (
    <li className={`px-4 py-4 sm:px-5 ${highlight ? "bg-[var(--color-paper)]" : ""}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-semibold text-[var(--color-ink)]">{title}</p>
            {badges}
          </div>
          {subtitle && <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>}
          {details && <p className="mt-0.5 text-xs text-[var(--color-muted)]">{details}</p>}
        </div>
        <div className="flex flex-wrap items-start gap-2 lg:max-w-[24rem] lg:shrink-0 lg:justify-end">{actions}</div>
      </div>
    </li>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">{children}</p>;
}

export function StatusBadge({ tone, children }: { tone: "green" | "gray" | "amber" | "red" | "blue"; children: React.ReactNode }) {
  const tones = {
    green: "bg-green-100 text-green-800",
    gray: "bg-gray-100 text-gray-700",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}
