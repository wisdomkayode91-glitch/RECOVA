import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function getInvoiceState(
  outstanding: number,
  amountPaid: number,
  dueDate: string | null,
  voidedAt: string | null
) {
  if (voidedAt) return { label: "Voided", color: "text-gray-400" };

  const isPaid = outstanding <= 0;
  if (isPaid) return { label: "Paid", color: "text-green-700" };

  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;
  if (isOverdue)
    return {
      label: `Overdue — ${formatNaira(outstanding)} left`,
      color: "text-red-700",
    };

  if (amountPaid > 0)
    return {
      label: `Partial — ${formatNaira(outstanding)} left`,
      color: "text-yellow-700",
    };

  return { label: "Unpaid", color: "text-gray-600" };
}

function buildReminderMessage(
  customerName: string,
  outstanding: number,
  unpaidInvoices: { invoice_number: string; outstanding: number }[]
) {
  const invoiceList = unpaidInvoices
    .map((i) => `${i.invoice_number} (${formatNaira(i.outstanding)})`)
    .join(", ");

  return `Hi ${customerName}, this is a friendly reminder that you currently have an outstanding balance of ${formatNaira(
    outstanding
  )}${
    invoiceList ? ` across: ${invoiceList}` : ""
  }. Kindly let us know when we can expect payment, or reach out if you have any questions. Thank you!`;
}

function whatsAppLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0")
    ? "234" + digits.slice(1)
    : digits.startsWith("234")
    ? digits
    : "234" + digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
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
    .from("invoice_balances")
    .select("invoice_id, invoice_number, total_amount, amount_paid, outstanding, due_date, voided_at")
    .eq("customer_id", id)
    .order("due_date", { ascending: true });

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, method, reference, payment_date")
    .eq("customer_id", id)
    .order("payment_date", { ascending: false });

  const outstanding =
    invoices?.reduce((sum, inv) => sum + Math.max(0, Number(inv.outstanding)), 0) ?? 0;
  const totalPaid =
    invoices?.reduce((sum, inv) => sum + Number(inv.amount_paid), 0) ?? 0;

  let statusColor = "bg-green-500";
  let statusLabel = "No balance owed";
  if (outstanding > 0) {
    statusLabel = "Owes money";
    statusColor = totalPaid > 0 ? "bg-yellow-500" : "bg-red-500";
  }

  const unpaidInvoices =
    invoices
      ?.filter((inv) => Number(inv.outstanding) > 0)
      .map((inv) => ({
        invoice_number: inv.invoice_number,
        outstanding: Number(inv.outstanding),
      })) ?? [];

  const reminderMessage = buildReminderMessage(
    customer.name,
    outstanding,
    unpaidInvoices
  );

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${statusColor}`} title={statusLabel} />
          <h1 className="text-xl font-semibold text-brand-700">
            {customer.name}
          </h1>
        </div>
        <a
          href={`/dashboard/customers/${id}/edit`}
          className="text-sm text-brand-700 underline"
        >
          Edit
        </a>
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

      {outstanding > 0 && customer.phone && (
        <a
          href={whatsAppLink(customer.phone, reminderMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          💬 Remind via WhatsApp
        </a>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Invoices</h2>
        <div className="flex gap-3 text-sm">
          <a href="/dashboard/payments/new" className="text-brand-700 underline">
            + Record payment
          </a>
          <a href="/dashboard/invoices/new" className="text-brand-700 underline">
            + New invoice
          </a>
        </div>
      </div>

      {(!invoices || invoices.length === 0) && (
        <p className="mb-6 text-sm text-gray-500">No invoices for this customer yet.</p>
      )}

      <div className="mb-8 space-y-2">
        {invoices?.map((invoice) => {
          const outstandingAmt = Math.max(0, Number(invoice.outstanding));
          const amountPaid = Number(invoice.amount_paid);
          const state = getInvoiceState(
            outstandingAmt,
            amountPaid,
            invoice.due_date,
            invoice.voided_at
          );
          const canVoid = !invoice.voided_at && amountPaid === 0;

          return (
            <div
              key={invoice.invoice_id}
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
                <p className="text-gray-500">
                  Paid {formatNaira(amountPaid)} of{" "}
                  {formatNaira(invoice.total_amount)}
                </p>
                {canVoid && (
                  <a
                    href={`/dashboard/invoices/${invoice.invoice_id}/void`}
                    className="text-xs text-red-600 underline"
                  >
                    Void
                  </a>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatNaira(invoice.total_amount)}
                </p>
                <p className={state.color}>{state.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mb-4 font-semibold text-gray-900">Payment history</h2>

      {(!payments || payments.length === 0) && (
        <p className="text-sm text-gray-500">No payments recorded yet.</p>
      )}

      <div className="space-y-2">
        {payments?.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 p-3 text-sm"
          >
            <div>
              <p className="text-gray-900">
                {new Date(payment.payment_date).toLocaleDateString("en-NG")}
              </p>
              <p className="text-gray-500">
                {payment.method}
                {payment.reference ? ` · ${payment.reference}` : ""}
              </p>
            </div>
            <span className="font-medium text-green-700">
              {formatNaira(payment.amount)}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
          }
