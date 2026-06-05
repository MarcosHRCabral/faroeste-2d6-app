import type { SessionCredentials } from "../../../shared/session";

const KEY = "faroeste2d6.multiplayer.credentials.v1";

export function loadStoredCredentials(code?: string): SessionCredentials | null {
  const raw = localStorage.getItem(KEY);

  if (!raw) {
    return null;
  }

  try {
    const credentials = JSON.parse(raw) as SessionCredentials;

    if (code && credentials.code !== code.toUpperCase()) {
      return null;
    }

    return credentials;
  } catch {
    return null;
  }
}

export function saveStoredCredentials(credentials: SessionCredentials): void {
  localStorage.setItem(KEY, JSON.stringify(credentials));
}

export function clearStoredCredentials(): void {
  localStorage.removeItem(KEY);
}
