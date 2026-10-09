import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, organizations(name)")
    .eq("id", user!.id)
    .single();

  const organizationName =
    (profile?.organizations as unknown as { name: string } | null)?.name ??
    "your business";

  const isNewSignup = welcome === "1";

  const { data: balances } = await supabase
    .from("invoice_balances")
    .select("customer_id, total_amount, amount_paid, outstanding, customers(name)");

  const totalInvoiced =
    balances?.reduce((sum, b) => sum + Number(b.total_amount), 0) ?? 0;
  const totalPaid =
    balances?.reduce((sum, b) => sum + Number(b.amount_paid), 0) ?? 0;
  const totalOutstanding =
    balances?.reduce((sum, b) => sum + Math.max(0, Number(b.outstanding)), 0) ?? 0;
  const collectionRate =
    totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  // Needs attention: customers who owe money and have never paid anything.
  const byCustomer = new Map<
    string,
    { name: string; outstanding: number; paid: number }
  >();
  for (const b of balances ?? []) {
    const name =
      (b.customers as unknown as { name: string } | null)?.name ??
      "Unknown customer";
    const entry = byCustomer.get(b.customer_id) ?? {
      name,
      outstanding: 0,
      paid: 0,
    };
    entry.outstanding += Math.max(0, Number(b.outstanding));
    entry.paid += Number(b.amount_paid);
    byCustomer.set(b.customer_id, entry);
  }

  const needsAttention = Array.from(byCustomer.entries())
    .filter(([, v]) => v.outstanding > 0 && v.paid === 0)
    .sort((a, b) => b[1].outstanding - a[1].outstanding)
    .slice(0, 5);

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <p className="mb-6 text-sm text-gray-500">
        {profile?.full_name ?? "there"} — {organizationName}
      </p>

      {isNewSignup && (
        <div className="mb-6 rounded-xl border border-brand-500 bg-brand-50 p-4">
          <p className="font-semibold text-brand-700">
            🎉 You're in — {organizationName} is live on Recova!
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Your account, your business, and your private database are all
            connected and working. Next up: add your first customer.
          </p>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total invoiced</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formatNaira(totalInvoiced)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Payments received</p>
          <p className="mt-1 text-lg font-semibold text-green-700">
            {formatNaira(totalPaid)}
          </p>
        </div>
        <a
          href="/dashboard/customers"
          className="rounded-xl border border-gray-200 p-4 hover:border-brand-500"
        >
          <p className="text-xs text-gray-500">Outstanding</p>
          <p className="mt-1 text-lg font-semibold text-red-700">
            {formatNaira(totalOutstanding)}
          </p>
        </a>
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Collection rate</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {collectionRate}%
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">
          Needs attention
        </h2>
        <a href="/dashboard/customers" className="text-sm text-brand-700 underline">
          View all customers →
        </a>
      </div>

      {needsAttention.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nobody needs urgent follow-up right now.
        </p>
      ) : (
        <div className="space-y-2">
          {needsAttention.map(([customerId, v]) => (
            <a
              key={customerId}
              href={`/dashboard/customers/${customerId}`}
              className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-sm hover:border-red-400"
            >
              <span className="flex items-center gap-2 font-medium text-gray-900">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                {v.name}
              </span>
              <span className="font-medium text-red-700">
                {formatNaira(v.outstanding)}
              </span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
    }
        
