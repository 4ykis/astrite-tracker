import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-950 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-3xl">✧</span>
        <h1 className="text-xl font-semibold text-slate-100">Astrite Tracker</h1>
        <p className="text-sm text-slate-400">Введіть код доступу, щоб продовжити</p>
      </div>
      <LoginForm />
    </main>
  );
}
