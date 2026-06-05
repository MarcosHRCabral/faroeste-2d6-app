import type {
  AttributeKey,
  Attributes,
  Character,
  GearItem,
  Origin,
  Profession,
  Skill,
  SkillTemplate,
  Weapon
} from "../types";
import { attributeKeys } from "../types";
import { makeId } from "./dice";

export const ATTRIBUTE_POINTS = 8;
export const ATTRIBUTE_MIN = -1;
export const ATTRIBUTE_MAX_INITIAL = 4;

export const defaultAttributes: Attributes = {
  forca: 0,
  destreza: 0,
  constituicao: 0,
  inteligencia: 0,
  sorte: 0
};

export function calculateDerived(attributes: Attributes) {
  return {
    maxHealth: Math.max(1, 10 + attributes.constituicao * 2),
    maxEnergy: Math.max(1, 6 + attributes.constituicao + attributes.sorte),
    defense: 7 + attributes.destreza
  };
}

export function sanitizeAttributes(value: Partial<Attributes> | undefined): Attributes {
  return attributeKeys.reduce((attributes, key) => {
    attributes[key] = Number(value?.[key] ?? 0);
    return attributes;
  }, { ...defaultAttributes });
}

export function getAttributePointTotal(attributes: Attributes): number {
  return attributeKeys.reduce((total, key) => total + attributes[key], 0);
}

export function validateInitialAttributes(attributes: Attributes): string[] {
  const errors: string[] = [];
  const total = getAttributePointTotal(attributes);

  if (total !== ATTRIBUTE_POINTS) {
    errors.push(`Distribua exatamente ${ATTRIBUTE_POINTS} pontos. Atual: ${total}.`);
  }

  attributeKeys.forEach((key) => {
    if (attributes[key] < ATTRIBUTE_MIN || attributes[key] > ATTRIBUTE_MAX_INITIAL) {
      errors.push("Na criacao, cada atributo deve ficar entre -1 e 4.");
    }
  });

  return errors;
}

export function makeGearItem(name: string, notes = ""): GearItem {
  return {
    id: makeId("gear"),
    name,
    notes
  };
}

export function makeWeapon(name: string, notes = ""): Weapon {
  const lower = name.toLowerCase();
  const defaults =
    lower.includes("rifle")
      ? { damage: "2d6+2", range: "Longo" }
      : lower.includes("espingarda")
        ? { damage: "2d6+1", range: "Curto" }
        : lower.includes("revolver") || lower.includes("pistola")
          ? { damage: "2d6", range: "Medio" }
          : lower.includes("faca") || lower.includes("facão")
            ? { damage: "1d6+FOR", range: "Corpo a corpo" }
            : { damage: "Definir", range: "Definir" };

  return {
    id: makeId("weapon"),
    name,
    damage: defaults.damage,
    range: defaults.range,
    notes
  };
}

export function createSkills(
  templates: SkillTemplate[],
  bonuses: Record<string, number>,
  includeSupernatural: boolean
): Skill[] {
  return templates
    .filter((skill) => includeSupernatural || !skill.supernatural)
    .map((skill) => ({
      id: skill.id,
      name: skill.name,
      attribute: skill.attribute,
      bonus: bonuses[skill.id] ?? 0,
      notes: "",
      supernatural: skill.supernatural
    }));
}

export interface CharacterBuildInput {
  name: string;
  age: string;
  appearance: string;
  personality: string;
  history: string;
  objective: string;
  origin: Origin;
  profession: Profession;
  attributes: Attributes;
  skills: Skill[];
  extraEquipment: string[];
  extraWeapons: string[];
  money: number;
  supernaturalEnabled: boolean;
}

export function buildCharacter(input: CharacterBuildInput): Character {
  const now = new Date().toISOString();
  const derived = calculateDerived(input.attributes);
  const originEquipment = input.origin.startingItem ? [input.origin.startingItem] : [];
  const equipment = [...originEquipment, ...input.profession.equipment, ...input.extraEquipment]
    .filter(Boolean)
    .map((item) => makeGearItem(item));
  const weapons = [...input.profession.weapons, ...input.extraWeapons]
    .filter(Boolean)
    .map((weapon) => makeWeapon(weapon));
  const advantages = [input.profession.advantage, input.origin.narrativeAdvantage].filter(Boolean);
  const disadvantages = [input.profession.disadvantage].filter(Boolean);

  return {
    id: makeId("char"),
    name: input.name.trim(),
    age: input.age.trim(),
    originId: input.origin.id,
    originName: input.origin.name,
    professionId: input.profession.id,
    professionName: input.profession.name,
    appearance: input.appearance,
    personality: input.personality,
    history: input.history,
    objective: input.objective,
    attributes: sanitizeAttributes(input.attributes),
    derived,
    currentHealth: derived.maxHealth,
    currentEnergy: derived.maxEnergy,
    skills: input.skills,
    equipment,
    weapons,
    money: input.money,
    advantages,
    disadvantages,
    notes: "",
    summary: `${input.name.trim()} e ${input.profession.name.toLowerCase()} de origem ${input.origin.name.toLowerCase()}. ${input.objective}`.trim(),
    supernaturalEnabled: input.supernaturalEnabled,
    createdAt: now,
    updatedAt: now
  };
}

export function refreshCharacter(character: Character): Character {
  const attributes = sanitizeAttributes(character.attributes);
  const derived = calculateDerived(attributes);

  return {
    ...character,
    attributes,
    derived,
    currentHealth: Math.min(Number(character.currentHealth ?? derived.maxHealth), derived.maxHealth),
    currentEnergy: Math.min(Number(character.currentEnergy ?? derived.maxEnergy), derived.maxEnergy),
    updatedAt: new Date().toISOString()
  };
}

export function duplicateCharacter(character: Character): Character {
  const now = new Date().toISOString();

  return {
    ...character,
    id: makeId("char"),
    name: `${character.name} (copia)`,
    equipment: character.equipment.map((item) => ({ ...item, id: makeId("gear") })),
    weapons: character.weapons.map((weapon) => ({ ...weapon, id: makeId("weapon") })),
    createdAt: now,
    updatedAt: now
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateImportedCharacter(value: unknown): Character | null {
  if (!isObject(value) || typeof value.name !== "string" || !isObject(value.attributes)) {
    return null;
  }

  const attributes = sanitizeAttributes(value.attributes as Partial<Record<AttributeKey, number>>);
  const derived = calculateDerived(attributes);
  const now = new Date().toISOString();

  return {
    id: typeof value.id === "string" ? value.id : makeId("char"),
    name: value.name,
    age: typeof value.age === "string" ? value.age : "",
    originId: typeof value.originId === "string" ? value.originId : "",
    originName: typeof value.originName === "string" ? value.originName : "Origem importada",
    professionId: typeof value.professionId === "string" ? value.professionId : "",
    professionName:
      typeof value.professionName === "string" ? value.professionName : "Profissao importada",
    appearance: typeof value.appearance === "string" ? value.appearance : "",
    personality: typeof value.personality === "string" ? value.personality : "",
    history: typeof value.history === "string" ? value.history : "",
    objective: typeof value.objective === "string" ? value.objective : "",
    attributes,
    derived,
    currentHealth: Number(value.currentHealth ?? derived.maxHealth),
    currentEnergy: Number(value.currentEnergy ?? derived.maxEnergy),
    skills: Array.isArray(value.skills) ? (value.skills as Skill[]) : [],
    equipment: Array.isArray(value.equipment) ? (value.equipment as GearItem[]) : [],
    weapons: Array.isArray(value.weapons) ? (value.weapons as Weapon[]) : [],
    money: Number(value.money ?? 0),
    advantages: Array.isArray(value.advantages) ? (value.advantages as string[]) : [],
    disadvantages: Array.isArray(value.disadvantages) ? (value.disadvantages as string[]) : [],
    notes: typeof value.notes === "string" ? value.notes : "",
    summary: typeof value.summary === "string" ? value.summary : "",
    supernaturalEnabled: Boolean(value.supernaturalEnabled),
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: now
  };
}
