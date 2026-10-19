import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

type Props = {
  clubName: string;
  tagline: string;
  title: string;
  subtitle: string;
};

export default function HeroSection({ clubName, tagline, title, subtitle }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-soft">
      {/* Soft brand-colour glows */}
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-harvest-green)]/25 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[var(--color-harvest-blue)]/20 blur-3xl sm:h-[26rem] sm:w-[26rem]" />

      <div className="container-page relative flex flex-col items-center py-14 text-center sm:py-24 lg:py-28">
        <span className="eyebrow !bg-white/80 shadow-sm">
          <Leaf size={14} /> {tagline}
        </span>

        <h1 className="font-display mt-6 text-[2.6rem] font-extrabold leading-[1.05] text-[var(--color-ink)] sm:text-6xl lg:text-7xl">
          <span className="gradient-text">{clubName.replace(/\s+club$/i, "")}</span>
          <br />
          <span className="text-[var(--color-harvest-blue-dark)]">{title}</span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-muted)] sm:mt-6 sm:text-xl">
          {subtitle}
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row">
          <Link href="/events" className="btn-primary !min-h-12 !rounded-full !px-8 !text-base shadow-lg shadow-green-900/20">
            Explore events <ArrowRight size={18} />
          </Link>
          <Link href="/about" className="btn-outline !min-h-12 !rounded-full !px-8 !text-base">
            About the club
          </Link>
        </div>

      </div>
    </section>
  );
}
