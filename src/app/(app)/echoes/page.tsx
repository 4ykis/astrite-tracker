import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUserId } from "@/lib/session";
import { CHARACTER_BY_ID, normalizeSlots } from "@/lib/echoes";
import AddBuildButton from "./AddBuildButton";
import BuildCard from "./BuildCard";
import CollapseFinishedButton from "./CollapseFinishedButton";
import FinishedStrip from "./FinishedStrip";

export const dynamic = "force-dynamic";

export default async function EchoesPage() {
  const userId = await requireUserId();
  const { collapseFinishedBuilds } = await getCurrentUser();
  const builds = await prisma.echoBuild.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  // Shelved builds live in the strip above the list; one whose hero is unknown stays in the list.
  const shelved = builds.flatMap((build) =>
    build.shelved && build.characterId !== null && CHARACTER_BY_ID.has(build.characterId)
      ? [{ id: build.id, characterId: build.characterId }]
      : [],
  );
  const shelvedIds = new Set(shelved.map((item) => item.id));
  const listed = builds.filter((build) => !shelvedIds.has(build.id));

  return (
    // Breaks out of the layout's max-w-3xl so five echo columns stay readable.
    <div className="ml-[calc(50%-min(36rem,50vw-1rem))] flex w-[min(72rem,100vw-2rem)] flex-col gap-5 p-[10px]">
      {shelved.length > 0 && <FinishedStrip items={shelved} />}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-slate-100">Префарм ехо</h1>
        <CollapseFinishedButton on={collapseFinishedBuilds} />
      </div>
      {listed.map((build, index) => (
        <BuildCard
          key={build.id}
          id={build.id}
          characterId={build.characterId}
          weaponId={build.weaponId}
          forteNodes={build.forteNodes}
          slots={normalizeSlots(build.slots)}
          collapsed={build.collapsed}
          finished={build.finished}
          isFirst={index === 0}
          isLast={index === listed.length - 1}
        />
      ))}
      <AddBuildButton />
    </div>
  );
}
