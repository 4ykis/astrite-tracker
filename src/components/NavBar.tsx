import Link from "next/link";

const links = [
  { href: "/", label: "Дашборд" },
  { href: "/gacha", label: "Гача-лог" },
  { href: "/resources", label: "Ресурси" },
  { href: "/echoes", label: "Префарм" },
  { href: "/history", label: "Історія" },
  { href: "/stats", label: "Статистика" },
];

type Props = { user: { name: string | null; email: string | null; image: string | null } };

export default function NavBar({ user }: Props) {
  const label = user.name ?? user.email ?? "Акаунт";

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
        <form action="/logout" method="post" className="ml-auto flex shrink-0 items-center gap-2 pl-2">
          {user.image ? (
            // Google avatars are tiny, so skip next/image and its remote config.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" title={label} referrerPolicy="no-referrer" className="h-7 w-7 rounded-full" />
          ) : (
            <span title={label} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-300">
              {label.charAt(0).toUpperCase()}
            </span>
          )}
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-amber-300"
          >
            Вийти
          </button>
        </form>
      </div>
    </nav>
  );
}
