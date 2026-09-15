import Card from "@/components/Card";
import { prisma } from "@/lib/prisma";
import BalanceHistory from "../BalanceHistory";
import SpendList from "../spending/SpendList";
import PullList from "../gacha/PullList";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const [balances, spends, pulls] = await Promise.all([
    prisma.balanceEntry.findMany({ orderBy: { date: "desc" }, take: 20 }),
    prisma.spendEntry.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 50 }),
    prisma.pullEntry.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 50 }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Історія</h1>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-slate-300">Баланс</h2>
        <BalanceHistory entries={balances} />
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-slate-300">Витрати</h2>
        <SpendList entries={spends} />
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-slate-300">Гача-лог</h2>
        <PullList entries={pulls} />
      </Card>
    </div>
  );
}
