export default function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--color-harvest-green)]/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[var(--color-harvest-blue)]/15 blur-3xl" />
      <div className="container-page relative py-10 sm:py-16">
        {eyebrow && <span className="eyebrow mb-3 !bg-white/80">{eyebrow}</span>}
        <h1 className="page-title">{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
        {children}
      </div>
    </div>
  );
}
