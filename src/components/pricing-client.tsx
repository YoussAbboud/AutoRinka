"use client";

import Link from "next/link";
import { useState } from "react";

const COMPARISON_ROWS = [
  { k: "Live duration", a: "30 days", b: "30 days", c: "30 days" },
  { k: "Highlighted card styling", a: "—", b: "✓", c: "✓" },
  { k: "Bumps to top included", a: "—", b: "1", c: "3" },
  { k: "Homepage Featured carousel", a: "—", b: "—", c: "✓" },
  { k: "Renewable after expiry", a: "✓", b: "✓", c: "✓" },
];

export function PricingClient() {
  const [yearly, setYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "€0",
      per: "",
      note: "Pay per listing",
      dark: false,
      highlight: false,
      tag: null,
      features: [
        "Unlimited browsing & saved cars",
        "In-app chat with sellers",
        "List a car with a one-time fee",
        "Saved searches with email alerts",
      ],
      cta: "Start free",
      href: "/browse",
      btn: "border-[1.5px] border-ink bg-white text-ink",
    },
    {
      name: "Premium",
      price: yearly ? "€249" : "€24.99",
      per: yearly ? "/yr" : "/mo",
      note: "For active private sellers",
      dark: false,
      highlight: true,
      tag: "MOST POPULAR",
      features: [
        "10 active listings — no listing fees",
        "Plus-level highlighted styling",
        "5 bumps to top per month",
        "Analytics: views, saves, CTR",
        "Verified badge · priority support",
      ],
      cta: "Subscribe",
      href: "/dashboard",
      btn: "bg-accent text-white",
    },
    {
      name: "Dealer",
      price: yearly ? "€799" : "€79.99",
      per: yearly ? "/yr" : "/mo",
      note: "For dealerships",
      dark: true,
      highlight: false,
      tag: null,
      features: [
        "Unlimited listings — no fees",
        "Featured-level styling on all cars",
        "30 bumps per month",
        "Analytics + CSV export",
        "Dealer storefront page & badge",
        "Priority support",
      ],
      cta: "Subscribe as Dealer",
      href: "/dashboard",
      btn: "bg-white text-ink",
    },
  ];

  return (
    <div className="mx-auto max-w-[1080px] px-10 pb-[90px] pt-14">
      <div className="mb-11 text-center">
        <h1 className="mb-2.5 text-4xl font-extrabold tracking-[-0.9px]">Simple, fair pricing</h1>
        <p className="mb-[26px] text-[15px] text-muted">
          Pay per listing, or subscribe and never pay a listing fee again.
        </p>
        <div className="inline-flex rounded-full bg-[#F3F5F8] p-[5px]">
          {(
            [
              ["Monthly", false],
              ["Yearly · 2 months free", true],
            ] as const
          ).map(([label, val]) => (
            <button
              key={label}
              type="button"
              onClick={() => setYearly(val)}
              className={`cursor-pointer rounded-full px-[22px] py-[9px] text-[13.5px] font-bold ${
                yearly === val ? "bg-white text-ink shadow-[0_2px_8px_rgba(5,11,32,.10)]" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-[60px] grid grid-cols-3 items-stretch gap-5">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-[18px] px-[30px] py-8 ${
              p.dark
                ? "border border-ink bg-ink text-white"
                : p.highlight
                  ? "border-2 border-accent bg-white"
                  : "border border-line bg-white"
            }`}
          >
            {p.tag && (
              <span className="absolute -top-[11px] left-7 rounded-full bg-accent px-3 py-1 text-[10.5px] font-extrabold tracking-[.4px] text-white">
                {p.tag}
              </span>
            )}
            <div className="mb-1.5 text-base font-extrabold">{p.name}</div>
            <div className="mb-1 flex items-baseline gap-1.5">
              <span className="text-[34px] font-extrabold tracking-[-1px]">{p.price}</span>
              <span className={`text-[13px] font-semibold ${p.dark ? "text-white/60" : "text-muted"}`}>
                {p.per}
              </span>
            </div>
            <div
              className={`mb-[22px] min-h-[18px] text-[12.5px] font-semibold ${
                p.dark ? "text-white/60" : "text-muted"
              }`}
            >
              {p.note}
            </div>
            <div className="mb-[26px] flex flex-1 flex-col gap-[11px]">
              {p.features.map((ft) => (
                <div
                  key={ft}
                  className={`flex gap-2.5 text-[13.5px] font-semibold leading-[1.45] ${
                    p.dark ? "text-white/85" : "text-[#3A4048]"
                  }`}
                >
                  <span className="font-extrabold text-badge-green">✓</span>
                  {ft}
                </div>
              ))}
            </div>
            <Link
              href={p.href}
              className={`block rounded-xl py-[13px] text-center text-sm font-bold transition-opacity hover:opacity-90 ${p.btn}`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>

      <h2 className="mb-1.5 text-[22px] font-extrabold tracking-[-0.5px]">Pay-per-listing packages</h2>
      <p className="mb-[22px] text-sm text-muted">
        No subscription? Pick a package each time you list. One-time payment, live for 30 days.
      </p>
      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-hairline bg-[#FAFBFC] text-[12.5px] font-extrabold text-muted">
          <span className="px-6 py-3.5" />
          <span className="px-2.5 py-3.5 text-center">STANDARD — €9.99</span>
          <span className="px-2.5 py-3.5 text-center text-accent">PLUS — €19.99</span>
          <span className="px-2.5 py-3.5 text-center">FEATURED — €34.99</span>
        </div>
        {COMPARISON_ROWS.map((r) => (
          <div
            key={r.k}
            className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-[#F3F5F8] text-[13.5px] font-semibold"
          >
            <span className="px-6 py-[13px] text-muted">{r.k}</span>
            <span className="px-2.5 py-[13px] text-center">{r.a}</span>
            <span className="bg-[#FAFBFF] px-2.5 py-[13px] text-center">{r.b}</span>
            <span className="px-2.5 py-[13px] text-center">{r.c}</span>
          </div>
        ))}
      </div>
      <div className="mt-[26px] rounded-[14px] bg-[#FAFBFC] px-6 py-[18px] text-[13px] leading-[1.7] text-muted">
        Bump to top any listing for <b>€2.99</b>, or use your subscription&apos;s included bumps. Expired
        listings can be reactivated by paying again. All payments processed by Stripe; manage or cancel
        subscriptions any time from your dashboard.
      </div>
    </div>
  );
}
