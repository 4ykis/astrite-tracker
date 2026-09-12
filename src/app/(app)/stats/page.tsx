import Card from "@/components/Card";
import { prisma } from "@/lib/prisma";
import { getIncomeSeries, Granularity } from "@/lib/income";
import StatsChart from "./StatsChart";
import SpendByCategoryChart from "./SpendByCategoryChart";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const granularities: Granularity[] = ["day", "week", "month", "year"];
  const seriesEntries = await Promise.all(
    granularities.map(async (g) => [g, await getIncomeSeries(g)] as const)
  );
  const series = Object.fromEntries(seriesEntries) as Record<
    Granularity,
    Awaited<ReturnType<typeof getIncomeSeries>>
  >;

  const spendByCategory = await prisma.spendEntry.groupBy({
    by: ["category"],
    _sum: { amount: true },
  });
  const categoryData = [
    {
      name: "Персонажі" as const,
      amount: spendByCategory.find((s) => s.category === "CHARACTER")?._sum.amount ?? 0,
    },
    {
      name: "Зброя" as const,
      amount: spendByCategory.find((s) => s.category === "WEAPON")?._sum.amount ?? 0,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Статистика</h1>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-slate-300">Дохід astrite</h2>
        <StatsChart series={series} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-slate-300">Витрати за категорією</h2>
        <SpendByCategoryChart data={categoryData} />
      </Card>
    </div>
  );
}
