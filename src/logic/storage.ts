import type { Character } from "../types";
import { validateImportedCharacter } from "./character";

export const CHARACTERS_KEY = "faroeste2d6.characters.v1";
export const ACTIVE_CHARACTER_KEY = "faroeste2d6.activeCharacterId.v1";

export function loadCharacters(): Character[] {
  const raw = localStorage.getItem(CHARACTERS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    const values = Array.isArray(parsed) ? parsed : [parsed];
    return values
      .map((value) => validateImportedCharacter(value))
      .filter((character): character is Character => Boolean(character));
  } catch {
    return [];
  }
}

export function saveCharacters(characters: Character[]): void {
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
}

export function loadActiveCharacterId(): string | null {
  return localStorage.getItem(ACTIVE_CHARACTER_KEY);
}

export function saveActiveCharacterId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_CHARACTER_KEY, id);
    return;
  }

  localStorage.removeItem(ACTIVE_CHARACTER_KEY);
}

export function parseImportedCharacters(raw: string): Character[] {
  const parsed = JSON.parse(raw);
  const values = Array.isArray(parsed) ? parsed : [parsed];

  return values
    .map((value) => validateImportedCharacter(value))
    .filter((character): character is Character => Boolean(character));
}
