import { prisma } from "@/lib/prisma";
import { BannerType } from "@prisma/client";

export const SOFT_PITY = 66;
export const HARD_PITY = 80;

export type PityInfo = {
  bannerType: BannerType;
  currentPity: number;
  lastPull: {
    bannerName: string;
    itemName: string;
    result: "WIN" | "LOSE";
    pityAtPull: number;
  } | null;
};

export async function getPityInfo(): Promise<PityInfo[]> {
  const bannerTypes: BannerType[] = ["CHARACTER", "WEAPON"];

  return Promise.all(
    bannerTypes.map(async (bannerType) => {
      const [counter, lastPull] = await Promise.all([
        prisma.pityCounter.findUnique({ where: { bannerType } }),
        prisma.pullEntry.findFirst({
          where: { bannerType },
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        }),
      ]);

      return {
        bannerType,
        currentPity: counter?.currentPity ?? 0,
        lastPull: lastPull
          ? {
              bannerName: lastPull.bannerName,
              itemName: lastPull.itemName,
              result: lastPull.result,
              pityAtPull: lastPull.pityAtPull,
            }
          : null,
      };
    })
  );
}

export async function getWinRate(limit = 50) {
  const recentPulls = await prisma.pullEntry.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  const wins = recentPulls.filter((p) => p.result === "WIN").length;
  const total = recentPulls.length;

  return { wins, total, rate: total > 0 ? wins / total : null };
}
