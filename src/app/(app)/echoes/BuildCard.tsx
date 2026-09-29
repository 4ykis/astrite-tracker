"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import Card from "@/components/Card";
import {
  CHARACTER_BY_ID,
  characterIcon,
  ECHO_BY_ID,
  echoIcon,
  ECHO_COUNT,
  EchoSlot,
  FIXED_MAIN,
  MAIN_STATS,
  mainStat,
  SUB_COUNT,
  SUB_STAT_BY_KEY,
  SUB_STATS,
} from "@/lib/echoes";
import { deleteBuild, moveBuild, setBuildCollapsed, updateBuild } from "./actions";
import CharacterPicker from "./CharacterPicker";
import EchoPicker from "./EchoPicker";
import StatPicker from "./StatPicker";
import StatRow from "./StatRow";

type Picker =
  | { kind: "character" }
  | { kind: "echo"; slot: number }
  | { kind: "main"; slot: number }
  | { kind: "sub"; slot: number; index: number };

const cell = "relative flex min-h-72 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950";

export default function BuildCard({
  id,
  characterId: initialCharacterId,
  slots: initialSlots,
  collapsed: initialCollapsed,
  isFirst,
  isLast,
}: {
  id: string;
  characterId: number | null;
  slots: EchoSlot[];
  collapsed: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [characterId, setCharacterId] = useState(initialCharacterId);
  const [slots, setSlots] = useState(initialSlots);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [picker, setPicker] = useState<Picker | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = (nextCharacterId: number | null, nextSlots: EchoSlot[]) => {
    setCharacterId(nextCharacterId);
    setSlots(nextSlots);
    setPicker(null);
    startTransition(() => updateBuild(id, nextCharacterId, nextSlots));
  };

  const patchSlot = (index: number, patch: (slot: EchoSlot) => EchoSlot) =>
    save(
      characterId,
      slots.map((slot, i) => (i === index ? patch(slot) : slot)),
    );

  const character = characterId !== null ? CHARACTER_BY_ID.get(characterId) : undefined;
  const pickedEchoId = picker && picker.kind !== "character" ? slots[picker.slot].echoId : null;
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
          <div
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-indigo-400/40 px-2 ${
              isCollapsed ? "h-[72px]" : "h-20"
            }`}
          >
            {moveButtons}
            <button
              type="button"
              onClick={() => (isCollapsed ? toggleCollapsed() : setPicker({ kind: "character" }))}
              className="group flex min-w-0 flex-1 items-center gap-3 self-stretch text-left"
            >
              <Image
                src={characterIcon(character.id)}
                alt={character.name}
                width={64}
                height={64}
                unoptimized
                className={`shrink-0 rounded-lg ${isCollapsed ? "size-10" : "size-16"} ${
                  character.rank === 5 ? "bg-amber-400/15" : "bg-violet-500/15"
                }`}
              />
              <span className={`flex-1 truncate font-semibold text-amber-300 ${isCollapsed ? "" : "text-lg"}`}>
                {character.name}
              </span>
              {isCollapsed ? (
                allEchoesChosen && (
                  <span className="text-xs text-slate-400">
                    {totalGot}/{ECHO_COUNT * STATS_PER_ECHO}
                  </span>
                )
              ) : (
                <span className="text-xl text-slate-400 transition group-hover:text-amber-300">›</span>
              )}
            </button>
          </div>
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
                  onClick={() => setPicker({ kind: "main", slot: index })}
                  onToggle={() => patchSlot(index, (s) => ({ ...s, mainGot: !s.mainGot }))}
                />

                <div className="mx-1.5 my-0.5 h-px bg-amber-400/70" />

                {slot.subs.map((key, subIndex) => (
                  <StatRow
                    key={subIndex}
                    stat={key ? SUB_STAT_BY_KEY.get(key) : undefined}
                    got={slot.subsGot[subIndex]}
                    onClick={() => setPicker({ kind: "sub", slot: index, index: subIndex })}
                    onToggle={() =>
                      patchSlot(index, (s) => ({
                        ...s,
                        subsGot: s.subsGot.map((got, i) => (i === subIndex ? !got : got)),
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
            patchSlot(picker.slot, (s) => ({ ...s, main: key, mainGot: key === s.main && s.mainGot }))
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
            }))
          }
        />
      )}

      {picker?.kind === "character" && (
        <CharacterPicker
          selected={characterId}
          onClose={() => setPicker(null)}
          onSelect={(next) => save(next, slots)}
        />
      )}
      {picker?.kind === "echo" && (
        <EchoPicker
          selected={slots[picker.slot].echoId}
          onClose={() => setPicker(null)}
          onSelect={(echoId) =>
            patchSlot(picker.slot, (s) => {
              if (s.echoId === echoId) return s;
              // A different echo means a different real piece: keep the plan, drop the got-marks.
              const sameCost = s.echoId !== null && ECHO_BY_ID.get(s.echoId)?.cost === ECHO_BY_ID.get(echoId)?.cost;
              return {
                ...s,
                echoId,
                main: sameCost ? s.main : null,
                mainGot: false,
                subsGot: s.subsGot.map(() => false),
              };
            })
          }
        />
      )}
    </Card>
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
