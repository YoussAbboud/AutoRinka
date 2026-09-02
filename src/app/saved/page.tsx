import type { Metadata } from "next";
import { InnerHeader } from "@/components/inner-header";
import { SavedClient } from "@/components/saved-client";

export const metadata: Metadata = {
  title: "Saved listings — AutoRinka",
  description: "Your bookmarked cars, with price-drop alerts.",
};

export default function SavedPage() {
  return (
    <>
      <InnerHeader right="avatar" />
      <SavedClient />
    </>
  );
}
