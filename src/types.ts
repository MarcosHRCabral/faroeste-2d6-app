export const attributeKeys = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sorte"
] as const;

export type AttributeKey = (typeof attributeKeys)[number];

export type Attributes = Record<AttributeKey, number>;

export const attributeLabels: Record<AttributeKey, string> = {
  forca: "Forca",
  destreza: "Destreza",
  constituicao: "Constituicao",
  inteligencia: "Inteligencia",
  sorte: "Sorte"
};

export interface DerivedStats {
  maxHealth: number;
  maxEnergy: number;
  defense: number;
}

export interface Skill {
  id: string;
  name: string;
  attribute: AttributeKey;
  bonus: number;
  notes: string;
  supernatural?: boolean;
}

export interface SkillTemplate {
  id: string;
  name: string;
  attribute: AttributeKey;
  description: string;
  supernatural?: boolean;
}

export interface Origin {
  id: string;
  name: string;
  description: string;
  hook: string;
  suggestedSkillId: string;
  suggestedSkillBonus: number;
  startingItem: string;
  contact: string;
  narrativeAdvantage: string;
}

export interface ProfessionSkill {
  id: string;
  bonus: number;
}

export interface Profession {
  id: string;
  name: string;
  description: string;
  skills: ProfessionSkill[];
  equipment: string[];
  weapons: string[];
  money: number;
  advantage: string;
  disadvantage: string;
  supernatural?: boolean;
}

export interface GearItem {
  id: string;
  name: string;
  notes: string;
}

export interface Weapon {
  id: string;
  name: string;
  damage: string;
  range: string;
  notes: string;
}

export interface Character {
  id: string;
  name: string;
  age: string;
  originId: string;
  originName: string;
  professionId: string;
  professionName: string;
  appearance: string;
  personality: string;
  history: string;
  objective: string;
  attributes: Attributes;
  derived: DerivedStats;
  currentHealth: number;
  currentEnergy: number;
  skills: Skill[];
  equipment: GearItem[];
  weapons: Weapon[];
  money: number;
  advantages: string[];
  disadvantages: string[];
  notes: string;
  summary: string;
  supernaturalEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DifficultyId =
  | "facil"
  | "normal"
  | "dificil"
  | "muito-dificil"
  | "quase-impossivel";

export interface Difficulty {
  id: DifficultyId;
  label: string;
  target: number;
}

export type CriticalType = "none" | "success" | "failure";

export interface ModifierBreakdown {
  label: string;
  value: number;
}

export interface OpposedRollSummary {
  label: string;
  dice: [number, number];
  diceTotal: number;
  modifiers: ModifierBreakdown[];
  totalModifier: number;
  total: number;
  critical: CriticalType;
  outcome: "win" | "tie" | "loss";
}

export interface RollResult {
  id: string;
  source: string;
  dice: [number, number];
  diceTotal: number;
  modifiers: ModifierBreakdown[];
  totalModifier: number;
  total: number;
  difficulty?: Difficulty;
  success?: boolean;
  critical: CriticalType;
  opposed?: OpposedRollSummary;
  createdAt: string;
}
