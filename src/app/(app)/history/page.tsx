import Link from "next/link";
import Card from "@/components/Card";
import { prisma } from "@/lib/prisma";
import BalanceHistory from "../BalanceHistory";
import SpendList from "../spending/SpendList";
import PullList from "../gacha/PullList";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

type SearchParams = { [key: string]: string | string[] | undefined };

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function Pagination({
  page,
  totalPages,
  paramKey,
  searchParams,
}: {
  page: number;
  totalPages: number;
  paramKey: string;
  searchParams: SearchParams;
}) {
  if (totalPages <= 1) return null;

  const hrefForPage = (targetPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === paramKey || value === undefined) continue;
      params.set(key, Array.isArray(value) ? value[0] : value);
    }
    params.set(paramKey, String(targetPage));
    return `/history?${params.toString()}`;
  };

  return (
    <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
      {page > 1 ? (
        <Link
          href={hrefForPage(page - 1)}
          className="rounded-md px-2 py-1 transition hover:bg-slate-800 hover:text-amber-300"
        >
          ← Попередня
        </Link>
      ) : (
        <span className="px-2 py-1 opacity-40">← Попередня</span>
      )}
      <span>
        Сторінка {page} з {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={hrefForPage(page + 1)}
          className="rounded-md px-2 py-1 transition hover:bg-slate-800 hover:text-amber-300"
        >
          Наступна →
        </Link>
      ) : (
        <span className="px-2 py-1 opacity-40">Наступна →</span>
      )}
    </div>
  );
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const balancePage = parsePage(params.balancePage);
  const spendPage = parsePage(params.spendPage);
  const pullPage = parsePage(params.pullPage);

  const [balances, balanceCount, spends, spendCount, pulls, pullCount] = await Promise.all([
    prisma.balanceEntry.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (balancePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.balanceEntry.count(),
    prisma.spendEntry.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (spendPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.spendEntry.count(),
    prisma.pullEntry.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (pullPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.pullEntry.count(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Історія</h1>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-slate-300">Баланс</h2>
        <BalanceHistory entries={balances} />
        <Pagination
          page={balancePage}
          totalPages={Math.max(1, Math.ceil(balanceCount / PAGE_SIZE))}
          paramKey="balancePage"
          searchParams={params}
        />
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-slate-300">Витрати</h2>
        <SpendList entries={spends} />
        <Pagination
          page={spendPage}
          totalPages={Math.max(1, Math.ceil(spendCount / PAGE_SIZE))}
          paramKey="spendPage"
          searchParams={params}
        />
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-slate-300">Гача-лог</h2>
        <PullList entries={pulls} />
        <Pagination
          page={pullPage}
          totalPages={Math.max(1, Math.ceil(pullCount / PAGE_SIZE))}
          paramKey="pullPage"
          searchParams={params}
        />
      </Card>
    </div>
  );
}
