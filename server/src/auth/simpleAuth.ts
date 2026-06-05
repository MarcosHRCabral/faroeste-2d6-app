import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

const TOKEN_ROUNDS = 8;
const PASSWORD_ROUNDS = 10;

export function makeId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

export function makeToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, TOKEN_ROUNDS);
}

export async function verifyToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
