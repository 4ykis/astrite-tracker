import Link from "next/link";

const links = [
  { href: "/", label: "Дашборд" },
  { href: "/spending", label: "Витрати" },
  { href: "/gacha", label: "Гача-лог" },
  { href: "/stats", label: "Статистика" },
];

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-1 overflow-x-auto px-4 py-3 text-sm">
        <span className="mr-2 shrink-0 text-lg">✧</span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-md px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-amber-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
