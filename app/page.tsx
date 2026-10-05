export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold text-brand-700">Recova</h1>
      <p className="text-gray-600">
        Know exactly who owes you, what they've paid, and what's left.
      </p>
      <div className="flex gap-3">
        <a
          href="/signup"
          className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
        >
          Get started
        </a>
        <a
          href="/login"
          className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Log in
        </a>
      </div>
    </main>
  );
}
