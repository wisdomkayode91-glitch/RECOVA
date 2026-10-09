import SignOutButton from "@/components/SignOutButton";

export default function TopNav() {
  return (
    <nav className="mb-6 border-b border-gray-200 pb-3">
      <div className="flex items-center justify-between gap-3">
        <a href="/dashboard" className="text-lg font-bold text-brand-700">
          Recova
        </a>
        <SignOutButton />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <a
          href="/dashboard/customers"
          className="text-sm font-medium text-gray-600 hover:text-brand-700"
        >
          Customers
        </a>
        <a
          href="/dashboard/invoices"
          className="text-sm font-medium text-gray-600 hover:text-brand-700"
        >
          Invoices
        </a>
        <a
          href="/dashboard/payments"
          className="text-sm font-medium text-gray-600 hover:text-brand-700"
        >
          Payments
        </a>
      </div>
    </nav>
  );
}
