import { redirect } from "next/navigation";
import Link from "next/link";
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

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-700">Customers</h1>
        <Link
          href="/dashboard/customers/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add customer
        </Link>
      </div>

      {(!customers || customers.length === 0) && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">No customers yet.</p>
          <Link
            href="/dashboard/customers/new"
            className="mt-2 inline-block text-brand-700 underline"
          >
            Add your first customer
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {customers?.map((customer) => (
          <Link
            key={customer.id}
            href={`/dashboard/customers/${customer.id}`}
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-brand-500 hover:shadow-sm"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full bg-gray-300"
              title="No activity yet"
            />
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">
                {customer.name}
              </p>
              <p className="truncate text-sm text-gray-500">
                {customer.email || customer.phone || "No contact info"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
  
