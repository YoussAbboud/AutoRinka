"use client";

import Link from "next/link";
import { useState } from "react";
import { LISTINGS, fmtPrice, stripe } from "@/lib/listings";

type Status = "Active" | "Pending" | "Expired" | "Sold";

const MINE: Array<{ idx: number; status: Status }> = [
  { idx: 0, status: "Active" },
  { idx: 4, status: "Active" },
  { idx: 9, status: "Active" },
  { idx: 17, status: "Pending" },
  { idx: 14, status: "Expired" },
  { idx: 7, status: "Sold" },
];

const PILLS: Record<Status, [string, string]> = {
  Active: ["#E6F7EF", "#1D7A4F"],
  Pending: ["#FFF4E0", "#B45309"],
  Expired: ["#F3F5F8", "#50565E"],
  Sold: ["#E9F2FF", "#1B2B6B"],
};

const ACTIONS: Record<Status, string> = {
  Active: "Bump ↑",
  Pending: "View status",
  Expired: "Reactivate",
  Sold: "Relist",
};

const STAR_HINTS = [
  "",
  "Poor — tell us what went wrong",
  "Below expectations",
  "Okay",
  "Good experience",
  "Excellent — thanks!",
];

const REVIEW_TAGS = [
  "Sold quickly",
  "Fair listing fee",
  "Serious buyers",
  "Easy to create listing",
  "Too many lowball offers",
  "Slow to get views",
];

const STATS = [
  { k: "ACTIVE LISTINGS", v: "3", d: "of 10 included" },
  { k: "VIEWS (30 D)", v: "1 482", d: "▲ 12% vs last month" },
  { k: "SAVES", v: "57", d: "▲ 9%" },
  { k: "NEW MESSAGES", v: "8", d: "3 unread" },
];

const BILLING = [
  { date: "2026-08-04", what: "Premium monthly", amt: "€24.99" },
  { date: "2026-07-04", what: "Premium monthly", amt: "€24.99" },
  { date: "2026-06-18", what: "Bump — BMW 530d", amt: "€2.99" },
  { date: "2026-06-04", what: "Premium monthly", amt: "€24.99" },
];

interface Review {
  stars: number;
  tags: string[];
  text: string;
}

interface Modal {
  open: boolean;
  id: number | null;
  car: string;
  stars: number;
  tags: string[];
  text: string;
}

export function DashboardClient() {
  const [tab, setTab] = useState<Status>("Active");
  const [bumped, setBumped] = useState<number[]>([]);
  const [reviews, setReviews] = useState<Record<number, Review>>({});
  const [modal, setModal] = useState<Modal>({ open: false, id: null, car: "", stars: 0, tags: [], text: "" });

  const mine = MINE.map((m) => ({ l: LISTINGS[m.idx], status: m.status }));
  const rows = mine.filter((m) => m.status === tab);

  const submitReview = () => {
    if (!modal.stars || modal.id === null) return;
    setReviews({ ...reviews, [modal.id]: { stars: modal.stars, tags: modal.tags, text: modal.text } });
    setModal({ ...modal, open: false });
  };

  return (
    <div className="mx-auto max-w-[1160px] px-10 pb-20 pt-9">
      <div className="mb-[26px] flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-[28px] font-extrabold tracking-[-0.7px]">Seller Dashboard</h1>
          <div className="text-[13.5px] font-semibold text-muted">
            Premium plan · renews 2026-09-04 · 3 of 5 bumps left this month
          </div>
        </div>
        <Link
          href="/sell"
          className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-deep"
        >
          + New listing
        </Link>
      </div>

      <div className="mb-[30px] grid grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.k} className="rounded-[14px] border border-line bg-white px-[22px] py-5">
            <div className="mb-1.5 text-xs font-bold text-muted">{s.k}</div>
            <div className="text-[26px] font-extrabold tracking-[-0.6px]">{s.v}</div>
            <div className="mt-0.5 text-xs font-bold text-badge-green">{s.d}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] items-start gap-6">
        {/* Listings table */}
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex gap-1 border-b border-hairline px-[18px] py-3.5">
            {(["Active", "Pending", "Expired", "Sold"] as const).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setTab(label)}
                className={`cursor-pointer rounded-full px-4 py-2 text-[13px] font-bold ${
                  tab === label ? "bg-ink text-white" : "text-muted"
                }`}
              >
                {label} ({mine.filter((m) => m.status === label).length})
              </button>
            ))}
          </div>
          {rows.map((m, i) => {
            const isBumped = bumped.includes(m.l.id) && m.status === "Active";
            const review = reviews[m.l.id];
            const canReview = m.status === "Sold" || m.status === "Expired";
            return (
              <div
                key={m.l.id}
                className="flex items-center gap-4 border-b border-[#F3F5F8] px-5 py-4"
              >
                <span
                  className="h-[52px] w-[76px] shrink-0 rounded-[10px]"
                  style={{ background: stripe(m.l.id) }}
                />
                <div className="min-w-0 flex-1">
                  <Link href={`/listing/${m.l.id}`} className="text-[14.5px] font-extrabold">
                    {m.l.make} {m.l.model} – {m.l.year}
                  </Link>
                  <div className="text-xs font-semibold text-muted">
                    {fmtPrice(m.l.price)} · {m.l.city} · expires 2026-09-1{i}
                  </div>
                </div>
                <div className="w-[110px] shrink-0 text-right text-xs font-semibold text-muted">
                  <div className="text-sm font-extrabold text-ink">{m.l.views} views</div>
                  {m.l.saves} saves · {1 + (m.l.id % 4)} msgs
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-[5px] text-[11px] font-extrabold"
                  style={{ background: PILLS[m.status][0], color: PILLS[m.status][1] }}
                >
                  {isBumped ? "Bumped" : m.status.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => m.status === "Active" && setBumped([...bumped, m.l.id])}
                  className="shrink-0 cursor-pointer text-[12.5px] font-bold text-accent"
                >
                  {isBumped ? "✓ Bumped to top" : ACTIONS[m.status]}
                </button>
                {canReview && (
                  <button
                    type="button"
                    onClick={() =>
                      !review &&
                      setModal({
                        open: true,
                        id: m.l.id,
                        car: `${m.l.make} ${m.l.model} – ${m.l.year}`,
                        stars: 0,
                        tags: [],
                        text: "",
                      })
                    }
                    className="shrink-0 cursor-pointer text-[12.5px] font-bold"
                    style={{ color: review ? "#2BB673" : "#B45309" }}
                  >
                    {review ? `✓ Rated ${review.stars}★` : "Rate experience"}
                  </button>
                )}
              </div>
            );
          })}
          {rows.length === 0 && (
            <div className="p-11 text-center text-[13.5px] font-semibold text-muted">Nothing here yet.</div>
          )}
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-[18px]">
          <div className="rounded-2xl bg-ink p-6 text-white">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-extrabold">Premium</span>
              <span className="rounded-full bg-white/14 px-2.5 py-1 text-[10.5px] font-extrabold">ACTIVE</span>
            </div>
            <div className="mb-4 text-[12.5px] leading-[1.7] text-white/70">
              €24.99/mo · 10 included listings (4 used)
              <br />5 bumps/mo (3 left) · analytics · verified badge
            </div>
            <div className="flex gap-2.5">
              <Link
                href="/pricing"
                className="flex-1 rounded-[10px] bg-white py-2.5 text-center text-[12.5px] font-bold text-ink transition-opacity hover:opacity-90"
              >
                Upgrade to Dealer
              </Link>
              <button
                type="button"
                className="flex-1 cursor-pointer rounded-[10px] border border-white/35 py-2.5 text-center text-[12.5px] font-bold"
              >
                Manage
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-[22px]">
            <div className="mb-3.5 text-sm font-extrabold">Billing history</div>
            {BILLING.map((b) => (
              <div
                key={`${b.date}-${b.what}`}
                className="flex justify-between border-b border-[#F3F5F8] py-[9px] text-[12.5px] font-semibold"
              >
                <span className="text-muted">
                  {b.date} · {b.what}
                </span>
                <span className="font-extrabold">{b.amt}</span>
              </div>
            ))}
            <button
              type="button"
              className="mt-3 inline-block cursor-pointer text-[12.5px] font-bold text-accent"
            >
              Open Stripe customer portal ↗
            </button>
          </div>
          <Link
            href="/saved"
            className="block rounded-2xl border border-line bg-white px-[22px] py-[18px] text-[13.5px] font-bold"
          >
            ♡ Saved listings <span className="font-semibold text-muted">(6)</span> →
          </Link>
        </div>
      </div>

      {/* Review modal */}
      {modal.open && (
        <div
          onClick={() => setModal({ ...modal, open: false })}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(5,11,32,.55)]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[470px] max-w-[92vw] rounded-[18px] bg-white p-[30px] shadow-[0_30px_70px_rgba(5,11,32,.3)]"
          >
            <h2 className="mb-1 text-xl font-extrabold tracking-[-0.4px]">How did this listing go?</h2>
            <div className="mb-5 text-[13px] font-semibold text-muted">
              {modal.car} · your feedback improves the marketplace
            </div>
            <div className="mb-1.5 flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} stars`}
                  onClick={() => setModal({ ...modal, stars: n })}
                  className="cursor-pointer text-3xl leading-none"
                  style={{ color: n <= modal.stars ? "#F59E0B" : "#E1E4EB" }}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="mb-[18px] min-h-[15px] text-xs font-bold text-muted">
              {STAR_HINTS[modal.stars]}
            </div>
            <div className="mb-[18px] flex flex-wrap gap-2">
              {REVIEW_TAGS.map((label) => {
                const on = modal.tags.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setModal({
                        ...modal,
                        tags: on ? modal.tags.filter((x) => x !== label) : [...modal.tags, label],
                      })
                    }
                    className={`cursor-pointer rounded-full px-3.5 py-[7px] text-[12.5px] font-semibold ${
                      on
                        ? "border-[1.5px] border-accent bg-panel-blue text-accent"
                        : "border border-line bg-white text-[#3A4048]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <textarea
              value={modal.text}
              onChange={(e) => setModal({ ...modal, text: e.target.value })}
              placeholder="Anything else? (optional)"
              className="mb-[18px] box-border min-h-[70px] w-full resize-y rounded-[10px] border border-line px-3 py-[11px] font-sans text-[13.5px] outline-none"
            />
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModal({ ...modal, open: false })}
                className="cursor-pointer rounded-[10px] border-[1.5px] border-[#C6CBD4] px-5 py-[11px] text-[13.5px] font-bold text-muted"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={submitReview}
                className="cursor-pointer rounded-[10px] px-6 py-3 text-[13.5px] font-bold text-white"
                style={{ background: modal.stars ? "#405FF2" : "#C6CBD4" }}
              >
                Submit review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
