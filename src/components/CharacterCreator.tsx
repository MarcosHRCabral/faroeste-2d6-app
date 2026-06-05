import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Wand2 } from "lucide-react";
import { attributeDescriptions } from "../data/attributes";
import { commonEquipment, commonWeapons } from "../data/equipment";
import { origins } from "../data/origins";
import { professions } from "../data/professions";
import { skillTemplates } from "../data/skills";
import {
  ATTRIBUTE_MAX_INITIAL,
  ATTRIBUTE_MIN,
  ATTRIBUTE_POINTS,
  buildCharacter,
  createSkills,
  defaultAttributes,
  getAttributePointTotal,
  validateInitialAttributes
} from "../logic/character";
import { attributeKeys, attributeLabels } from "../types";
import type { AttributeKey, Attributes, Character } from "../types";

interface CharacterCreatorProps {
  onCreate: (character: Character) => void;
}

const steps = [
  "Basicos",
  "Origem",
  "Profissao",
  "Atributos",
  "Pericias",
  "Equipamentos",
  "Revisao"
];

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function CharacterCreator({ onCreate }: CharacterCreatorProps) {
  const [step, setStep] = useState(0);
  const [supernaturalEnabled, setSupernaturalEnabled] = useState(false);
  const [basic, setBasic] = useState({
    name: "",
    age: "",
    appearance: "",
    personality: "",
    history: "",
    objective: ""
  });
  const [originId, setOriginId] = useState(origins[0]?.id ?? "");
  const [professionId, setProfessionId] = useState("");
  const [attributes, setAttributes] = useState<Attributes>(defaultAttributes);
  const [skillBonuses, setSkillBonuses] = useState<Record<string, number>>({});
  const [skillNotes, setSkillNotes] = useState<Record<string, string>>({});
  const [extraEquipment, setExtraEquipment] = useState("");
  const [extraWeapons, setExtraWeapons] = useState("");
  const [selectedExtraEquipment, setSelectedExtraEquipment] = useState(commonEquipment[0] ?? "");
  const [selectedExtraWeapon, setSelectedExtraWeapon] = useState(commonWeapons[0] ?? "");
  const [money, setMoney] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  const visibleProfessions = useMemo(
    () => professions.filter((profession) => supernaturalEnabled || !profession.supernatural),
    [supernaturalEnabled]
  );
  const visibleSkills = useMemo(
    () => skillTemplates.filter((skill) => supernaturalEnabled || !skill.supernatural),
    [supernaturalEnabled]
  );
  const selectedOrigin = origins.find((origin) => origin.id === originId) ?? origins[0];
  const selectedProfession =
    visibleProfessions.find((profession) => profession.id === professionId) ?? visibleProfessions[0];

  useEffect(() => {
    if (!professionId || !visibleProfessions.some((profession) => profession.id === professionId)) {
      setProfessionId(visibleProfessions[0]?.id ?? "");
    }
  }, [professionId, visibleProfessions]);

  useEffect(() => {
    setMoney(selectedProfession?.money ?? 0);
  }, [selectedProfession?.id]);

  const baseSkillBonuses = useMemo(() => {
    const bonuses: Record<string, number> = {};

    if (selectedOrigin) {
      bonuses[selectedOrigin.suggestedSkillId] =
        (bonuses[selectedOrigin.suggestedSkillId] ?? 0) + selectedOrigin.suggestedSkillBonus;
    }

    selectedProfession?.skills.forEach((skill) => {
      bonuses[skill.id] = (bonuses[skill.id] ?? 0) + skill.bonus;
    });

    return bonuses;
  }, [selectedOrigin, selectedProfession]);

  const pointTotal = getAttributePointTotal(attributes);
  const remainingPoints = ATTRIBUTE_POINTS - pointTotal;
  const validationMessages = [
    ...(basic.name.trim() ? [] : ["Informe o nome da personagem."]),
    ...(selectedOrigin ? [] : ["Escolha uma origem."]),
    ...(selectedProfession ? [] : ["Escolha uma profissao."]),
    ...validateInitialAttributes(attributes)
  ];
  const canFinish = validationMessages.length === 0;

  function setAttribute(key: AttributeKey, value: number) {
    setAttributes((current) => ({
      ...current,
      [key]: value
    }));
  }

  function getSkillBonus(id: string) {
    return skillBonuses[id] ?? baseSkillBonuses[id] ?? 0;
  }

  function createCharacter() {
    if (!selectedOrigin || !selectedProfession || !canFinish) {
      setShowErrors(true);
      return;
    }

    const bonuses = visibleSkills.reduce<Record<string, number>>((acc, skill) => {
      acc[skill.id] = getSkillBonus(skill.id);
      return acc;
    }, {});
    const skills = createSkills(visibleSkills, bonuses, supernaturalEnabled).map((skill) => ({
      ...skill,
      notes: skillNotes[skill.id] ?? ""
    }));

    onCreate(
      buildCharacter({
        ...basic,
        origin: selectedOrigin,
        profession: selectedProfession,
        attributes,
        skills,
        extraEquipment: lines(extraEquipment),
        extraWeapons: lines(extraWeapons),
        money,
        supernaturalEnabled
      })
    );
  }

  function nextStep() {
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function appendLine(current: string, value: string) {
    if (!value) {
      return current;
    }

    return current.trim() ? `${current.trim()}\n${value}` : value;
  }

  return (
    <section className="creator parchment">
      <div className="creator-header">
        <div>
          <p className="eyebrow">Criador guiado</p>
          <h1>Nova ficha de faroeste</h1>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={supernaturalEnabled}
            onChange={(event) => setSupernaturalEnabled(event.target.checked)}
          />
          <span>Sobrenatural opcional</span>
        </label>
      </div>

      <nav className="stepper" aria-label="Etapas de criacao">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            className={index === step ? "active" : ""}
            onClick={() => setStep(index)}
          >
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </nav>

      {showErrors && validationMessages.length ? (
        <div className="warning-list" role="alert">
          {validationMessages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      <div className="creator-body">
        {step === 0 ? (
          <div className="form-grid">
            <label>
              Nome do personagem
              <input
                value={basic.name}
                onChange={(event) => setBasic({ ...basic, name: event.target.value })}
                placeholder="Ex.: Elias Ward"
              />
            </label>
            <label>
              Idade
              <input
                value={basic.age}
                onChange={(event) => setBasic({ ...basic, age: event.target.value })}
                placeholder="Ex.: 34"
              />
            </label>
            <label>
              Aparencia
              <textarea
                value={basic.appearance}
                onChange={(event) => setBasic({ ...basic, appearance: event.target.value })}
                rows={3}
              />
            </label>
            <label>
              Personalidade
              <textarea
                value={basic.personality}
                onChange={(event) => setBasic({ ...basic, personality: event.target.value })}
                rows={3}
              />
            </label>
            <label>
              Historia curta
              <textarea
                value={basic.history}
                onChange={(event) => setBasic({ ...basic, history: event.target.value })}
                rows={4}
              />
            </label>
            <label>
              Objetivo pessoal
              <textarea
                value={basic.objective}
                onChange={(event) => setBasic({ ...basic, objective: event.target.value })}
                rows={4}
              />
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="choice-grid">
            <div className="choice-list">
              {origins.map((origin) => (
                <button
                  key={origin.id}
                  type="button"
                  className={origin.id === originId ? "choice-card active" : "choice-card"}
                  onClick={() => setOriginId(origin.id)}
                >
                  <strong>{origin.name}</strong>
                  <span>{origin.description}</span>
                </button>
              ))}
            </div>
            {selectedOrigin ? (
              <aside className="preview-card">
                <h2>{selectedOrigin.name}</h2>
                <p>{selectedOrigin.hook}</p>
                <dl>
                  <div>
                    <dt>Pericia</dt>
                    <dd>
                      +{selectedOrigin.suggestedSkillBonus} em{" "}
                      {skillTemplates.find((skill) => skill.id === selectedOrigin.suggestedSkillId)
                        ?.name ?? "pericia"}
                    </dd>
                  </div>
                  <div>
                    <dt>Item</dt>
                    <dd>{selectedOrigin.startingItem}</dd>
                  </div>
                  <div>
                    <dt>Contato</dt>
                    <dd>{selectedOrigin.contact}</dd>
                  </div>
                </dl>
              </aside>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="choice-grid">
            <div className="choice-list">
              {visibleProfessions.map((profession) => (
                <button
                  key={profession.id}
                  type="button"
                  className={profession.id === selectedProfession?.id ? "choice-card active" : "choice-card"}
                  onClick={() => setProfessionId(profession.id)}
                >
                  <strong>{profession.name}</strong>
                  <span>{profession.description}</span>
                </button>
              ))}
            </div>
            {selectedProfession ? (
              <aside className="preview-card">
                <h2>{selectedProfession.name}</h2>
                <p>{selectedProfession.description}</p>
                <dl>
                  <div>
                    <dt>Pericias</dt>
                    <dd>
                      {selectedProfession.skills
                        .map((item) => {
                          const skill = skillTemplates.find((template) => template.id === item.id);
                          return `${skill?.name ?? item.id} +${item.bonus}`;
                        })
                        .join(", ")}
                    </dd>
                  </div>
                  <div>
                    <dt>Armas</dt>
                    <dd>{selectedProfession.weapons.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Vantagem</dt>
                    <dd>{selectedProfession.advantage}</dd>
                  </div>
                  <div>
                    <dt>Desvantagem</dt>
                    <dd>{selectedProfession.disadvantage}</dd>
                  </div>
                </dl>
              </aside>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="attribute-editor">
            <div className="points-banner">
              <strong>{remainingPoints}</strong>
              <span>pontos restantes</span>
            </div>
            <div className="attribute-grid">
              {attributeKeys.map((key) => (
                <label key={key} className="number-card tooltip-target" data-tooltip={attributeDescriptions[key]}>
                  <span>{attributeLabels[key]}</span>
                  <input
                    type="number"
                    min={ATTRIBUTE_MIN}
                    max={ATTRIBUTE_MAX_INITIAL}
                    value={attributes[key]}
                    onChange={(event) => setAttribute(key, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>
            <p className={remainingPoints === 0 ? "muted" : "warn-text"}>
              Inicio: minimo {ATTRIBUTE_MIN}, maximo {ATTRIBUTE_MAX_INITIAL}, total{" "}
              {ATTRIBUTE_POINTS}.
            </p>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="skill-editor">
            <div className="trait-preview">
              <p>
                Vantagem sugerida: <strong>{selectedProfession?.advantage}</strong>
              </p>
              <p>
                Desvantagem sugerida: <strong>{selectedProfession?.disadvantage}</strong>
              </p>
            </div>
            <div className="skill-table">
              {visibleSkills.map((skill) => (
                <div key={skill.id} className="skill-row tooltip-target" data-tooltip={skill.description}>
                  <div>
                    <strong>{skill.name}</strong>
                    <span>{attributeLabels[skill.attribute]}</span>
                  </div>
                  <input
                    aria-label={`Bonus de ${skill.name}`}
                    type="number"
                    value={getSkillBonus(skill.id)}
                    onChange={(event) =>
                      setSkillBonuses((current) => ({
                        ...current,
                        [skill.id]: Number(event.target.value)
                      }))
                    }
                  />
                  <input
                    aria-label={`Notas de ${skill.name}`}
                    value={skillNotes[skill.id] ?? ""}
                    onChange={(event) =>
                      setSkillNotes((current) => ({
                        ...current,
                        [skill.id]: event.target.value
                      }))
                    }
                    placeholder="observacoes"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="form-grid">
            <div className="kit-card">
              <h2>Kit inicial</h2>
              <p>
                Dinheiro: <strong>${selectedProfession?.money ?? 0}</strong>
              </p>
              <p>Equipamentos: {selectedProfession?.equipment.join(", ")}</p>
              <p>Armas ou ferramentas: {selectedProfession?.weapons.join(", ")}</p>
              <p>Item de origem: {selectedOrigin?.startingItem}</p>
            </div>
            <label>
              Dinheiro inicial
              <input
                type="number"
                value={money}
                onChange={(event) => setMoney(Number(event.target.value))}
              />
            </label>
            <div className="quick-add">
              <label>
                Lista de equipamentos
                <select
                  value={selectedExtraEquipment}
                  onChange={(event) => setSelectedExtraEquipment(event.target.value)}
                >
                  {commonEquipment.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => setExtraEquipment((current) => appendLine(current, selectedExtraEquipment))}
              >
                Adicionar equipamento
              </button>
            </div>
            <div className="quick-add">
              <label>
                Lista de armas
                <select
                  value={selectedExtraWeapon}
                  onChange={(event) => setSelectedExtraWeapon(event.target.value)}
                >
                  {commonWeapons.map((weapon) => (
                    <option key={weapon} value={weapon}>
                      {weapon}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => setExtraWeapons((current) => appendLine(current, selectedExtraWeapon))}
              >
                Adicionar arma
              </button>
            </div>
            <label>
              Equipamentos extras
              <textarea
                value={extraEquipment}
                onChange={(event) => setExtraEquipment(event.target.value)}
                rows={5}
                placeholder="Um item por linha"
              />
            </label>
            <label>
              Armas ou ferramentas extras
              <textarea
                value={extraWeapons}
                onChange={(event) => setExtraWeapons(event.target.value)}
                rows={5}
                placeholder="Um item por linha"
              />
            </label>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="review-grid">
            <div className="review-card">
              <h2>{basic.name || "Personagem sem nome"}</h2>
              <p>
                {selectedOrigin?.name} / {selectedProfession?.name}
              </p>
              <p>{basic.objective || "Objetivo ainda nao informado."}</p>
            </div>
            <div className="review-card">
              <h3>Atributos</h3>
              <ul>
                {attributeKeys.map((key) => (
                  <li key={key}>
                    {attributeLabels[key]} <strong>{attributes[key]}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div className="review-card">
              <h3>Kit</h3>
              <p>{selectedProfession?.equipment.concat(lines(extraEquipment)).join(", ")}</p>
              <p>{selectedProfession?.weapons.concat(lines(extraWeapons)).join(", ")}</p>
            </div>
          </div>
        ) : null}
      </div>

      <footer className="creator-footer">
        <button type="button" onClick={previousStep} disabled={step === 0}>
          <ChevronLeft size={18} />
          Voltar
        </button>
        {step < steps.length - 1 ? (
          <button className="primary-action" type="button" onClick={nextStep}>
            Avancar
            <ChevronRight size={18} />
          </button>
        ) : (
          <button className="primary-action" type="button" onClick={createCharacter}>
            <Wand2 size={18} />
            Gerar ficha
          </button>
        )}
      </footer>

      <p className="creator-footnote">
        <Sparkles size={16} />
        A ficha gerada fica livre para edicao depois.
      </p>
    </section>
  );
}
