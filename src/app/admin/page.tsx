import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin/admin-console";

export const metadata: Metadata = {
  title: "Admin Console — AutoRinka",
  description: "Moderate listings, manage users, and track marketplace analytics.",
};

export default function AdminPage() {
  return <AdminConsole />;
}
