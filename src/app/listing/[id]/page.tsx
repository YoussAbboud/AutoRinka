import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InnerHeader } from "@/components/inner-header";
import { ListingDetail } from "@/components/listing-detail";
import { LISTINGS, fmtPrice, getListing } from "@/lib/listings";

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ id: String(l.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const l = getListing(id);
  if (!l) return { title: "Listing not found — AutoRinka" };
  return {
    title: `${l.make} ${l.model} ${l.year}, ${l.city} — ${fmtPrice(l.price)} | AutoRinka`,
    description: `${l.trim} · ${l.fuel} · ${l.gearbox} · ${l.city}. Verified listing on AutoRinka.`,
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();
  return (
    <>
      <InnerHeader sticky />
      <ListingDetail listing={listing} />
    </>
  );
}
