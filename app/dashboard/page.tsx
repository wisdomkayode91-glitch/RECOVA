import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export const runtime = "edge";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { welcome?: string };
}) {
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

  const isNewSignup = searchParams?.welcome === "1";

  return (
    <main className="min-h-screen px-6 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Welcome back,</p>
          <h1 className="text-xl font-semibold text-brand-700">
            {profile?.full_name ?? "there"} — {organizationName}
          </h1>
        </div>
        <SignOutButton />
      </header>

      {isNewSignup && (
        <div className="mb-6 rounded-xl border border-brand-500 bg-brand-50 p-4">
          <p className="font-semibold text-brand-700">
            🎉 You're in — {organizationName} is live on Recova!
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Your account, your business, and your private database are all
            connected and working. Next up: add your first customer and
            watch Recova start tracking who owes you what.
          </p>
        </div>
      )}

      <p className="text-gray-600">
        Customers and invoices land here next — this confirms your login,
        your organization, and your database connection all work together.
      </p>
    </main>
  );
}
