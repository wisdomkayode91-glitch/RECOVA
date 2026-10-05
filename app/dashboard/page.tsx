import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export const runtime = "edge";

export default async function DashboardPage() {
  const supabase = createClient();

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

  return (
    <main className="min-h-screen px-6 py-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Welcome back,</p>
          <h1 className="text-xl font-semibold text-brand-700">
            {profile?.full_name ?? "there"} — {organizationName}
          </h1>
        </div>
        <SignOutButton />
      </header>

      <p className="text-gray-600">
        Customers and invoices land here next — this confirms your login,
        your organization, and your database connection all work together.
      </p>
    </main>
  );
}

Do exactly this:

1. Open "app/dashboard/page.tsx".
2. Replace the entire file with the code above.
3. Commit the change to GitHub.
4. Let the hosting platform create a new deployment from that commit.
5. Do not retry the old "be8b132" deployment.
