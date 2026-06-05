import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/"
});

Object.defineProperty(globalThis, "window", { value: dom.window });
Object.defineProperty(globalThis, "document", { value: dom.window.document });
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator });
Object.defineProperty(globalThis, "HTMLElement", { value: dom.window.HTMLElement });
Object.defineProperty(globalThis, "HTMLInputElement", { value: dom.window.HTMLInputElement });
Object.defineProperty(globalThis, "HTMLTextAreaElement", {
  value: dom.window.HTMLTextAreaElement
});
Object.defineProperty(globalThis, "MouseEvent", { value: dom.window.MouseEvent });
Object.defineProperty(globalThis, "KeyboardEvent", { value: dom.window.KeyboardEvent });
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
  configurable: true,
  value: true,
  writable: true
});

const { cleanup, render, screen } = await import("@testing-library/react");
const userEvent = (await import("@testing-library/user-event")).default;
const CharacterCreator = (await import("./CharacterCreator")).default;

afterEach(() => cleanup());

describe("CharacterCreator", () => {
  it("creates a character from the guided flow defaults", async () => {
    const user = userEvent.setup();
    const created: unknown[] = [];
    const onCreate = (character: unknown) => created.push(character);
    render(<CharacterCreator onCreate={onCreate} />);

    await user.type(screen.getByLabelText(/Nome do personagem/i), "Elias Ward");
    await user.click(screen.getByRole("button", { name: /Atributos/i }));

    await user.clear(screen.getByLabelText("Forca"));
    await user.type(screen.getByLabelText("Forca"), "2");
    await user.clear(screen.getByLabelText("Destreza"));
    await user.type(screen.getByLabelText("Destreza"), "2");
    await user.clear(screen.getByLabelText("Constituicao"));
    await user.type(screen.getByLabelText("Constituicao"), "2");
    await user.clear(screen.getByLabelText("Inteligencia"));
    await user.type(screen.getByLabelText("Inteligencia"), "1");
    await user.clear(screen.getByLabelText("Sorte"));
    await user.type(screen.getByLabelText("Sorte"), "1");

    await user.click(screen.getByRole("button", { name: /Revisao/i }));
    await user.click(screen.getByRole("button", { name: /Gerar ficha/i }));

    assert.equal(created.length, 1);
    assert.equal((created[0] as { name: string }).name, "Elias Ward");
  });

  it("shows tooltips and quick equipment lists", async () => {
    const user = userEvent.setup();
    render(<CharacterCreator onCreate={() => undefined} />);

    await user.click(screen.getByRole("button", { name: /4 Atributos/i }));

    const strengthInput = screen.getByLabelText("Forca");
    assert.ok(strengthInput.closest(".tooltip-target")?.getAttribute("data-tooltip")?.includes("Potencia fisica"));

    await user.click(screen.getByRole("button", { name: /6 Equipamentos/i }));
    await user.click(screen.getByRole("button", { name: "Adicionar equipamento" }));

    const equipmentNotes = screen.getByLabelText("Equipamentos extras") as HTMLTextAreaElement;
    assert.ok(equipmentNotes.value.includes("Cantina"));
  });
});
