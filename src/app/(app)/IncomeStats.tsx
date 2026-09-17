import type { IncomeRange } from "@/lib/income";
import { toPulls } from "@/lib/astrite";

function formatAstrite(value: number | null) {
  if (value === null) return "—";
  return `${value > 0 ? "+" : ""}${value} astrite (${toPulls(Math.abs(value))} круток)`;
}

function StatBlock({
  label,
  income,
  avgPerDay,
  hint,
}: {
  label: string;
  income: number | null;
  avgPerDay?: number | null;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xl font-semibold text-amber-300">{formatAstrite(income)}</p>
      {avgPerDay !== undefined && (
        <p className="text-xs text-slate-500">
          {avgPerDay === null ? "—" : `Ø ${Math.round(avgPerDay)} astrite/день`}
        </p>
      )}
      {income === null && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function IncomeStats({
  yesterday,
  last7Days,
  allTime,
}: {
  yesterday: number | null;
  last7Days: IncomeRange;
  allTime: IncomeRange;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatBlock
        label="Дохід за вчора"
        income={yesterday}
        hint="Потрібно щонайменше два записи балансу поспіль"
      />
      <StatBlock
        label="Останні 7 днів"
        income={last7Days.income}
        avgPerDay={last7Days.avgPerDay}
        hint="Недостатньо даних за останні 7 днів"
      />
      <StatBlock
        label={`Весь час${allTime.days > 0 ? ` (${allTime.days} дн.)` : ""}`}
        income={allTime.income}
        avgPerDay={allTime.avgPerDay}
        hint="Потрібно щонайменше два записи балансу"
      />
    </div>
  );
}
