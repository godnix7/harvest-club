"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const result = await login(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-harvest px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Image src="/logo.png" alt="Harvest Club" width={56} height={56} className="h-14 w-14 object-contain" />
          <h1 className="font-display mt-4 text-3xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Authorised club administrators only.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="field-label">Email address</label>
            <input id="email" name="email" type="email" required autoComplete="username" className="field" />
          </div>
          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
          </div>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={pending} className="btn-navy w-full !py-3">{pending ? "Signing in…" : "Sign in"}</button>
        </form>

        <p className="mt-6 text-center text-sm"><Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:underline">← Back to website</Link></p>
      </div>
    </div>
  );
}
