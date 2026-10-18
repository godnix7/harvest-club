import Link from "next/link";
import { Megaphone } from "lucide-react";
import { safeLink } from "@/lib/site";

/** Optional announcement strip shown above the navigation on every public page. */
export default function SiteBanner({ text, href }: { text: string | null; href: string | null }) {
  if (!text) return null;
  const link = safeLink(href);
  const content = (
    <span className="inline-flex items-center gap-2">
      <Megaphone size={15} className="shrink-0" />
      <span>{text}</span>
      {link && <span className="font-bold underline underline-offset-2">Learn more →</span>}
    </span>
  );
  const cls = "block bg-gradient-green px-4 py-2 text-center text-sm font-medium text-white";
  if (!link) return <div className={cls}>{content}</div>;
  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>{content}</a>
  ) : (
    <Link href={link.href} className={cls}>{content}</Link>
  );
}
