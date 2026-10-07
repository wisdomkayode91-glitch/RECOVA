import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

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

      <a
        href="/dashboard/customers"
        className="inline-block rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
      >
        View customers →
      </a>
    </main>
  );
}
