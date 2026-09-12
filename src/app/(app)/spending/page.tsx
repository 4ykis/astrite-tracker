import Card from "@/components/Card";
import { prisma } from "@/lib/prisma";
import SpendForm from "./SpendForm";
import SpendList from "./SpendList";

export const dynamic = "force-dynamic";

export default async function SpendingPage() {
  const entries = await prisma.spendEntry.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Витрати</h1>

      <Card>
        <SpendForm />
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-slate-300">Останні витрати</h2>
        <SpendList entries={entries} />
      </Card>
    </div>
  );
}
