export function sanitizeText(value: unknown, maxLength: number, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMultiline(value: unknown, maxLength: number, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  return value
    .replace(/[<>]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maxLength);
}

export function clampNumber(value: unknown, min: number, max: number, fallback = 0): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, number));
}
