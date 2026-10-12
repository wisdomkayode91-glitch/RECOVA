import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function getInvoiceState(
  outstanding: number,
  amountPaid: number,
  dueDate: string | null,
  voidedAt: string | null
) {
  if (voidedAt) return { label: "Voided", color: "text-gray-400" };

  const isPaid = outstanding <= 0;
  if (isPaid) return { label: "Paid", color: "text-green-700" };

  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;
  if (isOverdue)
    return {
      label: `Overdue — ${formatNaira(outstanding)} left`,
      color: "text-red-700",
    };

  if (amountPaid > 0)
    return {
      label: `Partial — ${formatNaira(outstanding)} left`,
      color: "text-yellow-700",
    };
  
