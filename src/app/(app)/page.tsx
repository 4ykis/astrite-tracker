import Card from "@/components/Card";
import { requireUserId } from "@/lib/session";
import { getCurrentBalance } from "@/lib/balance";
import { getIncomeSummary, getTodayIncome, getYesterdayIncome } from "@/lib/income";
import { getSpendSummary, getTodaySpend, getYesterdaySpend } from "@/lib/spending";
import { toDayStart } from "@/lib/date";
import BalanceForm from "./BalanceForm";
import IncomeStats from "./IncomeStats";
import SpendStats from "./SpendStats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const [balance, yesterdayIncome, todayIncome, incomeSummary] = await Promise.all([
    getCurrentBalance(userId),
    getYesterdayIncome(userId),
    getTodayIncome(userId),
    getIncomeSummary(userId),
  ]);

  const [yesterdaySpend, todaySpend, spendSummary] = await Promise.all([
    getYesterdaySpend(userId),
    getTodaySpend(userId),
    getSpendSummary(userId, incomeSummary.allTime.days),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Дашборд</h1>

      <Card>
        <BalanceForm
          currentBalance={balance?.current ?? null}
          spentSince={balance?.spentSince ?? 0}
          today={toDayStart(new Date()).toISOString().slice(0, 10)}
        />
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-slate-300">Прибуток</h2>
        <IncomeStats
          yesterday={yesterdayIncome}
          today={todayIncome}
          last7Days={incomeSummary.last7Days}
          allTime={incomeSummary.allTime}
        />
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-slate-300">Витрати</h2>
        <SpendStats
          yesterday={yesterdaySpend}
          today={todaySpend}
          last7Days={spendSummary.last7Days}
          allTime={spendSummary.allTime}
        />
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
          <a
            href="https://wuthering.th.gl/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300 transition hover:border-amber-400 hover:text-amber-300"
          >
            Wuthering Waves Map (th.gl) ↗
          </a>
        </div>
      </Card>
    </div>
  );
}
