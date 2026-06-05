import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { commonEquipment, commonWeapons } from "../data/equipment";
import { makeGearItem, makeWeapon } from "../logic/character";
import type { GearItem, Weapon } from "../types";

interface EquipmentListProps {
  equipment: GearItem[];
  weapons: Weapon[];
  onEquipmentChange: (equipment: GearItem[]) => void;
  onWeaponsChange: (weapons: Weapon[]) => void;
}

export default function EquipmentList({
  equipment,
  weapons,
  onEquipmentChange,
  onWeaponsChange
}: EquipmentListProps) {
  const [selectedEquipment, setSelectedEquipment] = useState(commonEquipment[0] ?? "");
  const [selectedWeapon, setSelectedWeapon] = useState(commonWeapons[0] ?? "");

  return (
    <section className="sheet-section">
      <div className="section-title-row">
        <h2>Equipamentos e armas</h2>
        <div className="inline-actions">
          <button type="button" onClick={() => onEquipmentChange([...equipment, makeGearItem("")])}>
            <Plus size={16} />
            Item
          </button>
          <button type="button" onClick={() => onWeaponsChange([...weapons, makeWeapon("")])}>
            <Plus size={16} />
            Arma
          </button>
        </div>
      </div>

      <div className="quick-add-grid">
        <div className="quick-add">
          <label>
            Lista de equipamentos
            <select
              value={selectedEquipment}
              onChange={(event) => setSelectedEquipment(event.target.value)}
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
            onClick={() =>
              selectedEquipment && onEquipmentChange([...equipment, makeGearItem(selectedEquipment)])
            }
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>

        <div className="quick-add">
          <label>
            Lista de armas
            <select value={selectedWeapon} onChange={(event) => setSelectedWeapon(event.target.value)}>
              {commonWeapons.map((weapon) => (
                <option key={weapon} value={weapon}>
                  {weapon}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => selectedWeapon && onWeaponsChange([...weapons, makeWeapon(selectedWeapon)])}
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>
      </div>

      <div className="equipment-grid">
        <div>
          <h3>Equipamentos</h3>
          {equipment.map((item) => (
            <div className="editable-line" key={item.id}>
              <input
                value={item.name}
                onChange={(event) =>
                  onEquipmentChange(
                    equipment.map((current) =>
                      current.id === item.id ? { ...current, name: event.target.value } : current
                    )
                  )
                }
                placeholder="item"
              />
              <input
                value={item.notes}
                onChange={(event) =>
                  onEquipmentChange(
                    equipment.map((current) =>
                      current.id === item.id ? { ...current, notes: event.target.value } : current
                    )
                  )
                }
                placeholder="notas"
              />
              <button
                type="button"
                className="icon-only danger"
                aria-label={`Remover ${item.name || "item"}`}
                onClick={() => onEquipmentChange(equipment.filter((current) => current.id !== item.id))}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div>
          <h3>Armas</h3>
          {weapons.map((weapon) => (
            <div className="weapon-line" key={weapon.id}>
              <input
                value={weapon.name}
                onChange={(event) =>
                  onWeaponsChange(
                    weapons.map((current) =>
                      current.id === weapon.id ? { ...current, name: event.target.value } : current
                    )
                  )
                }
                placeholder="arma"
              />
              <input
                value={weapon.damage}
                onChange={(event) =>
                  onWeaponsChange(
                    weapons.map((current) =>
                      current.id === weapon.id ? { ...current, damage: event.target.value } : current
                    )
                  )
                }
                placeholder="dano"
              />
              <input
                value={weapon.range}
                onChange={(event) =>
                  onWeaponsChange(
                    weapons.map((current) =>
                      current.id === weapon.id ? { ...current, range: event.target.value } : current
                    )
                  )
                }
                placeholder="alcance"
              />
              <input
                value={weapon.notes}
                onChange={(event) =>
                  onWeaponsChange(
                    weapons.map((current) =>
                      current.id === weapon.id ? { ...current, notes: event.target.value } : current
                    )
                  )
                }
                placeholder="notas"
              />
              <button
                type="button"
                className="icon-only danger"
                aria-label={`Remover ${weapon.name || "arma"}`}
                onClick={() => onWeaponsChange(weapons.filter((current) => current.id !== weapon.id))}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
