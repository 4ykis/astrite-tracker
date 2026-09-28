import { prisma } from "@/lib/prisma";
import { normalizeSlots } from "@/lib/echoes";
import AddBuildButton from "./AddBuildButton";
import BuildCard from "./BuildCard";

export const dynamic = "force-dynamic";

export default async function EchoesPage() {
  const builds = await prisma.echoBuild.findMany({ orderBy: { createdAt: "asc" } });

  return (
    // Breaks out of the layout's max-w-3xl so five echo columns stay readable.
    <div className="ml-[calc(50%-min(36rem,50vw-1rem))] flex w-[min(72rem,100vw-2rem)] flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Префарм ехо</h1>
      {builds.map((build) => (
        <BuildCard
          key={build.id}
          id={build.id}
          characterId={build.characterId}
          slots={normalizeSlots(build.slots)}
        />
      ))}
      <AddBuildButton />
    </div>
  );
}
