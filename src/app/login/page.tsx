const ERRORS: Record<string, string> = {
  cancelled: "Вхід скасовано",
  state: "Сесія входу застаріла, спробуйте ще раз",
  google: "Не вдалося увійти через Google",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-950 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-3xl">✧</span>
        <h1 className="text-xl font-semibold text-slate-100">Astrite Tracker</h1>
        <p className="text-sm text-slate-400">Увійдіть, щоб продовжити</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-4">
        {error && <p className="text-center text-sm text-red-400">{ERRORS[error] ?? ERRORS.google}</p>}
        {/* Plain link: the route handler redirects to Google. */}
        <a
          href="/login/google"
          className="flex items-center justify-center gap-3 rounded-lg bg-slate-100 px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-white"
        >
          <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
            />
          </svg>
          Увійти через Google
        </a>
      </div>
    </main>
  );
}
