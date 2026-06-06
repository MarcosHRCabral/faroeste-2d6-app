import type { PublicSessionState, SessionCredentials } from "../../../shared/session";

const P2P_SESSION_KEY = "faroeste2d6.p2p.hostSession.v1";
const P2P_CREDENTIALS_KEY = "faroeste2d6.p2p.credentials.v1";

export function saveP2PHostSession(session: PublicSessionState): void {
  localStorage.setItem(P2P_SESSION_KEY, JSON.stringify(session));
}

export function loadP2PHostSession(): PublicSessionState | null {
  return parseJson(localStorage.getItem(P2P_SESSION_KEY));
}

export function clearP2PHostSession(): void {
  localStorage.removeItem(P2P_SESSION_KEY);
}

export function saveP2PCredentials(credentials: SessionCredentials): void {
  localStorage.setItem(P2P_CREDENTIALS_KEY, JSON.stringify(credentials));
}

export function loadP2PCredentials(): SessionCredentials | null {
  return parseJson(localStorage.getItem(P2P_CREDENTIALS_KEY));
}

export function clearP2PCredentials(): void {
  localStorage.removeItem(P2P_CREDENTIALS_KEY);
}

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
