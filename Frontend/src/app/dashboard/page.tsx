import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";

const DashboardView = dynamic(
  () => import("@/components/dashboard/dashboard-view"),
  {
    loading: () => (
      <div className="app-loading"><span className="spinner" /> Menyiapkan dashboard…</div>
    ),
  },
);

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <DashboardView />;
}
