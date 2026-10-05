/**
 * Character stats for an echo build header, the way the game's character screen adds them up.
 * Counted: level-90 base, weapon base ATK + secondary stat, unlocked minor forte nodes and echo
 * stats that are marked as rolled and have a value. Not counted: sonata set bonuses, weapon
 * passives, element / healing / skill-type DMG.
 */
import { Character, ECHO_BY_ID, EchoSlot, FIXED_MAIN, isForteOn, Weapon } from "./echoes";

export type CharacterStats = {
  atk: number;
  hp: number;
  def: number;
  critRate: number;
  critDmg: number;
  energy: number;
};

/** Every resonator's base (checked for in scripts/fetch-stat-data.ts), in percent. */
const BASE_CRIT_RATE = 5;
const BASE_CRIT_DMG = 150;
const BASE_ENERGY = 100;

export function computeStats(
  character: Character,
  weapon: Weapon | undefined,
  forteNodes: number,
  slots: EchoSlot[],
): CharacterStats {
  // Stat key -> total bonus ("atk%" etc. in percent, "atk" / "hp" / "def" flat).
  const sum = new Map<string, number>();
  const add = (stat: string, value: number) => sum.set(stat, (sum.get(stat) ?? 0) + value);
  const total = (stat: string) => sum.get(stat) ?? 0;

  if (weapon) add(weapon.secondary.stat, weapon.secondary.value);
  character.forte.forEach((node, i) => {
    if (isForteOn(forteNodes, i)) add(node.stat, node.value);
  });

  for (const slot of slots) {
    const echo = slot.echoId !== null ? ECHO_BY_ID.get(slot.echoId) : undefined;
    if (!echo) continue;
    if (slot.main && slot.mainGot) {
      // The free second main stat comes with any rolled main stat.
      const fixed = FIXED_MAIN[echo.cost];
      add(fixed.key, fixed.max);
      if (slot.mainValue !== null) add(slot.main, slot.mainValue);
    }
    slot.subs.forEach((key, i) => {
      const value = slot.subValues[i];
      if (key && slot.subsGot[i] && value !== null) add(key, value);
    });
  }

  return {
    atk: (character.atk + (weapon?.atk ?? 0)) * (1 + total("atk%") / 100) + total("atk"),
    hp: character.hp * (1 + total("hp%") / 100) + total("hp"),
    def: character.def * (1 + total("def%") / 100) + total("def"),
    critRate: BASE_CRIT_RATE + total("crit-rate"),
    critDmg: BASE_CRIT_DMG + total("crit-dmg"),
    energy: BASE_ENERGY + total("energy"),
  };
}
