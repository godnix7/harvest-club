"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";

/** When maintenance mode is on, visitors see a notice instead of the site. The admin area stays reachable. */
export default function MaintenanceGate({
  enabled,
  message,
  clubName,
  children,
}: {
  enabled: boolean;
  message: string;
  clubName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (!enabled || pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-soft px-6 text-center">
      <Image src="/logo.png" alt="" width={72} height={72} className="h-18 w-18 object-contain" priority />
      <span className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--color-harvest-green)] shadow">
        <Wrench size={22} />
      </span>
      <h1 className="font-display mt-5 text-3xl font-extrabold text-[var(--color-ink)]">{clubName} is under maintenance</h1>
      <p className="mt-3 max-w-md text-[var(--color-muted)]">{message}</p>
    </main>
  );
}
