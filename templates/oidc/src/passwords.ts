import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

// scrypt zit in Node zelf -> geen native deps (argon2/bcrypt).
export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const dk = scryptSync(plain, salt, 64);
  return `scrypt$${salt.toString("base64")}$${dk.toString("base64")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  try {
    const [, saltB64, dkB64] = stored.split("$");
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(dkB64, "base64");
    const dk = scryptSync(plain, salt, expected.length);
    return expected.length === dk.length && timingSafeEqual(expected, dk);
  } catch {
    return false;
  }
}
