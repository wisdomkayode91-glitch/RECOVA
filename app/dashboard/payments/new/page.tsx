"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

type Customer = { id: string; name: string };
type InvoiceBalance = {
  invoice_id: string;
  invoice_number: string;
  outstanding: number;
};

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewPaymentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [invoices, setInvoices] = useState<InvoiceBalance[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayISODate());
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

  useEffect(() => {
    async function loadInvoices() {
      if (!customerId) {
        setInvoices([]);
        setInvoiceId("");
        return;
      }
      const { data } = await supabase
        .from("invoice_balances")
        .select("invoice_id, invoice_number, outstanding")
        .eq("customer_id", customerId)
        .gt("outstanding", 0)
        .order("due_date", { ascending: true });
      setInvoices(data ?? []);
      setInvoiceId("");
      setAmount("");
    }
    loadInvoices();
  }, [customerId]);

  function handleInvoiceChange(id: string) {
    setInvoiceId(id);
    const inv = invoices.find((i) => i.invoice_id === id);
    if (inv) setAmount(String(inv.outstanding));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerId || !invoiceId) {
      setError("Choose a customer and an invoice.");
      return;
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setLoading(true);

    const { error: rpcError } = await supabase.rpc("record_payment", {
      p_customer_id: customerId,
      p_invoice_id: invoiceId,
      p_amount: parsedAmount,
      p_method: method,
      p_reference: reference || null,
      p_payment_date: paymentDate,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/payments");
    router.refresh();
  }

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <h1 className="mb-6 text-xl font-semibold text-brand-700">
        Record payment
      </h1>

      {customers.length === 0 ? (
        <div className="max-w-sm rounded-xl border border-dashed border-gray-300 p-6 text-center">
          <p className="text-gray-600">Add a customer first.</p>
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

          {customerId && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Invoice to pay
              </label>
              {invoices.length === 0 ? (
                <p className="mt-1 text-sm text-gray-500">
                  This customer has no outstanding invoices.
                </p>
              ) : (
                <select
                  required
                  value={invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select an invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.invoice_id} value={inv.invoice_id}>
                      {inv.invoice_number} — ₦
                      {inv.outstanding.toLocaleString("en-NG")} outstanding
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount received (₦)
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
              Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="bank_transfer">Bank transfer</option>
              <option value="cash">Cash</option>
              <option value="pos">POS</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reference (optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment date
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Record payment"}
          </button>
        </form>
      )}
    </main>
  );
            }
