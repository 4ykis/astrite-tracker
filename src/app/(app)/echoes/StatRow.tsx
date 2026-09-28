export default function StatRow({
  stat,
  onClick,
}: {
  stat?: { label: string; short: string };
  onClick: () => void;
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
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-1 rounded-md border border-transparent px-1.5 py-1 text-left text-xs text-slate-100 lg:text-sm transition hover:border-slate-600 hover:bg-slate-800/80"
    >
      <span className="truncate lg:hidden">{stat.short}</span>
      <span className="hidden truncate lg:inline" title={stat.label}>
        {stat.label}
      </span>
      <span className="text-slate-500 transition group-hover:text-amber-300">›</span>
    </button>
  );
}
