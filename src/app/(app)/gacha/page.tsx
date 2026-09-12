import Card from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { getWinRate } from "@/lib/gacha";
import PullForm from "./PullForm";
import PullList from "./PullList";

export const dynamic = "force-dynamic";

export default async function GachaPage() {
  const [entries, winRate] = await Promise.all([
    prisma.pullEntry.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 50,
    }),
    getWinRate(50),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Гача-лог (50/50)</h1>

      <Card>
        <PullForm />
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">Останні 50 пулів</h2>
          <span className="text-xs text-slate-500">
            Win-rate: {winRate.rate === null ? "—" : `${Math.round(winRate.rate * 100)}%`} (
            {winRate.wins}/{winRate.total})
          </span>
        </div>
        <PullList entries={entries} />
      </Card>
    </div>
  );
}
