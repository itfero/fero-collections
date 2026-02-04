let suppressedUntil = 0;

/**
 * Suppress unauthorized handling for ms milliseconds.
 */
export function suppressUnauthorizedFor(ms: number) {
  suppressedUntil = Date.now() + ms;
}

export function isUnauthorizedSuppressed() {
  return Date.now() < suppressedUntil;
}