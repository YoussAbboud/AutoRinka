import type { Metadata } from "next";
import { InnerHeader } from "@/components/inner-header";
import { SellWizard } from "@/components/sell-wizard";

export const metadata: Metadata = {
  title: "Sell your car — AutoRinka",
  description: "List your car in five quick steps. VIN auto-fill, photos, and one fair fee.",
};

export default function SellPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <InnerHeader active="Sell" right="autosave" />
      <SellWizard />
    </div>
  );
}
