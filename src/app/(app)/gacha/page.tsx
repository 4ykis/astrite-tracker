import Card from "@/components/Card";
import { getPityInfo, getWinRate } from "@/lib/gacha";
import PityBlock from "./PityBlock";

export const dynamic = "force-dynamic";

export default async function GachaPage() {
  const [pity, winRate] = await Promise.all([getPityInfo(), getWinRate(50)]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Гача-лог (50/50)</h1>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">Піті-лічильник</h2>
          <span className="text-xs text-slate-500">
            Win-rate: {winRate.rate === null ? "—" : `${Math.round(winRate.rate * 100)}%`} (
            {winRate.wins}/{winRate.total})
          </span>
        </div>
        <PityBlock pity={pity} />
      </Card>
    </div>
  );
}
