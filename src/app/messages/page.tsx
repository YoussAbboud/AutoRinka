import { Suspense } from "react";
import type { Metadata } from "next";
import { MessagesClient } from "@/components/messages-client";

export const metadata: Metadata = {
  title: "Messages — AutoRinka",
  description: "Chat with buyers and sellers about your listings.",
};

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesClient />
    </Suspense>
  );
}
