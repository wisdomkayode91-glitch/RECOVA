import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank transfer",
  cash: "Cash",
  pos: "POS",
  cheque: "Cheque",
  other: "Other",
  manual: "Manual",
};

export default async function PaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, method, reference, payment_date, customers(name)")
    .order("payment_date", { ascending: false });

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-700">Payments</h1>
        <a
          href="/dashboard/payments/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Record payment
        </a>
      </div>

      {(!payments || payments.length === 0) && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">No payments recorded yet.</p>
          <a
            href="/dashboard/payments/new"
            className="mt-2 inline-block text-brand-700 underline"
          >
            Record your first payment
          </a>
        </div>
      )}

      <div className="space-y-2">
        {payments?.map((payment) => {
          const customerName =
            (payment.customers as unknown as { name: string } | null)
              ?.name ?? "Unknown customer";

          return (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{customerName}</p>
                <p className="text-sm text-gray-500">
                  {new Date(payment.payment_date).toLocaleDateString("en-NG")}
                  {" · "}
                  {METHOD_LABELS[payment.method] ?? payment.method}
                  {payment.reference ? ` · ${payment.reference}` : ""}
                </p>
              </div>
              <span className="shrink-0 font-medium text-green-700">
                {formatNaira(payment.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
