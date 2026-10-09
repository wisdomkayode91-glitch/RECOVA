import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default async function InvoicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invoices } = await supabase
    .from("invoice_balances")
    .select(
      "invoice_id, invoice_number, total_amount, amount_paid, outstanding, due_date, customer_id, customers(name)"
    )
    .order("due_date", { ascending: true });

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-700">Invoices</h1>
        <a
          href="/dashboard/invoices/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + New invoice
        </a>
      </div>

      {(!invoices || invoices.length === 0) && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">No invoices yet.</p>
          <a
            href="/dashboard/invoices/new"
            className="mt-2 inline-block text-brand-700 underline"
          >
            Create your first invoice
          </a>
        </div>
      )}

      <div className="space-y-2">
        {invoices?.map((invoice) => {
          const customerName =
            (invoice.customers as unknown as { name: string } | null)
              ?.name ?? "Unknown customer";
          const paid = Math.max(0, Number(invoice.outstanding)) <= 0;
          const partial = !paid && Number(invoice.amount_paid) > 0;
          const badgeStyle = paid
            ? "bg-green-100 text-green-700"
            : partial
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700";
          const badgeLabel = paid ? "paid" : partial ? "partial" : "unpaid";

          return (
            <a
              key={invoice.invoice_id}
              href={`/dashboard/customers/${invoice.customer_id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-brand-500"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{customerName}</p>
                <p className="text-sm text-gray-500">
                  {invoice.invoice_number} · due{" "}
                  {invoice.due_date
                    ? new Date(invoice.due_date).toLocaleDateString("en-NG")
                    : "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-medium text-gray-900">
                  {formatNaira(invoice.total_amount)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyle}`}
                >
                  {badgeLabel}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
          }
