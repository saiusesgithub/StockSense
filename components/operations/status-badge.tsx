type Status = "DRAFT" | "WAITING" | "READY" | "DONE" | "CANCELED";

const styles: Record<Status, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  WAITING: "bg-amber-50 text-amber-700",
  READY: "bg-blue-50 text-blue-700",
  DONE: "bg-emerald-50 text-emerald-700",
  CANCELED: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  const style = styles[status as Status] ?? styles.DRAFT;
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>{status}</span>;
}
