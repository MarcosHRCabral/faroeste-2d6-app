import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode(length = 6): string {
  return Array.from({ length }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join("");
}
