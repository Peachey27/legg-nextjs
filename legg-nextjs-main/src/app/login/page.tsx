// src/app/login/page.tsx

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const error = searchParams?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        method="POST"
        action="/api/login"
        className="bg-[#111] p-6 rounded-lg shadow-lg border border-white/10 w-full max-w-sm space-y-4"
      >
        <h1 className="text-lg font-semibold text-center">Scheduler Login</h1>

        <div className="space-y-2">
          <label className="block text-sm text-white/80" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent"
            placeholder="Enter password"
            required
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm">Incorrect password</div>
        )}

        <button
          type="submit"
          className="w-full py-2 rounded bg-accent text-black font-semibold"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
