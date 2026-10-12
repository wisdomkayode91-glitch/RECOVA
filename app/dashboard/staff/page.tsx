import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

export default async function StaffPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user!.id)
    .single();

  const { data: team } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: true });

  const isOwner = myProfile?.role === "owner";

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-700">Team</h1>
        {isOwner && (
          <a
            href="/dashboard/staff/invite"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Invite staff
          </a>
        )}
      </div>

      <div className="space-y-2">
        {team?.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 p-3 text-sm"
          >
            <div>
              <p className="font-medium text-gray-900">
                {member.full_name ?? "Unnamed"}
                {member.id === user!.id ? " (you)" : ""}
              </p>
              <p className="text-gray-500">
                Joined{" "}
                {new Date(member.created_at).toLocaleDateString("en-NG")}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                member.role === "owner"
                  ? "bg-brand-50 text-brand-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {member.role}
            </span>
          </div>
        ))}
      </div>

      {!isOwner && (
        <p className="mt-6 text-sm text-gray-500">
          Only the organization owner can invite new team members or remove
          access.
        </p>
      )}
    </main>
  );
      }
