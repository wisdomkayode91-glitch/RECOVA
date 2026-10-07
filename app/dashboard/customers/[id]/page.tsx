import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, email, phone, customer_reference, created_at")
    .eq("id", id)
    .single();

  if (!customer) {
    notFound();
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, total_amount, status, due_date")
    .eq("customer_id", id)
    .order("due_date", { ascending: true });

  // V1: no payments yet, so outstanding = every unpaid invoice's full amount.
  const outstanding =
    invoices
      ?.filter((inv) => inv.status !== "paid")
      .reduce((sum, inv) => sum + Number(inv.total_amount), 0) ?? 0;

  const statusColor =
    outstanding === 0 ? "bg-green-500" : "bg-red-500";
  const statusLabel = outstanding === 0 ? "No balance owed" : "Owes money";

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <div className="mb-6 flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${statusColor}`} title={statusLabel} />
        <h1 className="text-xl font-semibold text-brand-700">
          {customer.name}
        </h1>
      </div>

      <div className="mb-6 max-w-sm space-y-2 rounded-xl border border-gray-200 p-4 text-sm">
        <p>
          <span className="text-gray-500">Email:</span>{" "}
          {customer.email || "—"}
        </p>
        <p>
          <span className="text-gray-500">Phone:</span>{" "}
          {customer.phone || "—"}
        </p>
        <p>
          <span className="text-gray-500">Reference:</span>{" "}
          {customer.customer_reference || "—"}
        </p>
        <p className="pt-1 text-base font-semibold text-gray-900">
          Outstanding balance: {formatNaira(outstanding)}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Invoices</h2>
        <a
          href="/dashboard/invoices/new"
          className="text-sm text-brand-700 underline"
        >
          + New invoice
        </a>
      </div>

      {(!invoices || invoices.length === 0) && (
        <p className="text-sm text-gray-500">No invoices for this customer yet.</p>
      )}

      <div className="space-y-2">
        {invoices?.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 p-3 text-sm"
          >
            <div>
              <p className="font-medium text-gray-900">
                {invoice.invoice_number}
              </p>
              <p className="text-gray-500">
                due{" "}
                {invoice.due_date
                  ? new Date(invoice.due_date).toLocaleDateString("en-NG")
                  : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {formatNaira(invoice.total_amount)}
              </p>
              <p className="text-gray-500">{invoice.status}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
  
