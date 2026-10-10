import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

const ACTION_LABELS: Record<string, string> = {
  update_customer: "Edited customer",
  archive_customer: "Archived customer",
  void_invoice: "Voided invoice",
};

export default async function AuditLogPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: entries } = await supabase
    .from("audit_log")
    .select("id, action, entity_type, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen px-6 py-6">
      <TopNav />

      <h1 className="mb-2 text-xl font-semibold text-brand-700">
        Activity log
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        A permanent record of every edit, void, and archive. Nothing here
        can be changed or deleted, by anyone.
      </p>

      {(!entries || entries.length === 0) && (
        <p className="text-sm text-gray-500">No activity recorded yet.</p>
      )}

      <div className="space-y-2">
        {entries?.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl border border-gray-200 p-3 text-sm"
          >
            <p className="font-medium text-gray-900">
              {ACTION_LABELS[entry.action] ?? entry.action}
            </p>
            <p className="text-gray-500">
              {new Date(entry.created_at).toLocaleString("en-NG")}
            </p>
            {entry.reason && (
              <p className="mt-1 text-gray-700">Reason: {entry.reason}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
      }
