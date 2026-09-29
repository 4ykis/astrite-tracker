export default function StatRow({
  stat,
  got,
  onClick,
  onToggle,
}: {
  stat?: { label: string; short: string };
  /** Whether this stat is already rolled on the real echo. */
  got: boolean;
  onClick: () => void;
  onToggle: () => void;
}) {
  if (!stat) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-md border border-dashed border-amber-400/60 bg-amber-400/10 px-1.5 py-1 text-left text-xs text-amber-200 lg:text-sm transition hover:border-amber-300 hover:bg-amber-400/20"
      >
        + обрати
      </button>
    );
  }

  return (
    <div
      className={`group flex w-full items-center gap-1.5 rounded-md border px-1.5 py-1 text-xs lg:text-sm transition ${
        got ? "border-emerald-500/40 bg-emerald-500/10" : "border-transparent hover:border-slate-600 hover:bg-slate-800/80"
      }`}
    >
      <input
        type="checkbox"
        checked={got}
        onChange={onToggle}
        aria-label={`${stat.label}: вже є`}
        className="size-3.5 shrink-0 cursor-pointer accent-emerald-500"
      />
      <button
        type="button"
        onClick={onClick}
        className={`flex min-w-0 flex-1 items-center justify-between gap-1 text-left ${
          got ? "text-emerald-200" : "text-slate-100"
        }`}
      >
        <span className="truncate lg:hidden">{stat.short}</span>
        <span className="hidden truncate lg:inline" title={stat.label}>
          {stat.label}
        </span>
        <span className="text-slate-500 transition group-hover:text-amber-300">›</span>
      </button>
    </div>
  );
}
