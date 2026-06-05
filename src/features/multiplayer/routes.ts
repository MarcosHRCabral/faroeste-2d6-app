export function getSessionCodeFromPath(): string {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const sessionIndex = parts.findIndex((part) => part.toLowerCase() === "session");

  if (sessionIndex === -1) {
    return "";
  }

  return (parts[sessionIndex + 1] || "").toUpperCase();
}

export function setSessionPath(code: string): void {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const prefix = base && base !== "/" ? base : "";
  window.history.pushState({}, "", `${prefix}/session/${code}`);
}

export function setLocalPath(): void {
  const base = import.meta.env.BASE_URL || "/";
  window.history.pushState({}, "", base);
}
