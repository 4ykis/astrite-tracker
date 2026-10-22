"use client";

import { useOptimistic, useTransition } from "react";
import Card from "@/components/Card";
import { CHARACTER_BY_ID } from "@/lib/echoes";
import { unshelveBuild } from "./actions";
import { CharacterIcon } from "./BuildCard";

/** Finished heroes tucked away from the build list while collapsing is on: an icon brings its build back. */
export default function FinishedStrip({ items }: { items: { id: string; characterId: number }[] }) {
  const [shown, removeShown] = useOptimistic(items, (current, id: string) => current.filter((item) => item.id !== id));
  const [, startTransition] = useTransition();

  return (
    <Card className="flex flex-wrap items-center gap-2 !p-3">
      <span className="mr-1 text-sm text-slate-400">Готові · {shown.length}</span>
      {shown.map(({ id, characterId }) => {
        const character = CHARACTER_BY_ID.get(characterId);
        if (!character) return null;
        return (
          <button
            key={id}
            type="button"
            title={`${character.name} — повернути в список`}
            onClick={() =>
              startTransition(async () => {
                removeShown(id);
                await unshelveBuild(id);
              })
            }
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-1.5 transition hover:border-amber-400/70 hover:ring-2 hover:ring-amber-400/40"
          >
            <CharacterIcon character={character} className="size-12" />
          </button>
        );
      })}
    </Card>
  );
}
