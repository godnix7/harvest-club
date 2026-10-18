import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Server-only (Node crypto). Format: scrypt$<saltHex>$<hashHex>
const KEYLEN = 64;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, KEYLEN, (err, key) => (err ? reject(err) : resolve(key)))
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await derive(password, Buffer.from(saltHex, "hex"));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Used to keep login timing similar when the email does not exist. */
export const DUMMY_HASH =
  "scrypt$00000000000000000000000000000000$" + "00".repeat(KEYLEN);

export const MIN_PASSWORD_LENGTH = 8;

export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password.length > 200) return "Password is too long.";
  return null;
}
