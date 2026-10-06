/**
 * Character stats for an echo build header, the way the game's character screen adds them up.
 * Counted: level-90 base, weapon base ATK + secondary stat + the always-on stat of its passive
 * (refinement 1), unlocked minor forte nodes, checked echo main stats at +25, checked sub stats that have a
 * value, and the echoes' extra (unplanned) sub stats. Not counted: sonata set bonuses, conditional passive effects, element / healing /
 * skill-type DMG.
 */
import targetData from "./data/wuwa_targets.json";
import { Character, ECHO_BY_ID, EchoSlot, FIXED_MAIN, isForteOn, mainStat, Weapon } from "./echoes";
import { compare, TargetFile, targetSlug } from "./targets";

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
  if (weapon?.passive) add(weapon.passive.stat, weapon.passive.value);
  character.forte.forEach((node, i) => {
    if (isForteOn(forteNodes, i)) add(node.stat, node.value);
  });

  for (const slot of slots) {
    const echo = slot.echoId !== null ? ECHO_BY_ID.get(slot.echoId) : undefined;
    if (!echo) continue;
    const main = slot.mainGot ? mainStat(echo.cost, slot.main) : undefined;
    if (main) {
      // Main stats count at +25, together with the free second main stat.
      const fixed = FIXED_MAIN[echo.cost];
      add(fixed.key, fixed.max);
      add(main.key, main.max);
    }
    slot.subs.forEach((key, i) => {
      const value = slot.subValues[i];
      if (key && slot.subsGot[i] && value !== null) add(key, value);
    });
    for (const extra of slot.extras) if (extra.value !== null) add(extra.key, extra.value);
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

const TARGETS: TargetFile = targetData;

/** The header stats against the resonator's Prydwen endgame targets (lib/targets.ts). */
export function compareWithTargets(character: Character, stats: CharacterStats) {
  return compare(
    {
      atk: stats.atk,
      hp: stats.hp,
      def: stats.def,
      crit_rate: stats.critRate,
      crit_dmg: stats.critDmg,
      energy_regen: stats.energy,
    },
    TARGETS.heroes[targetSlug(character.name)]?.targets,
  );
}
