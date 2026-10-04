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

const LINK_CLASS =
  "rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-300 transition hover:border-amber-400 hover:text-amber-300";

const SITE_LINKS = [
  { href: "https://wuthering-waves-map.appsample.com/", label: "Wuthering Waves Interactive Map" },
  { href: "https://wuwatracker.com/", label: "WuWa Tracker" },
  { href: "https://wuthering.gg/map", label: "Wuthering.gg Map" },
  { href: "https://wuthering.th.gl/", label: "Wuthering Waves Map (th.gl)" },
];

const VIDEO_LINKS = [
  { href: "https://youtu.be/P8q8q8GWO_w?t=632", label: "Lucille Guide (IWinToLose Gaming)" },
];

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path
        fill="#ff0000"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.4-1.9.5-5.8.5-5.8s0-3.9-.5-5.8Z"
      />
      <path fill="#fff" d="m9.6 15.6 6.2-3.6-6.2-3.6v7.2Z" />
    </svg>
  );
}

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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">Сайти</h3>
            {SITE_LINKS.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                {link.label} ↗
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">YouTube</h3>
            {VIDEO_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${LINK_CLASS} flex items-center gap-2`}
              >
                <YouTubeIcon />
                <span>{link.label} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
