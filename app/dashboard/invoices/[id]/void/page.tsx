"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

export default function VoidInvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [voiding, setVoiding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("invoices")
        .select("invoice_number, customer_id")
        .eq("id", params.id)
        .single();
      if (data) {
        setInvoiceNumber(data.invoice_number);
        setCustomerId(data.customer_id);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleVoid() {
    setError(null);

    if (!reason.trim()) {
      setError("Please enter a reason for voiding this invoice.");
      return;
    }

    setVoiding(true);

    const { error: rpcError } = await supabase.rpc("void_invoice", {
      p_invoice_id: params.id,
      p_reason: reason,
    });

    if (rpcError) {
      setError(rpcError.message);
      setVoiding(false);
      return;
    }

    router.push(`/dashboard/customers/${customerId}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-6">
        <TopNav />
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <h1 className="mb-2 text-xl font-semibold text-brand-700">
        Void invoice {invoiceNumber}
      </h1>
      <p className="mb-6 max-w-sm text-sm text-gray-600">
        This does not delete the invoice — it stays visible in your records
        marked as voided, and this action is permanently logged. You can
        only void an invoice that has never had a payment recorded against
        it.
      </p>

      <div className="max-w-sm">
        <label className="block text-sm font-medium text-gray-700">
          Reason (required)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="e.g. Created by mistake, wrong amount, duplicate invoice"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleVoid}
          disabled={voiding}
          className="mt-4 w-full rounded-md bg-red-600 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {voiding ? "Voiding..." : "Void this invoice"}
        </button>

        <a
          href={`/dashboard/customers/${customerId}`}
          className="mt-3 block text-center text-sm text-gray-500 underline"
        >
          Cancel
        </a>
      </div>
    </main>
  );
  }
