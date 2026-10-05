"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import Card from "@/components/Card";
import { CharacterStats, computeStats } from "@/lib/build-stats";
import {
  Character,
  CHARACTER_BY_ID,
  forteCount,
  FORTE_NODE_COUNT,
  validWeaponId,
  WEAPON_BY_ID,
  characterIcon,
  DEFAULT_SUBS,
  defaultMain,
  ECHO_BY_ID,
  echoIcon,
  ECHO_COUNT,
  EchoSlot,
  FIXED_MAIN,
  formatFlat,
  formatPercent,
  MAIN_STATS,
  mainStat,
  SUB_COUNT,
  SUB_STAT_BY_KEY,
  SUB_STATS,
} from "@/lib/echoes";
import { BuildData, deleteBuild, moveBuild, setBuildCollapsed, updateBuild } from "./actions";
import CharacterPicker from "./CharacterPicker";
import EchoPicker from "./EchoPicker";
import ForteDialog from "./ForteDialog";
import StatPicker from "./StatPicker";
import StatRow from "./StatRow";
import WeaponIcon from "./WeaponIcon";
import WeaponPicker from "./WeaponPicker";

type Picker =
  | { kind: "character" }
  | { kind: "weapon" }
  | { kind: "forte" }
  | { kind: "echo"; slot: number }
  | { kind: "main"; slot: number }
  | { kind: "sub"; slot: number; index: number };

const cell = "relative flex min-h-72 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950";

export default function BuildCard({
  id,
  characterId: initialCharacterId,
  weaponId: initialWeaponId,
  forteNodes: initialForteNodes,
  slots: initialSlots,
  collapsed: initialCollapsed,
  isFirst,
  isLast,
}: {
  id: string;
  characterId: number | null;
  weaponId: number | null;
  forteNodes: number;
  slots: EchoSlot[];
  collapsed: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [build, setBuild] = useState<BuildData>({
    characterId: initialCharacterId,
    weaponId: initialWeaponId,
    forteNodes: initialForteNodes,
    slots: initialSlots,
  });
  const { characterId, weaponId, forteNodes, slots } = build;
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [picker, setPicker] = useState<Picker | null>(null);
  const [isPending, startTransition] = useTransition();

  /** Saves the whole build; pickers close unless `keepPicker` (e.g. the forte toggles). */
  const save = (patch: Partial<BuildData>, keepPicker = false) => {
    const next = { ...build, ...patch };
    setBuild(next);
    if (!keepPicker) setPicker(null);
    startTransition(() => updateBuild(id, next));
  };

  const patchSlot = (index: number, patch: (slot: EchoSlot) => EchoSlot) =>
    save({ slots: slots.map((slot, i) => (i === index ? patch(slot) : slot)) });

  const character = characterId !== null ? CHARACTER_BY_ID.get(characterId) : undefined;
  const weapon = weaponId !== null ? WEAPON_BY_ID.get(weaponId) : undefined;
  const stats = character && computeStats(character, weapon, forteNodes, slots);
  const pickedEchoId = picker && "slot" in picker ? slots[picker.slot].echoId : null;
  const pickedEcho = pickedEchoId !== null ? ECHO_BY_ID.get(pickedEchoId) : undefined;

  const allEchoesChosen = slots.every((slot) => slot.echoId !== null);
  const totalGot = slots.reduce((sum, slot) => sum + gotCount(slot), 0);
  const border = allEchoesChosen ? TOTAL_BORDER[level(totalGot, 20, 13)] : "";

  // Ordering and collapsing only make sense once the setup has a resonator.
  const isCollapsed = collapsed && character !== undefined;

  const toggleCollapsed = () => {
    setCollapsed(!isCollapsed);
    startTransition(() => setBuildCollapsed(id, !isCollapsed));
  };

  const moveButtons = (
    <div className="flex shrink-0 flex-col gap-1">
      <MoveButton label="Вгору" disabled={isFirst || isPending} onClick={() => startTransition(() => moveBuild(id, -1))}>
        ↑
      </MoveButton>
      <MoveButton label="Вниз" disabled={isLast || isPending} onClick={() => startTransition(() => moveBuild(id, 1))}>
        ↓
      </MoveButton>
    </div>
  );

  const collapseButton = (
    <button
      type="button"
      aria-label={isCollapsed ? "Розгорнути" : "Згорнути"}
      title={isCollapsed ? "Розгорнути" : "Згорнути"}
      onClick={toggleCollapsed}
      className="flex w-10 shrink-0 items-center justify-center self-stretch rounded-xl border border-slate-800 text-slate-400 transition hover:border-slate-600 hover:text-amber-300"
    >
      <span className={`inline-block transition ${isCollapsed ? "" : "rotate-180"}`}>▾</span>
    </button>
  );

  return (
    <Card className={`relative flex flex-col gap-3 !p-3 ${border}`}>
      <button
        type="button"
        aria-label="Видалити сетап"
        title="Видалити"
        onClick={() => {
          if (confirm("Видалити цей сетап?")) startTransition(() => deleteBuild(id));
        }}
        className="absolute -top-3 -right-3 z-10 flex size-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-base leading-none text-slate-400 shadow transition hover:border-red-500 hover:bg-red-950 hover:text-red-300"
      >
        ×
      </button>

      {!character ? (
        <button
          type="button"
          onClick={() => setPicker({ kind: "character" })}
          className="flex h-20 items-center justify-center rounded-xl border border-dashed border-amber-400/60 bg-amber-400/10 text-sm text-amber-200 transition hover:bg-amber-400/20"
        >
          + обрати героя
        </button>
      ) : (
        <div className="flex gap-2">
          {isCollapsed ? (
            <div className="flex h-[72px] min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-indigo-400/40 px-2">
              {moveButtons}
              <button
                type="button"
                onClick={toggleCollapsed}
                className="flex min-w-0 flex-1 items-center gap-3 self-stretch text-left"
              >
                <CharacterIcon character={character} className="size-10" />
                <span className="flex-1 truncate font-semibold text-amber-300">{character.name}</span>
                {allEchoesChosen && (
                  <span className="text-xs text-slate-400">
                    {totalGot}/{ECHO_COUNT * STATS_PER_ECHO}
                  </span>
                )}
                {weapon && <WeaponIcon weapon={weapon} className="size-10 shrink-0 text-xs" />}
              </button>
            </div>
          ) : (
            <div className="flex min-h-20 min-w-0 flex-1 flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-indigo-400/40 p-2">
              {moveButtons}
              <button
                type="button"
                title="Змінити героя"
                onClick={() => setPicker({ kind: "character" })}
                className="shrink-0 rounded-lg transition hover:ring-2 hover:ring-amber-400/70"
              >
                <CharacterIcon character={character} className="size-16" />
              </button>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <button
                    type="button"
                    onClick={() => setPicker({ kind: "character" })}
                    className="truncate text-left text-lg font-semibold text-amber-300 transition hover:text-amber-200"
                  >
                    {character.name}
                  </button>
                  <ForteChip mask={forteNodes} onClick={() => setPicker({ kind: "forte" })} />
                </div>
                {stats && <StatsGrid stats={stats} className="hidden sm:grid" />}
              </div>
              <button
                type="button"
                title={weapon ? `${weapon.name} — змінити` : "Обрати зброю"}
                onClick={() => setPicker({ kind: "weapon" })}
                className="shrink-0 rounded-lg transition hover:ring-2 hover:ring-amber-400/70"
              >
                {weapon ? (
                  <WeaponIcon weapon={weapon} className="size-16 text-base" />
                ) : (
                  <span className="flex size-16 items-center justify-center rounded-lg border border-dashed border-amber-400/60 bg-amber-400/10 text-center text-xs leading-tight text-amber-200">
                    + зброя
                  </span>
                )}
              </button>
              {/* Narrow screens: the stats get their own full-width row under the icons. */}
              {stats && <StatsGrid stats={stats} className="grid basis-full sm:hidden" />}
            </div>
          )}
          {collapseButton}
        </div>
      )}

      {!isCollapsed && (
        <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {/* Echoes */}
        {slots.map((slot, index) => {
          const echo = slot.echoId !== null ? ECHO_BY_ID.get(slot.echoId) : undefined;

          if (!echo) {
            return (
              <button
                key={index}
                type="button"
                onClick={() => setPicker({ kind: "echo", slot: index })}
                className={`${cell} items-center justify-center border-dashed !border-amber-400/60 !bg-amber-400/10 text-sm text-amber-200 transition hover:!bg-amber-400/20`}
              >
                + обрати ехо
              </button>
            );
          }

          return (
            <div
              key={index}
              className={`${cell} bg-[radial-gradient(circle_at_top,_var(--color-indigo-900)_0%,_var(--color-slate-950)_90%)]`}
            >
              <div className="relative flex flex-1 flex-col gap-1 p-1.5">
                <button
                  type="button"
                  onClick={() => setPicker({ kind: "echo", slot: index })}
                  className="group flex items-center gap-2 rounded-md px-1.5 py-1 text-left transition hover:bg-slate-800/80"
                >
                  <Image
                    src={echoIcon(echo.id)}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="size-10 shrink-0 rounded-md bg-slate-900/60"
                  />
                  <span className="line-clamp-2 flex-1 text-xs font-semibold text-amber-300 lg:text-sm">{echo.name}</span>
                  <span
                    title={`Cost ${echo.cost}`}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md border border-amber-400/60 bg-amber-400/15 text-base font-bold text-amber-300 lg:size-8 lg:text-lg"
                  >
                    {echo.cost}
                  </span>
                </button>

                <div className="flex items-center justify-between px-1.5 py-1 text-xs text-slate-300 lg:text-sm">
                  <span>{FIXED_MAIN[echo.cost].label}</span>
                  <span className="text-slate-500">{FIXED_MAIN[echo.cost].hint}</span>
                </div>
                <StatRow
                  stat={mainStat(echo.cost, slot.main)}
                  got={slot.mainGot}
                  value={slot.mainValue}
                  onClick={() => setPicker({ kind: "main", slot: index })}
                  onToggle={() =>
                    patchSlot(index, (s) => ({
                      ...s,
                      mainGot: !s.mainGot,
                      // A freshly checked main stat is almost always fully levelled.
                      mainValue: s.mainGot ? null : (mainStat(echo.cost, s.main)?.max ?? null),
                    }))
                  }
                  onValue={(value) => patchSlot(index, (s) => ({ ...s, mainValue: value }))}
                />

                <div className="mx-1.5 my-0.5 h-px bg-amber-400/70" />

                {slot.subs.map((key, subIndex) => (
                  <StatRow
                    key={subIndex}
                    stat={key ? SUB_STAT_BY_KEY.get(key) : undefined}
                    got={slot.subsGot[subIndex]}
                    value={slot.subValues[subIndex]}
                    onClick={() => setPicker({ kind: "sub", slot: index, index: subIndex })}
                    onToggle={() =>
                      patchSlot(index, (s) => ({
                        ...s,
                        subsGot: s.subsGot.map((got, i) => (i === subIndex ? !got : got)),
                        subValues: s.subValues.map((v, i) => (i === subIndex ? null : v)),
                      }))
                    }
                    onValue={(value) =>
                      patchSlot(index, (s) => ({
                        ...s,
                        subValues: s.subValues.map((v, i) => (i === subIndex ? value : v)),
                      }))
                    }
                  />
                ))}

                <GotProgress slot={slot} />
              </div>
            </div>
          );
        })}
      </div>

        </>
      )}

      {pickedEcho && picker?.kind === "main" && (
        <StatPicker
          title={`Мейн стат — ${pickedEcho.name}`}
          stats={MAIN_STATS[pickedEcho.cost]}
          selected={slots[picker.slot].main}
          onClose={() => setPicker(null)}
          onSelect={(key) =>
            patchSlot(picker.slot, (s) => ({
              ...s,
              main: key,
              mainGot: key === s.main && s.mainGot,
              mainValue: key === s.main ? s.mainValue : null,
            }))
          }
        />
      )}
      {pickedEcho && picker?.kind === "sub" && (
        <StatPicker
          title={`Сабстат ${picker.index + 1} — ${pickedEcho.name}`}
          stats={SUB_STATS}
          selected={slots[picker.slot].subs[picker.index]}
          taken={new Set(slots[picker.slot].subs.filter((s): s is string => s !== null))}
          onClose={() => setPicker(null)}
          onSelect={(key) =>
            patchSlot(picker.slot, (s) => ({
              ...s,
              subs: s.subs.map((sub, i) => (i === picker.index ? key : sub)),
              subsGot: s.subsGot.map((got, i) => (i === picker.index ? key === s.subs[i] && got : got)),
              subValues: s.subValues.map((v, i) => (i === picker.index && key !== s.subs[i] ? null : v)),
            }))
          }
        />
      )}

      {picker?.kind === "character" && (
        <CharacterPicker
          selected={characterId}
          onClose={() => setPicker(null)}
          // A weapon of another type can't stay with the new character.
          onSelect={(next) => save({ characterId: next, weaponId: validWeaponId(next, weaponId) })}
        />
      )}
      {picker?.kind === "weapon" && (
        <WeaponPicker
          character={character}
          selected={weaponId}
          onClose={() => setPicker(null)}
          onSelect={(next) => save({ weaponId: next })}
        />
      )}
      {picker?.kind === "forte" && character && (
        <ForteDialog
          character={character}
          mask={forteNodes}
          onClose={() => setPicker(null)}
          onChange={(mask) => save({ forteNodes: mask }, true)}
        />
      )}
      {picker?.kind === "echo" && (
        <EchoPicker
          selected={slots[picker.slot].echoId}
          onClose={() => setPicker(null)}
          onSelect={(echoId) =>
            patchSlot(picker.slot, (s) => {
              if (s.echoId === echoId) return s;
              const cost = ECHO_BY_ID.get(echoId)?.cost;
              if (cost === undefined) return s;
              // A fresh slot starts from the usual DPS plan; every stat stays editable and unchecked.
              if (s.echoId === null && s.subs.every((sub) => sub === null)) {
                return {
                  ...s,
                  echoId,
                  main: defaultMain(cost),
                  mainGot: false,
                  mainValue: null,
                  subs: s.subs.map((_, i) => DEFAULT_SUBS[i] ?? null),
                  subsGot: s.subsGot.map(() => false),
                  subValues: s.subValues.map(() => null),
                };
              }
              // A different echo means a different real piece: keep the plan, drop the got-marks and values.
              const sameCost = s.echoId !== null && ECHO_BY_ID.get(s.echoId)?.cost === cost;
              return {
                ...s,
                echoId,
                main: sameCost ? s.main : defaultMain(cost),
                mainGot: false,
                mainValue: null,
                subsGot: s.subsGot.map(() => false),
                subValues: s.subValues.map(() => null),
              };
            })
          }
        />
      )}
    </Card>
  );
}

function CharacterIcon({ character, className }: { character: Character; className: string }) {
  return (
    <Image
      src={characterIcon(character.id)}
      alt={character.name}
      width={64}
      height={64}
      unoptimized
      className={`shrink-0 rounded-lg ${className} ${character.rank === 5 ? "bg-amber-400/15" : "bg-violet-500/15"}`}
    />
  );
}

function ForteChip({ mask, onClick }: { mask: number; onClick: () => void }) {
  const count = forteCount(mask);
  const all = count === FORTE_NODE_COUNT;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs transition ${
        all
          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200 hover:border-emerald-400"
          : "border-slate-600 bg-slate-900/60 text-slate-300 hover:border-slate-400"
      }`}
    >
      Forte {count}/{FORTE_NODE_COUNT} ▾
    </button>
  );
}

/** Columns: (ATK, Energy) · (Crit Rate, Crit DMG) · (DEF, HP). */
function StatsGrid({ stats, className }: { stats: CharacterStats; className: string }) {
  // [label, short label for phones, value]
  const cells: [string, string, string][] = [
    ["ATK", "ATK", formatFlat(stats.atk)],
    ["Energy", "ER", formatPercent(stats.energy)],
    ["Crit Rate", "CR", formatPercent(stats.critRate)],
    ["Crit DMG", "CD", formatPercent(stats.critDmg)],
    ["DEF", "DEF", formatFlat(stats.def)],
    ["HP", "HP", formatFlat(stats.hp)],
  ];
  return (
    <dl className={`grid-flow-col grid-cols-3 grid-rows-2 gap-x-2 gap-y-0.5 text-xs sm:grid-cols-[repeat(3,max-content)] sm:gap-x-4 sm:text-sm ${className}`}>
      {cells.map(([label, short, value], i) => (
        <div
          key={label}
          className={`flex min-w-0 items-baseline justify-between gap-1.5 sm:gap-4 ${i >= 2 ? "border-l border-slate-700/70 pl-2 sm:pl-3" : ""}`}
        >
          <dt className="truncate text-slate-400" title={label}>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </dt>
          <dd className="tabular-nums text-slate-100">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

type Level = "good" | "ok" | "low";

const level = (value: number, good: number, ok: number): Level =>
  value >= good ? "good" : value >= ok ? "ok" : "low";

// Muted on purpose: noticeable, but not louder than the content.
const TOTAL_BORDER: Record<Level, string> = {
  good: "!border-emerald-500/45",
  ok: "!border-amber-400/45",
  low: "!border-red-500/40",
};

const PROGRESS: Record<Level, { bar: string; text: string }> = {
  good: { bar: "bg-emerald-500/80", text: "text-emerald-300" },
  ok: { bar: "bg-amber-400/80", text: "text-amber-300" },
  low: { bar: "bg-red-500/70", text: "text-red-300" },
};

const STATS_PER_ECHO = 1 + SUB_COUNT;

const gotCount = (slot: EchoSlot) => (slot.mainGot ? 1 : 0) + slot.subsGot.filter(Boolean).length;

function GotProgress({ slot }: { slot: EchoSlot }) {
  const planned = (slot.main ? 1 : 0) + slot.subs.filter(Boolean).length;
  if (planned === 0) return null;
  const got = gotCount(slot);
  const style = PROGRESS[level(got, 4, 3)];

  return (
    <div className="mt-auto flex items-center gap-2 px-1.5 pt-1 text-[11px]">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${style.bar}`}
          style={{ width: `${(got / STATS_PER_ECHO) * 100}%` }}
        />
      </div>
      <span className={style.text}>
        {got}/{STATS_PER_ECHO}
      </span>
    </div>
  );
}

function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-[30px] items-center justify-center rounded-md bg-slate-950/60 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-amber-300 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
