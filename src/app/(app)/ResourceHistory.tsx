import MaterialIcon from "@/components/MaterialIcon";
import { ALL_MATERIALS } from "@/lib/materials";
import { ResourceDay } from "@/lib/resources";
import { deleteResourceDay } from "./resources/actions";

// delta is null for the very first record: everything counts as gained from zero.
function DeltaLabel({ delta, amount }: { delta: number | null; amount: number }) {
  const change = delta ?? amount;
  return (
    <span className={`font-medium ${change >= 0 ? "text-amber-300" : "text-red-400"}`}>
      {change >= 0 ? "+" : ""}
      {change}
      {change !== amount && <span className="font-normal text-slate-500"> ({amount})</span>}
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
        const changes = ALL_MATERIALS.flatMap((material) => {
          const delta = day.deltas[material.id];
          return delta === undefined || delta === 0 ? [] : [{ material, delta }];
        });

        return (
          <li key={day.date.toISOString()} className="py-2">
            <details open={index === 0} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="text-sm text-slate-300">
                  <span className="mr-1 inline-block text-slate-500 transition group-open:rotate-90">›</span>
                  {day.date.toLocaleDateString("uk-UA", { timeZone: "UTC" })}{" "}
                  <span className="text-slate-500">· змін: {changes.length}</span>
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

              {changes.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">Без змін</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-[5px]">
                  {changes.map(({ material, delta }) => (
                    <div key={material.id} className="flex flex-col items-center gap-0.5 text-base">
                      <MaterialIcon material={material} size={64} />
                      <DeltaLabel delta={delta} amount={day.amounts[material.id]} />
                    </div>
                  ))}
                </div>
              )}
            </details>
          </li>
        );
      })}
    </ul>
  );
}
