import { createHash } from "crypto";

/**
 * Refresh tokens are already high-entropy random JWTs, so a plain SHA-256
 * digest (rather than a slow password hash like bcrypt) is sufficient for
 * at-rest storage - this protects the DB from leaking usable tokens without
 * the cost of a KDF.
 */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
