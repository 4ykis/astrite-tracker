import assert from "node:assert/strict";
import { test } from "node:test";
import { compare, TargetKey, Targets } from "./targets";

// Hiyuki's targets from wuwa_targets.json.
const TARGETS: Targets = {
  hp: { min: 15000, max: 15000 },
  def: { min: 1150, max: 1150 },
  atk: { min: 1800, max: 2200 },
  crit_rate: { min: 65, max: 65, note: "Before Set" },
  crit_dmg: { min: 210, max: 260 },
  energy_regen: { min: 120, max: 120 },
  element_dmg: { min: 40, max: 70 },
};

/** Every stat at `factor` × its recommended value. */
const scaled = (factor: number) =>
  Object.fromEntries(Object.entries(TARGETS).map(([key, t]) => [key, t.max * factor])) as Record<TargetKey, number>;

const brackets = (rows: ReturnType<typeof compare>["rows"]) => rows.filter((r) => r.rec !== null).map((r) => r.key);

test("all stats equal to recommended: green, no brackets", () => {
  const { rows, status } = compare(scaled(1), TARGETS);
  assert.equal(status, "green");
  assert.deepEqual(brackets(rows), []);
});

test("all stats above recommended: green, no brackets", () => {
  const { rows, status } = compare(scaled(1.2), TARGETS);
  assert.equal(status, "green");
  assert.deepEqual(brackets(rows), []);
});

test("all stats 5% low: yellow, brackets everywhere", () => {
  const { rows, status } = compare(scaled(0.95), TARGETS);
  assert.equal(status, "yellow");
  assert.equal(brackets(rows).length, Object.keys(TARGETS).length);
  assert.equal(rows.find((r) => r.key === "atk")?.rec, 2200);
});

test("all stats 10% low: still yellow (boundary)", () => {
  assert.equal(compare(scaled(0.9), TARGETS).status, "yellow");
});

test("all stats 15% low: red", () => {
  assert.equal(compare(scaled(0.85), TARGETS).status, "red");
});

test("crit rate 64.96 vs 65 rounds to 65.0: no brackets", () => {
  const { rows } = compare({ ...scaled(1), crit_rate: 64.96 }, TARGETS);
  const row = rows.find((r) => r.key === "crit_rate");
  assert.equal(row?.value, 65);
  assert.equal(row?.rec, null);
  assert.equal(row?.note, "Before Set");
});

test("crit rate far above does not make up for low energy regen", () => {
  const { rows, status } = compare({ ...scaled(1), crit_rate: 100, energy_regen: 100 }, TARGETS);
  assert.notEqual(status, "green");
  assert.equal(rows.find((r) => r.key === "energy_regen")?.rec, 120);
});

test("resonator without targets: none, no brackets", () => {
  const { rows, status } = compare(scaled(0.5), undefined);
  assert.equal(status, "none");
  assert.deepEqual(brackets(rows), []);
});

test("HP, DEF and element DMG don't change the colour", () => {
  const { rows, status } = compare({ ...scaled(1), hp: 1000, def: 100, element_dmg: 0 }, TARGETS);
  assert.equal(status, "green");
  assert.deepEqual(brackets(rows), ["hp", "def", "element_dmg"]);
});
