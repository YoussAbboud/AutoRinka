"use client";

import Link from "next/link";
import { useState } from "react";
import { type Listing, LISTINGS, fmtKm, fmtPrice, monthly, stripe } from "@/lib/listings";

const BADGE_COLORS: Record<string, string> = {
  "Great Price": "#2BB673",
  "Low Mileage": "#405FF2",
};

const ANGLES = ["front 3/4", "side profile", "rear 3/4", "interior dash", "seats", "engine bay"];
const PRIVATE_SELLERS = ["Tomas K.", "Rūta B.", "Mindaugas P.", "Eglė S."];

export function ListingDetail({ listing: l }: { listing: Listing }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [phoneShown, setPhoneShown] = useState(false);

  const sellerName = l.tier === "featured" ? "Baltic Auto Group" : PRIVATE_SELLERS[l.id % 4];
  const sellerInitials = sellerName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  const sellerBadge = l.tier === "featured" ? "DEALER" : l.tier === "plus" ? "VERIFIED" : null;

  const specs: Array<[string, string | number]> = [
    ["Make", l.make],
    ["Model", l.model],
    ["Year", l.year],
    ["Mileage", fmtKm(l.km)],
    ["Fuel", l.fuel],
    ["Gearbox", l.gearbox],
    ["Drivetrain", l.drive],
    ["Body type", l.body],
    ["Power", `${l.kw} kW`],
    ["Color", l.color],
    ["Euro class", "Euro 6"],
    ["TA valid until", l.ta],
  ];

  const similar = LISTINGS.filter((x) => x.id !== l.id && (x.body === l.body || x.make === l.make)).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1200px] px-10 pb-20 pt-7">
      <div className="mb-[18px] text-[13px] font-semibold text-muted">
        <Link href="/browse" className="text-muted">
          Browse
        </Link>{" "}
        <span className="opacity-50">/</span> {l.make} {l.model} {l.year}
      </div>
      <div className="grid grid-cols-[1.6fr_1fr] items-start gap-9">
        {/* Left: gallery + specs + description */}
        <div>
          <div className="relative h-[420px] rounded-2xl" style={{ background: stripe(l.id + photoIdx) }}>
            <span className="absolute bottom-3 left-4 font-mono text-[11px] text-[#7A8494]">
              photo {photoIdx + 1}/6: {l.make} {l.model}, {ANGLES[photoIdx]}
            </span>
            {l.badge && (
              <span
                className="absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-bold text-white"
                style={{ background: BADGE_COLORS[l.badge] }}
              >
                {l.badge}
              </span>
            )}
          </div>
          <div className="mt-2.5 grid grid-cols-6 gap-2.5">
            {ANGLES.map((angle, i) => (
              <button
                key={angle}
                type="button"
                aria-label={`Photo ${i + 1}: ${angle}`}
                onClick={() => setPhotoIdx(i)}
                className={`box-border block h-16 cursor-pointer rounded-[10px] ${
                  i === photoIdx ? "border-2 border-accent" : "border border-line"
                }`}
                style={{ background: stripe(l.id + i) }}
              />
            ))}
          </div>
          <h2 className="mb-4 mt-[38px] text-xl font-extrabold tracking-[-0.4px]">Specifications</h2>
          <div className="grid grid-cols-2 gap-x-10 rounded-[14px] border border-hairline px-6 py-2">
            {specs.map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between border-b border-[#F3F5F8] py-[11px] text-[13.5px]"
              >
                <span className="font-semibold text-muted">{k}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
          <h2 className="mb-3 mt-[38px] text-xl font-extrabold tracking-[-0.4px]">Description</h2>
          <p className="text-[14.5px] leading-[1.7] text-[#3A4048]">
            Well maintained {l.make} {l.model} in {l.color.toLowerCase()}, full service history at an
            authorized dealer. Second owner, garage kept, no accidents. All maintenance done on schedule —
            recent brake pads and fresh oil service. TA valid until {l.ta}. Located in {l.city}, viewings
            welcome any day after 17:00.
          </p>
          <h2 className="mb-3.5 mt-[38px] text-xl font-extrabold tracking-[-0.4px]">Options</h2>
          <div className="flex flex-wrap gap-2.5">
            {l.options.map((o) => (
              <span
                key={o}
                className="rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-[#3A4048]"
              >
                ✓ {o}
              </span>
            ))}
          </div>
        </div>

        {/* Right: price + seller */}
        <aside className="sticky top-[92px] flex flex-col gap-[18px]">
          <div className="rounded-2xl border border-line p-[26px]">
            <div className="mb-0.5 text-[14.5px] font-bold text-muted">{l.trim}</div>
            <h1 className="mb-3.5 text-[26px] font-extrabold tracking-[-0.6px]">
              {l.make} {l.model} – {l.year}
            </h1>
            <div className="mb-1 flex items-baseline gap-2.5">
              {l.oldPrice && (
                <span className="text-[15px] text-[#9AA1AC] line-through">{fmtPrice(l.oldPrice)}</span>
              )}
              <span className="text-[32px] font-extrabold tracking-[-0.8px]">{fmtPrice(l.price)}</span>
            </div>
            <div className="mb-5 text-[12.5px] font-semibold text-muted">
              est. €{monthly(l.price)} /mo financing · negotiable
            </div>
            <div className="flex flex-col gap-2.5">
              <Link
                href={`/messages?listing=${l.id}`}
                className="block rounded-xl bg-accent py-3.5 text-center text-[14.5px] font-bold text-white transition-colors hover:bg-accent-deep"
              >
                Message Seller
              </Link>
              <button
                type="button"
                onClick={() => setPhoneShown(true)}
                className="block cursor-pointer rounded-xl border-[1.5px] border-ink py-[13px] text-center text-[14.5px] font-bold"
              >
                {phoneShown ? "+370 612 34 567" : "Show Phone Number"}
              </button>
              {l.vin && (
                <a
                  href={`https://autoistorija.lt/?vin=${l.vin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-[#CBE8D4] bg-[#EAF6EE] py-3 text-center text-[13px] font-bold text-[#1D7A4F] transition-colors hover:bg-[#DFF2E6]"
                >
                  ✓ VIN verified — check vehicle history ↗
                </a>
              )}
              <button
                type="button"
                onClick={() => setSaved(!saved)}
                className={`block cursor-pointer py-1.5 text-center text-[13.5px] font-bold ${
                  saved ? "text-accent" : "text-muted"
                }`}
              >
                {saved ? "♥ Saved" : "♡ Save listing"}
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-line p-[22px]">
            <div className="mb-3.5 flex items-center gap-3.5">
              <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-panel-blue text-[17px] font-extrabold text-accent">
                {sellerInitials}
              </span>
              <div>
                <div className="text-[15px] font-extrabold">
                  {sellerName}{" "}
                  {sellerBadge && (
                    <span className="rounded-full bg-panel-blue px-[9px] py-[3px] align-[2px] text-[10.5px] font-extrabold text-accent">
                      {sellerBadge}
                    </span>
                  )}
                </div>
                <div className="text-[12.5px] font-semibold text-muted">
                  ★ {(4.5 + (l.id % 5) / 10).toFixed(1)} · member since {2019 + (l.id % 5)}
                </div>
              </div>
            </div>
            <div className="text-[13px] font-semibold leading-[1.6] text-muted">
              📍 {l.city} · TA valid until {l.ta} · responds within a few hours
            </div>
          </div>
          <div className="rounded-[14px] border border-hairline bg-[#FAFBFC] px-5 py-4 text-[12.5px] leading-[1.6] text-muted">
            Safety tip: meet in a public place, verify VIN and TA documents before paying. AutoRinka never
            asks for payment outside the platform.
          </div>
        </aside>
      </div>

      {/* Similar */}
      <h2 className="mb-5 mt-14 text-[22px] font-extrabold tracking-[-0.5px]">Similar listings</h2>
      <div className="grid grid-cols-4 gap-[22px]">
        {similar.map((x) => (
          <Link
            key={x.id}
            href={`/listing/${x.id}`}
            className="block overflow-hidden rounded-2xl border border-line transition-shadow hover:shadow-[0_14px_34px_rgba(5,11,32,.10)]"
          >
            <div className="relative h-[130px]" style={{ background: stripe(x.id) }}>
              <span className="absolute bottom-1.5 left-2.5 font-mono text-[10px] text-[#7A8494]">
                {x.make} {x.model}
              </span>
            </div>
            <div className="px-4 pb-4 pt-3.5">
              <div className="mb-0.5 text-[14.5px] font-bold">
                {x.make} {x.model} – {x.year}
              </div>
              <div className="mb-2.5 text-xs text-muted">
                {fmtKm(x.km)} · {x.fuel} · {x.city}
              </div>
              <div className="text-base font-extrabold">{fmtPrice(x.price)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
