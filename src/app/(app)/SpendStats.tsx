import type { SpendRange } from "@/lib/spending";

function formatAstrite(value: number) {
  return `-${value} astrite`;
}

function StatBlock({
  label,
  amount,
  avgPerDay,
  extra,
}: {
  label: string;
  amount: number;
  avgPerDay?: number | null;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xl font-semibold text-slate-100">{formatAstrite(amount)}</p>
      {avgPerDay !== undefined && (
        <p className="text-xs text-slate-500">
          {avgPerDay === null ? (
            "—"
          ) : (
            <>
              Ø <span className="font-medium text-white">{Math.round(avgPerDay)}</span> astrite/день
            </>
          )}
        </p>
      )}
      {extra}
    </div>
  );
}

export default function SpendStats({
  yesterday,
  today,
  last7Days,
  allTime,
}: {
  yesterday: number;
  today: number;
  last7Days: SpendRange;
  allTime: SpendRange;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatBlock
        label="Витрачено сьогодні"
        amount={today}
        extra={
          <p className="text-xs text-slate-500">
            Вчора: <span className="font-medium text-white">{formatAstrite(yesterday)}</span>
          </p>
        }
      />
      <StatBlock label="Останні 7 днів" amount={last7Days.amount} avgPerDay={last7Days.avgPerDay} />
      <StatBlock
        label={`Весь час${allTime.days > 0 ? ` (${allTime.days} дн.)` : ""}`}
        amount={allTime.amount}
        avgPerDay={allTime.avgPerDay}
      />
    </div>
  );
}
