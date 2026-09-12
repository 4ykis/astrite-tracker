import Card from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { getYesterdayIncome } from "@/lib/income";
import { getPityInfo, getWinRate } from "@/lib/gacha";
import BalanceForm from "./BalanceForm";
import PityBlock from "./PityBlock";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [latestBalance, yesterdayIncome, pity, winRate] = await Promise.all([
    prisma.balanceEntry.findFirst({ orderBy: { date: "desc" } }),
    getYesterdayIncome(),
    getPityInfo(),
    getWinRate(50),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Дашборд</h1>

      <Card>
        <BalanceForm currentBalance={latestBalance?.amount ?? null} />
      </Card>

      <Card>
        <p className="text-sm text-slate-400">Дохід за вчора</p>
        <p className="mt-1 text-2xl font-semibold text-amber-300">
          {yesterdayIncome === null ? "—" : `${yesterdayIncome > 0 ? "+" : ""}${yesterdayIncome} astrite`}
        </p>
        {yesterdayIncome === null && (
          <p className="mt-1 text-xs text-slate-500">
            Потрібно щонайменше два записи балансу поспіль
          </p>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">Піті-лічильник</h2>
          <span className="text-xs text-slate-500">
            Win-rate (50/50): {winRate.rate === null ? "—" : `${Math.round(winRate.rate * 100)}%`}{" "}
            ({winRate.wins}/{winRate.total})
          </span>
        </div>
        <PityBlock pity={pity} />
      </Card>
    </div>
  );
}
