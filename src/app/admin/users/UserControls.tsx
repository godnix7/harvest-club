"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin";

const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePassword(length = 12): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join("");
}

/** Password input with a "Generate" helper and copy button for handing credentials to a new admin. */
export function PasswordField() {
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <label htmlFor="new-admin-password" className="field-label">Temporary password *</label>
      <div className="flex gap-2">
        <input
          id="new-admin-password"
          name="password"
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setCopied(false); }}
          required
          minLength={8}
          autoComplete="off"
          spellCheck={false}
          className="field font-mono"
        />
        <button type="button" onClick={() => { setValue(generatePassword()); setCopied(false); }} className="btn-outline shrink-0 !px-3">
          Generate
        </button>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
        <span>Share it privately. They can change it under “My account”.</span>
        {value && (
          <button
            type="button"
            onClick={async () => { await navigator.clipboard?.writeText(value); setCopied(true); }}
            className="shrink-0 font-semibold text-[var(--color-harvest-blue)] hover:underline"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

export function ResetPasswordButton({
  action,
  name,
}: {
  action: (newPassword: string) => Promise<ActionResult>;
  name: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const generated = generatePassword();
          const entered = window.prompt(`New password for ${name} (min. 8 characters):`, generated);
          if (entered === null) return;
          setMessage(null);
          start(async () => {
            const result = await action(entered);
            if (result.error) setMessage({ ok: false, text: result.error });
            else {
              setMessage({ ok: true, text: `Password updated. New password: ${entered}` });
              router.refresh();
            }
          });
        }}
        className="text-sm font-medium text-[var(--color-harvest-blue)] hover:underline disabled:opacity-50"
      >
        {pending ? "Working…" : "Reset password"}
      </button>
      {message && (
        <span className={`mt-1 max-w-[16rem] break-all text-xs ${message.ok ? "font-mono text-green-700" : "text-red-600"}`}>{message.text}</span>
      )}
    </span>
  );
}
