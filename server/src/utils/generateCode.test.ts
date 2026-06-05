import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateCode } from "./generateCode";

describe("generateCode", () => {
  it("creates short private room codes", () => {
    const code = generateCode();

    assert.match(code, /^[A-Z2-9]{6}$/);
  });
});
