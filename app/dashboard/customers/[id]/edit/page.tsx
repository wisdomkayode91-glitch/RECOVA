"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [archiveReason, setArchiveReason] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("customers")
        .select("name, email, phone, customer_reference")
        .eq("id", params.id)
        .single();
      if (data) {
        setName(data.name ?? "");
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
        setReference(data.customer_reference ?? "");
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const { error: rpcError } = await supabase.rpc("update_customer", {
      p_customer_id: params.id,
      p_name: name,
      p_email: email || null,
      p_phone: phone || null,
      p_reference: reference || null,
    });

    if (rpcError) {
      setError(rpcError.message);
      setSaving(false);
      return;
    }

    router.push(`/dashboard/customers/${params.id}`);
    router.refresh();
  }

  async function handleArchive() {
    setArchiveError(null);

    if (!archiveReason.trim()) {
      setArchiveError("Please enter a reason for archiving this customer.");
      return;
    }

    setArchiving(true);

    const { error: rpcError } = await supabase.rpc("archive_customer", {
      p_customer_id: params.id,
      p_reason: archiveReason,
    });

    if (rpcError) {
      setArchiveError(rpcError.message);
      setArchiving(false);
      return;
    }

    router.push("/dashboard/customers");
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

      <h1 className="mb-6 text-xl font-semibold text-brand-700">
        Edit customer
      </h1>

      <form onSubmit={handleSave} className="max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Customer reference
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-brand-600 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="mt-10 max-w-sm rounded-xl border border-red-200 bg-red-50 p-4">
        <h2 className="mb-1 font-semibold text-red-800">Archive customer</h2>
        <p className="mb-3 text-sm text-red-700">
          This does not delete any history — invoices and payments stay
          intact and this action is permanently logged. Archiving only
          removes them from your active customer list.
        </p>
        <label className="block text-sm font-medium text-gray-700">
          Reason (required)
        </label>
        <textarea
          value={archiveReason}
          onChange={(e) => setArchiveReason(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="e.g. Duplicate customer, business closed, etc."
        />
        {archiveError && (
          <p className="mt-2 text-sm text-red-600">{archiveError}</p>
        )}
        <button
          type="button"
          onClick={handleArchive}
          disabled={archiving}
          className="mt-3 w-full rounded-md bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {archiving ? "Archiving..." : "Archive this customer"}
        </button>
      </div>
    </main>
  );
            }
    
