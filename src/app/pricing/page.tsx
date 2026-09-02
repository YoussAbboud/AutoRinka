import type { Metadata } from "next";
import { InnerHeader } from "@/components/inner-header";
import { PricingClient } from "@/components/pricing-client";

export const metadata: Metadata = {
  title: "Pricing — AutoRinka",
  description: "Pay per listing, or subscribe and never pay a listing fee again.",
};

export default function PricingPage() {
  return (
    <>
      <InnerHeader active="Pricing" />
      <PricingClient />
    </>
  );
}
