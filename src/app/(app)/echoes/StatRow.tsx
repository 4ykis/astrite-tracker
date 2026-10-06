"use client";

import { useState } from "react";
import { formatStatValue, isValidStatValue, rollQuality, Stat } from "@/lib/echoes";

// Roll colour between the two ends: orange just above the min roll, green just below the max.
const ORANGE = [28, 90, 55];
const GREEN = [140, 60, 45];

/**
 * Frame of a rolled sub stat row (styles: .stat-roll in globals.css): grey while the value is
 * missing, red for the min roll, an emerald-gold gradient for the max, orange -> green between.
 */
function rollFrame(stat: Stat, value: number | null) {
  const quality = rollQuality(stat, value);
  if (typeof quality !== "number") return { "data-roll": quality };
  const [h, s, l] = ORANGE.map((v, i) => Math.round(v + (GREEN[i] - v) * quality));
  return { "data-roll": "between", style: { "--roll": `hsl(${h} ${s}% ${l}%)` } as React.CSSProperties };
}

export default function StatRow({
  stat,
  got,
  value = null,
  locked = false,
  onClick,
  onToggle,
  onValue,
}: {
  stat?: Stat;
  /** Whether this stat is already rolled on the real echo. */
  got: boolean;
  /** The rolled value, only meaningful while `got`. */
  value?: number | null;
  /** Main stats: always the +25 value (`stat.max`), shown instead of a value field. */
  locked?: boolean;
  onClick: () => void;
  onToggle: () => void;
  onValue?: (value: number | null) => void;
}) {
  // Set when the user checks the box, so the value field that appears takes focus.
  const [justChecked, setJustChecked] = useState(false);

  if (!stat) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-md border border-dashed border-amber-400/60 bg-amber-400/10 px-1.5 py-1 text-left text-xs text-amber-200 lg:text-sm transition hover:border-amber-300 hover:bg-amber-400/20"
      >
        + обрати
      </button>
    );
  }

  // Locked main stats are always at +25; rolled subs are coloured by how good the roll is.
  const rolled = got && !locked && onValue !== undefined;
  return (
    <div
      {...(rolled ? rollFrame(stat, value) : {})}
      className={`group flex w-full items-center gap-1.5 rounded-md border px-1.5 py-1 text-xs lg:text-sm transition ${
        rolled
          ? "stat-roll"
          : got
            ? "border-emerald-500/40 bg-emerald-500/10"
            : "border-transparent hover:border-slate-600 hover:bg-slate-800/80"
      }`}
    >
      <input
        type="checkbox"
        checked={got}
        onChange={() => {
          setJustChecked(!got);
          onToggle();
        }}
        aria-label={`${stat.label}: вже є`}
        className="size-3.5 shrink-0 cursor-pointer accent-emerald-500"
      />
      <button
        type="button"
        onClick={onClick}
        className={`flex min-w-0 flex-1 items-center justify-between gap-1 text-left ${
          got && !rolled ? "text-emerald-200" : "text-slate-100"
        }`}
      >
        <span className="truncate lg:hidden">{stat.short}</span>
        <span className="hidden truncate lg:inline" title={stat.label}>
          {stat.label}
        </span>
        {!got && (
          <span className="shrink-0 text-[11px] text-slate-500 transition group-hover:text-amber-300">
            ({stat.min === 0 ? stat.max : `${stat.min} – ${stat.max}`})
          </span>
        )}
      </button>
      {got && (locked || !onValue) && (
        <span className="shrink-0 tabular-nums text-emerald-200">{formatStatValue(stat.max, stat.unit)}</span>
      )}
      {got && !locked && onValue && (
        <ValueInput key={stat.key} stat={stat} value={value} autoFocus={justChecked && value === null} onValue={onValue} />
      )}
    </div>
  );
}

/** Saves on blur / Enter; an out-of-range number is highlighted and not saved. */
export function ValueInput({
  stat,
  value,
  autoFocus,
  onValue,
}: {
  stat: Stat;
  value: number | null;
  autoFocus: boolean;
  onValue: (value: number | null) => void;
}) {
  const [text, setText] = useState(value === null ? "" : String(value));
  // Follow the saved value when it changes from outside (e.g. reset by a stat change).
  const [shownValue, setShownValue] = useState(value);
  if (value !== shownValue) {
    setShownValue(value);
    setText(value === null ? "" : String(value));
  }

  const parsed = text.trim() === "" ? null : Number(text.replace(",", "."));
  const invalid = parsed !== null && !isValidStatValue(stat, parsed);

  const commit = () => {
    if (!invalid && parsed !== value) onValue(parsed);
  };

  return (
    <span className="flex shrink-0 items-center gap-0.5">
      <input
        type="text"
        inputMode="decimal"
        autoFocus={autoFocus}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
        aria-label={`${stat.label}: значення`}
        aria-invalid={invalid}
        title={invalid ? `Від ${stat.min} до ${stat.max}` : undefined}
        className={`w-11 rounded border bg-slate-950/70 px-1 py-0.5 text-right text-xs tabular-nums outline-none lg:w-12 lg:text-sm ${
          invalid ? "border-red-500 text-red-200" : "border-emerald-500/30 text-emerald-100 focus:border-emerald-400"
        }`}
      />
      {stat.unit === "%" && <span className="text-emerald-300/70">%</span>}
    </span>
  );
}
