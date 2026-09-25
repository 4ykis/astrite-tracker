import Card from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { getIncomeSummary, getYesterdayIncome } from "@/lib/income";
import { getPityInfo, getWinRate } from "@/lib/gacha";
import BalanceForm from "./BalanceForm";
import PityBlock from "./PityBlock";
import IncomeStats from "./IncomeStats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [latestBalance, yesterdayIncome, incomeSummary, pity, winRate] =
    await Promise.all([
      prisma.balanceEntry.findFirst({ orderBy: [{ date: "desc" }, { createdAt: "desc" }] }),
      getYesterdayIncome(),
      getIncomeSummary(),
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
        <IncomeStats
          yesterday={yesterdayIncome}
          last7Days={incomeSummary.last7Days}
          allTime={incomeSummary.allTime}
        />
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

      <Card>
        <h2 className="mb-3 text-sm font-medium text-slate-300">Корисні посилання</h2>
        <div className="flex flex-col gap-2">
          <a
            href="https://wuthering-waves-map.appsample.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300 transition hover:border-amber-400 hover:text-amber-300"
          >
            Wuthering Waves Interactive Map ↗
          </a>
          <a
            href="https://wuwatracker.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300 transition hover:border-amber-400 hover:text-amber-300"
          >
            WuWa Tracker ↗
          </a>
          <a
            href="https://wuthering.gg/map"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300 transition hover:border-amber-400 hover:text-amber-300"
          >
            Wuthering.gg Map ↗
          </a>
        </div>
      </Card>
    </div>
  );
}
