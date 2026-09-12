import { PullEntry } from "@prisma/client";
import { deletePullEntry } from "./actions";

const BANNER_LABEL = { CHARACTER: "Персонаж", WEAPON: "Зброя" } as const;

export default function PullList({ entries }: { entries: PullEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">Ще немає записів гача-логу</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-800">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-100">
              {entry.itemName}{" "}
              <span
                className={entry.result === "WIN" ? "text-emerald-400" : "text-red-400"}
              >
                {entry.result === "WIN" ? "WIN" : "LOSE"}
              </span>
            </span>
            <span className="text-xs text-slate-500">
              {entry.date.toLocaleDateString("uk-UA")} · {BANNER_LABEL[entry.bannerType]} ·{" "}
              {entry.bannerName} · піті {entry.pityAtPull}
            </span>
          </div>
          <form action={deletePullEntry.bind(null, entry.id)}>
            <button
              type="submit"
              className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-red-950 hover:text-red-300"
            >
              Видалити
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
