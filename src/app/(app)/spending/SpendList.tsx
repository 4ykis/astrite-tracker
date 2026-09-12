import { SpendEntry } from "@prisma/client";
import { deleteSpendEntry } from "./actions";

const CATEGORY_LABEL = { CHARACTER: "Персонаж", WEAPON: "Зброя" } as const;

export default function SpendList({ entries }: { entries: SpendEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">Ще немає записів про витрати</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-800">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-100">
              -{entry.amount} astrite{" "}
              <span className="text-slate-500">({CATEGORY_LABEL[entry.category]})</span>
            </span>
            <span className="text-xs text-slate-500">
              {entry.date.toLocaleDateString("uk-UA")}
              {entry.bannerName ? ` · ${entry.bannerName}` : ""}
              {entry.note ? ` · ${entry.note}` : ""}
            </span>
          </div>
          <form action={deleteSpendEntry.bind(null, entry.id)}>
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
