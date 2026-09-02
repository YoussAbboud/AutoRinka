import { Suspense } from "react";
import type { Metadata } from "next";
import { InnerHeader } from "@/components/inner-header";
import { BrowseClient } from "@/components/browse-client";

export const metadata: Metadata = {
  title: "Browse Cars — AutoRinka",
  description: "Browse verified car listings across Lithuania with live filters.",
};

export default function BrowsePage() {
  return (
    <>
      <InnerHeader active="Browse" right="locale-sell" sticky />
      <Suspense>
        <BrowseClient />
      </Suspense>
    </>
  );
}
