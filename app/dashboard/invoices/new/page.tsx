"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

type Customer = { id: string; name: string };

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function generateInvoiceNumber() {
  return `INV-${Date.now()}`;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const supabase = createClient();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [issueDate, setIssueDate] = useState(todayISODate());
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      const { data } = await supabase
        .from("customers")
        .select("id, name")
        .order("name");
      setCustomers(data ?? []);
    }
    loadCustomers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError("Choose a customer.");
      return;
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user?.id)
      .single();

    if (!profile) {
      setError("Could not determine your organization.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("invoices").insert({
      organization_id: profile.organization_id,
      customer_id: customerId,
      invoice_number: generateInvoiceNumber(),
      total_amount: parsedAmount,
      status: "sent",
      issue_date: issueDate,
      due_date: dueDate || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/invoices");
    router.refresh();
  }

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <h1 className="mb-6 text-xl font-semibold text-brand-700">
        New invoice
      </h1>

      {customers.length === 0 ? (
        <div className="max-w-sm rounded-xl border border-dashed border-gray-300 p-6 text-center">
          <p className="text-gray-600">
            Add a customer first before creating an invoice.
          </p>
          <a
            href="/dashboard/customers/new"
            className="mt-2 inline-block text-brand-700 underline"
          >
            Add a customer
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer
            </label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount (₦)
            </label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Issue date
            </label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Create invoice"}
          </button>
        </form>
      )}
    </main>
  );
}
