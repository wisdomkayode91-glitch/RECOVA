import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

export default async function CustomersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, email, phone, created_at")
    .order("created_at", { ascending: false });

  const { data: balances } = await supabase
    .from("invoice_balances")
    .select("customer_id, outstanding");

  const outstandingByCustomer = new Map<string, number>();
  for (const row of balances ?? []) {
    const current = outstandingByCustomer.get(row.customer_id) ?? 0;
    outstandingByCustomer.set(
      row.customer_id,
      current + Math.max(0, Number(row.outstanding))
    );
  }

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-700">Customers</h1>
        <a
          href="/dashboard/customers/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add customer
        </a>
      </div>

      {(!customers || customers.length === 0) && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">No customers yet.</p>
          <a
            href="/dashboard/customers/new"
            className="mt-2 inline-block text-brand-700 underline"
          >
            Add your first customer
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {customers?.map((customer) => {
          const outstanding = outstandingByCustomer.get(customer.id) ?? 0;
          const dotColor = outstanding === 0 ? "bg-green-500" : "bg-red-500";
          const statusLabel =
            outstanding === 0
              ? "No balance owed"
              : `Owes ₦${outstanding.toLocaleString("en-NG")}`;

          return (
            <a
              key={customer.id}
              href={`/dashboard/customers/${customer.id}`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-brand-500 hover:shadow-sm"
            >
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${dotColor}`}
                title={statusLabel}
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">
                  {customer.name}
                </p>
                <p className="truncate text-sm text-gray-500">
                  {statusLabel}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
}
