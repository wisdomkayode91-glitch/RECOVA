import SignOutButton from "@/components/SignOutButton";

export default function TopNav() {
  return (
    <nav className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
      <div className="flex items-center gap-6">
        <a href="/dashboard" className="text-lg font-bold text-brand-700">
          Recova
        </a>
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
      </div>
      <SignOutButton />
    </nav>
  );
}
