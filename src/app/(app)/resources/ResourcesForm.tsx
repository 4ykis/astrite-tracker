"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import MaterialIcon from "@/components/MaterialIcon";
import {
  GROUP_LABELS,
  Material,
  MaterialGroup,
  NEED_PER_CHARACTER,
  SERIES,
  breakdown,
  needFor,
} from "@/lib/materials";
import { saveResources } from "./actions";

const GROUPS: MaterialGroup[] = ["enemy", "forgery"];

function MaterialCell({
  material,
  group,
  value,
  onChange,
}: {
  material: Material;
  group: MaterialGroup;
  value: string;
  onChange: (value: string) => void;
}) {
  const total = Number(value) || 0;
  const { full, rem, need } = breakdown(total, needFor(group, material.tier));

  return (
    <label className="flex flex-col items-center gap-1">
      <MaterialIcon material={material} />
      <input
        name={`item-${material.id}`}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={(event) => event.target.select()}
        className="w-full rounded-md border border-slate-700 bg-slate-950 px-1 py-1 text-center text-sm text-slate-100 outline-none focus:border-amber-400"
      />
      <span className="whitespace-nowrap text-[11px] text-slate-500">
        ({rem}/{need}){" "}
        <span className={full > 0 ? "font-semibold text-amber-300" : "text-slate-600"}>{full}</span>
      </span>
    </label>
  );
}

export default function ResourcesForm({
  amounts,
  date,
  today,
}: {
  amounts: Record<number, number>;
  date: string;
  today: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveResources, undefined);
  const [values, setValues] = useState<Record<number, string>>(() =>
    Object.fromEntries(SERIES.flatMap((s) => s.items.map((m) => [m.id, String(amounts[m.id] ?? 0)]))),
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <p className="text-xs text-slate-500">
        <span className="text-slate-300">(22/31) 3</span> — прогрес до наступного персонажа / скільки
        повних персонажів уже є. На 1 персонажа (всі скіли + 5★ зброя 90): звичайні{" "}
        {NEED_PER_CHARACTER.enemy.join("/")}, кузня {NEED_PER_CHARACTER.forgery.join("/")}.
      </p>

      {GROUPS.map((group) => (
        <Card key={group}>
          <h2 className="mb-3 text-sm font-medium text-slate-300">{GROUP_LABELS[group]}</h2>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {SERIES.filter((s) => s.group === group).map((s) => (
              <div key={s.key} className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-400">{s.name}</span>
                <div className="grid grid-cols-4 gap-2">
                  {s.items.map((material) => (
                    <MaterialCell
                      key={material.id}
                      material={material}
                      group={group}
                      value={values[material.id]}
                      onChange={(value) => setValues((prev) => ({ ...prev, [material.id]: value }))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-2 border-t border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur">
        <input
          type="date"
          name="date"
          value={date}
          max={today}
          onChange={(event) => {
            if (event.target.value) router.push(`/resources?date=${event.target.value}`);
          }}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
        >
          {isPending ? "..." : "Зберегти"}
        </button>
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state && !state.error && !isPending && <p className="text-sm text-emerald-400">Збережено</p>}
      </div>
    </form>
  );
}
