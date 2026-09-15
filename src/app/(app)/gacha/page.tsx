import Card from "@/components/Card";
import { getWinRate } from "@/lib/gacha";
import PullForm from "./PullForm";

export const dynamic = "force-dynamic";

export default async function GachaPage() {
  const winRate = await getWinRate(50);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Гача-лог (50/50)</h1>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">Новий пул</h2>
          <span className="text-xs text-slate-500">
            Win-rate: {winRate.rate === null ? "—" : `${Math.round(winRate.rate * 100)}%`} (
            {winRate.wins}/{winRate.total})
          </span>
        </div>
        <PullForm />
      </Card>
    </div>
  );
}
