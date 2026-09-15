import { BalanceEntry } from "@prisma/client";
import { deleteBalanceEntry } from "./actions";

export default function BalanceHistory({ entries }: { entries: BalanceEntry[] }) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-slate-500">Останні записи</p>
      <ul className="flex flex-col divide-y divide-slate-800">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm text-slate-300">
              {entry.date.toLocaleDateString("uk-UA", { timeZone: "UTC" })}{" "}
              <span className="font-medium text-slate-100">{entry.amount} astrite</span>
            </span>
            <form action={deleteBalanceEntry.bind(null, entry.id)}>
              <button
                type="submit"
                className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-red-950 hover:text-red-300"
              >
                Скасувати
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
