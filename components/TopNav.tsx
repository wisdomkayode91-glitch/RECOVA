import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function TopNav() {
  return (
    <nav className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-lg font-bold text-brand-700">
          Recova
        </Link>
        <Link
          href="/dashboard/customers"
          className="text-sm font-medium text-gray-600 hover:text-brand-700"
        >
          Customers
        </Link>
        <Link
          href="/dashboard/invoices"
          className="text-sm font-medium text-gray-600 hover:text-brand-700"
        >
          Invoices
        </Link>
      </div>
      <SignOutButton />
    </nav>
  );
}
