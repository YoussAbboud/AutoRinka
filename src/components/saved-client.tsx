"use client";

import Link from "next/link";
import { useState } from "react";
import { fmtKm, fmtPrice, getListing, stripe } from "@/lib/listings";

const SAVED_IDS = [1, 3, 6, 11, 18, 23];

export function SavedClient() {
  const [removed, setRemoved] = useState<number[]>([]);
  const listings = SAVED_IDS.filter((id) => !removed.includes(id))
    .map((id) => getListing(id))
    .filter((l) => l !== undefined);

  return (
    <div className="mx-auto max-w-[1160px] px-10 pb-20 pt-10">
      <h1 className="mb-1 text-[28px] font-extrabold tracking-[-0.7px]">Saved listings</h1>
      <p className="mb-7 text-[13.5px] font-semibold text-muted">
        {listings.length} cars · we&apos;ll notify you if a price drops
      </p>
      <div className="grid grid-cols-3 gap-[22px]">
        {listings.map((l) => (
          <div key={l.id} className="overflow-hidden rounded-2xl border border-line bg-white">
            <Link
              href={`/listing/${l.id}`}
              className="relative block h-[150px]"
              style={{ background: stripe(l.id) }}
            >
              <span className="absolute bottom-2 left-3 font-mono text-[10.5px] text-[#7A8494]">
                photo: {l.make} {l.model}
              </span>
              {l.oldPrice && (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-badge-green px-3 py-[5px] text-[11px] font-extrabold text-white">
                  Price dropped
                </span>
              )}
            </Link>
            <div className="px-[18px] pb-[18px] pt-4">
              <Link href={`/listing/${l.id}`} className="mb-0.5 block text-[15.5px] font-extrabold">
                {l.make} {l.model} – {l.year}
              </Link>
              <div className="mb-3 text-[12.5px] font-semibold text-muted">
                {fmtKm(l.km)} · {l.fuel} · {l.city}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[17px] font-extrabold">{fmtPrice(l.price)}</span>
                <button
                  type="button"
                  onClick={() => setRemoved([...removed, l.id])}
                  className="cursor-pointer text-[12.5px] font-bold text-[#B4232A]"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {listings.length === 0 && (
        <div className="py-[70px] text-center text-muted">
          <div className="mb-1.5 text-[17px] font-extrabold text-ink">No saved cars</div>
          <Link
            href="/browse"
            className="mt-2.5 inline-block rounded-[10px] bg-accent px-[22px] py-[11px] text-[13.5px] font-bold text-white transition-colors hover:bg-accent-deep"
          >
            Browse cars
          </Link>
        </div>
      )}
    </div>
  );
}
