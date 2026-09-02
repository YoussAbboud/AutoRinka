import type { Metadata } from "next";
import { InnerHeader } from "@/components/inner-header";
import { DashboardClient } from "@/components/dashboard-client";

export const metadata: Metadata = {
  title: "Seller Dashboard — AutoRinka",
  description: "Manage your listings, stats, subscription and billing.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <InnerHeader active="Dashboard" right="user-avatar" />
      <DashboardClient />
    </div>
  );
}
