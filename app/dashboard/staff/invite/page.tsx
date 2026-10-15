"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

export default function InviteStaffPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/staff/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error ?? "Could not send invite.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="min-h-screen px-6 py-6">
        <TopNav />
        <div className="max-w-sm rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-800">Invite sent!</p>
          <p className="mt-1 text-sm text-green-700">
            {email} will receive an email to set their password and join
            your team as staff.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/staff")}
          className="mt-4 text-sm text-brand-700 underline"
        >
          Back to team
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <h1 className="mb-6 text-xl font-semibold text-brand-700">
        Invite staff
      </h1>

      <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <p className="text-xs text-gray-500">
          They'll get an email to set their own password. They'll join as
          Staff — unable to void invoices or archive customers, only you can
          do that.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-600 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send invite"}
        </button>
      </form>
    </main>
  );
        }
