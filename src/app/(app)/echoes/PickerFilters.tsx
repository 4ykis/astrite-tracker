"use client";

/** Name search field for the picker headers. */
export function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="search"
      autoFocus
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Пошук…"
      aria-label="Пошук за назвою"
      className="h-10 min-w-32 flex-1 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-400 sm:max-w-56"
    />
  );
}

export const matchesSearch = (name: string, query: string) => name.toLowerCase().includes(query.trim().toLowerCase());

/** Single-choice filter toggle: picking the current value clears it. */
export const toggle = <T,>(current: T | null, value: T) => (current === value ? null : value);

const toggleClass = (active: boolean) =>
  `flex h-10 shrink-0 items-center justify-center rounded-md border transition ${
    active
      ? "border-amber-400 bg-amber-400/15 text-amber-200"
      : "border-slate-700 text-slate-400 opacity-70 hover:border-slate-500 hover:opacity-100"
  }`;

/**
 * Icon filter button; clicking the active one clears the filter.
 * The icon is drawn as a one-colour silhouette (its alpha channel) filled with `color`.
 */
export function IconToggle({
  icon,
  label,
  color = "#F1F5F9",
  active,
  onClick,
}: {
  icon: string;
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  const mask = `url(${icon}) center / contain no-repeat`;
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`${toggleClass(active)} w-10`}
    >
      <span className="size-7" style={{ backgroundColor: color, mask, WebkitMask: mask }} />
    </button>
  );
}

/** Small text filter button (e.g. rarity); clicking the active one clears the filter. */
export function TextToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`${toggleClass(active)} px-3 text-sm`}>
      {children}
    </button>
  );
}

/** Thin divider between filter groups. */
export function FilterDivider() {
  return <span className="mx-1 h-7 w-px shrink-0 bg-slate-700" />;
}
