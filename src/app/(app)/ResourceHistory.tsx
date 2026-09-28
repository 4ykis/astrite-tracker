import MaterialIcon from "@/components/MaterialIcon";
import { SERIES, breakdown, needFor } from "@/lib/materials";
import { ResourceDay } from "@/lib/resources";
import { deleteResourceDay } from "./resources/actions";

function DeltaLabel({ delta, amount }: { delta: number | null | undefined; amount: number }) {
  if (delta === undefined || delta === 0) {
    return <span className="text-slate-500">— ({amount})</span>;
  }
  if (delta === null) {
    return <span className="font-medium text-slate-100">{amount}</span>;
  }
  return (
    <span className={`font-medium ${delta >= 0 ? "text-amber-300" : "text-red-400"}`}>
      {delta >= 0 ? "+" : ""}
      {delta} ({amount})
    </span>
  );
}

export default function ResourceHistory({ days }: { days: ResourceDay[] }) {
  if (days.length === 0) {
    return <p className="text-sm text-slate-500">Ще немає записів ресурсів</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-800">
      {days.map((day, index) => {
        const changed = Object.keys(day.deltas).length;

        return (
          <li key={day.date.toISOString()} className="py-2">
            <details open={index === 0} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="text-sm text-slate-300">
                  <span className="mr-1 inline-block text-slate-500 transition group-open:rotate-90">›</span>
                  {day.date.toLocaleDateString("uk-UA", { timeZone: "UTC" })}{" "}
                  <span className="text-slate-500">· змін: {changed}</span>
                </span>
                <form action={deleteResourceDay.bind(null, day.date.toISOString())}>
                  <button
                    type="submit"
                    className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-red-950 hover:text-red-300"
                  >
                    Видалити
                  </button>
                </form>
              </summary>

              <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {SERIES.map((s) => (
                  <div key={s.key} className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">{s.name}</span>
                    <div className="grid grid-cols-4 gap-2">
                      {s.items.map((material) => {
                        const amount = day.amounts[material.id] ?? 0;
                        const { full, rem, need } = breakdown(amount, needFor(s.group, material.tier));
                        return (
                          <div key={material.id} className="flex flex-col items-center gap-0.5 text-[11px]">
                            <MaterialIcon material={material} size={36} />
                            <DeltaLabel delta={day.deltas[material.id]} amount={amount} />
                            <span className="whitespace-nowrap text-slate-600">
                              ({rem}/{need}) <span className={full > 0 ? "text-amber-300/80" : ""}>{full}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
