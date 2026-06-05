import { ChangeEvent, useRef } from "react";
import {
  Copy,
  Download,
  FolderOpen,
  Printer,
  Save,
  Trash2,
  Upload
} from "lucide-react";
import type { Character } from "../types";

interface SaveLoadPanelProps {
  characters: Character[];
  activeId: string | null;
  onLoad: (id: string) => void;
  onDuplicate: () => void;
  onDelete: (id: string) => void;
  onExport: () => Character | undefined;
  onImport: (raw: string) => void;
  onPrint: () => void;
}

export default function SaveLoadPanel({
  characters,
  activeId,
  onLoad,
  onDuplicate,
  onDelete,
  onExport,
  onImport,
  onPrint
}: SaveLoadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const active = characters.find((character) => character.id === activeId);

  function exportCharacter() {
    const character = onExport();

    if (!character) {
      return;
    }

    const blob = new Blob([JSON.stringify(character, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${character.name || "ficha-faroeste-2d6"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importCharacter(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onImport(await file.text());
    event.target.value = "";
  }

  return (
    <section className="tool-panel">
      <div className="panel-heading">
        <Save size={18} />
        <h2>Fichas salvas</h2>
      </div>

      <label className="field-label" htmlFor="saved-character">
        Personagem ativo
      </label>
      <select
        id="saved-character"
        value={activeId ?? ""}
        onChange={(event) => onLoad(event.target.value)}
        disabled={!characters.length}
      >
        {characters.length ? (
          characters.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name || "Sem nome"} - {character.professionName || "sem profissao"}
            </option>
          ))
        ) : (
          <option value="">Nenhuma ficha salva</option>
        )}
      </select>

      <div className="button-grid">
        <button type="button" onClick={() => active && onLoad(active.id)} disabled={!active}>
          <FolderOpen size={16} />
          Abrir
        </button>
        <button type="button" onClick={onDuplicate} disabled={!active}>
          <Copy size={16} />
          Duplicar
        </button>
        <button type="button" onClick={exportCharacter} disabled={!active}>
          <Download size={16} />
          Exportar
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} />
          Importar
        </button>
        <button type="button" onClick={onPrint} disabled={!active}>
          <Printer size={16} />
          PDF
        </button>
        <button
          type="button"
          className="danger"
          disabled={!active}
          onClick={() => active && window.confirm("Remover esta ficha salva?") && onDelete(active.id)}
        >
          <Trash2 size={16} />
          Excluir
        </button>
      </div>

      <input
        ref={fileInputRef}
        className="sr-only"
        type="file"
        accept="application/json,.json"
        onChange={importCharacter}
      />
    </section>
  );
}
