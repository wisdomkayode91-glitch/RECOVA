import SignOutButton from "@/components/SignOutButton";

export default function TopNav() {
  return (
    <nav className="mb-6 border-b border-gray-200 pb-3">
      <div className="flex items-center justify-between gap-3">
        <a
          href="/dashboard"
          className="shrink-0 text-lg font-bold text-brand-700"
        >
          Recova
        </a>
        <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto">
          <a
            href="/dashboard/customers"
            className="shrink-0 text-sm font-medium text-gray-600 hover:text-brand-700"
          >
            Customers
          </a>
          <a
            href="/dashboard/invoices"
            className="shrink-0 text-sm font-medium text-gray-600 hover:text-brand-700"
          >
            Invoices
          </a>
          <a
            href="/dashboard/payments"
            className="shrink-0 text-sm font-medium text-gray-600 hover:text-brand-700"
          >
            Payments
          </a>
        </div>
        <div className="shrink-0">
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
