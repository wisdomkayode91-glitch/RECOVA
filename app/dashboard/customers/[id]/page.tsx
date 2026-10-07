import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

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

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <div className="mb-6 flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-gray-300" />
        <h1 className="text-xl font-semibold text-brand-700">
          {customer.name}
        </h1>
      </div>

      <div className="max-w-sm space-y-2 rounded-xl border border-gray-200 p-4 text-sm">
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
        <p>
          <span className="text-gray-500">Outstanding balance:</span> ₦0.00
          <span className="ml-1 text-xs text-gray-400">
            (invoices coming next)
          </span>
        </p>
      </div>
    </main>
  );
      }
