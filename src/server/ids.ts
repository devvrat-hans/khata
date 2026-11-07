const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/**
 * A random lowercase id. 24 characters of base 36 carry about 124 bits, more
 * than a UUID, and stay readable in URLs. Rejection sampling keeps every
 * character equally likely.
 */
export function newId(length = 24): string {
  let out = "";
  const limit = 256 - (256 % ALPHABET.length);
  while (out.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const byte of bytes) {
      if (byte >= limit) continue;
      out += ALPHABET[byte % ALPHABET.length];
      if (out.length === length) break;
    }
  }
  return out;
}

/** The secret part of a group join link. */
export function newInviteCode(): string {
  return newId(16);
}
