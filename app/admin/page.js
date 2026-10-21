export const instant = false;
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = {
  title: "Admin Dashboard | EthioTourism",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  // Prevent prerendering before checking the session.
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="section container">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name || user.email}.</p>

      <AdminDashboard />
    </main>
  );
}
