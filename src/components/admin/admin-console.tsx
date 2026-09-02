"use client";

import Link from "next/link";
import { useState } from "react";
import { type Listing, LISTINGS, fmtPrice, stripe } from "@/lib/listings";
import { GlobeModal } from "./admin-globe";

const NAV = ["Overview", "Listings", "Users", "Moderation", "Pricing"] as const;
type View = (typeof NAV)[number];

const USERS = [
  { name: "Tomas K.", email: "tomas.k@gmail.com", plan: "Premium", listings: 4, joined: "2023-05", verified: true },
  { name: "Baltic Auto Group", email: "info@balticauto.lt", plan: "Dealer", listings: 38, joined: "2022-01", verified: true },
  { name: "Rūta B.", email: "ruta.b@inbox.lt", plan: "Free", listings: 1, joined: "2025-11", verified: true },
  { name: "UAB Autolygis", email: "sales@autolygis.lt", plan: "Dealer", listings: 21, joined: "2023-09", verified: true },
  { name: "Mindaugas P.", email: "m.petrauskas@yahoo.com", plan: "Free", listings: 2, joined: "2024-06", verified: false },
  { name: "Eglė S.", email: "egle.s@gmail.com", plan: "Premium", listings: 3, joined: "2024-02", verified: true },
  { name: "Darius V.", email: "darius.v@mail.lt", plan: "Free", listings: 0, joined: "2026-07", verified: false },
  { name: "Autopartneris", email: "hello@autopartneris.lt", plan: "Dealer", listings: 12, joined: "2025-03", verified: true },
] as const;

const PENDING_IDX = [17, 12, 22, 5];
const MOD_SELLERS = ["Tomas K.", "Rūta B.", "UAB Autolygis", "Mindaugas P."];

const KPIS = [
  { k: "REVENUE (MTD)", v: "€4 312", d: "▲ 18% vs July", dc: "#2BB673" },
  { k: "ACTIVE LISTINGS", v: "1 236", d: "▲ 64 this week", dc: "#2BB673" },
  { k: "REGISTERED USERS", v: "9 841", d: "▲ 312 this month", dc: "#2BB673" },
  { k: "SUBSCRIBERS", v: "148", d: "112 Premium · 36 Dealer", dc: "#50565E" },
];

const TRAFFIC = [62, 58, 71, 66, 80, 92, 88, 74, 69, 83, 95, 100, 91, 86];

const REVENUE = [
  { k: "Subscriptions", v: "€2 486", w: "58%" },
  { k: "Listing fees", v: "€1 512", w: "35%" },
  { k: "Bumps", v: "€314", w: "7%" },
];

const TOP_MAKES: Array<[string, string]> = [
  ["BMW", "4 812"],
  ["Volkswagen", "4 205"],
  ["Audi", "3 688"],
  ["Toyota", "3 121"],
  ["Mercedes-Benz", "2 940"],
];

const BY_CITY: Array<[string, number, string]> = [
  ["Vilnius", 486, "100%"],
  ["Kaunas", 312, "64%"],
  ["Klaipėda", 188, "39%"],
  ["Šiauliai", 104, "21%"],
  ["Panevėžys", 82, "17%"],
];

const HEALTH = [
  { k: "Median time to sell", v: "18 days", c: "#050B20" },
  { k: "Listings → contact rate", v: "7.2%", c: "#050B20" },
  { k: "Pending review (median)", v: "1.4 h", c: "#2BB673" },
  { k: "Open reports", v: "2", c: "#B45309" },
  { k: "Payment failures (30d)", v: "0.4%", c: "#2BB673" },
];

const REVIEW_DIST: Array<[string, string]> = [
  ["5★", "68%"],
  ["4★", "21%"],
  ["3★", "7%"],
  ["2★", "3%"],
  ["1★", "1%"],
];

const RECENT_REVIEWS = [
  { stars: "★★★★★", text: "Sold in 9 days, three serious buyers. The bump was worth it.", who: "Eglė S. · sold Toyota Corolla" },
  { stars: "★★★★☆", text: "Listing took 5 minutes. Would like more photo slots on Standard.", who: "Mindaugas P. · sold Škoda Octavia" },
  { stars: "★★☆☆☆", text: "Few views outside Vilnius. Renewal fee feels high for a second month.", who: "Darius V. · listing expired, Opel Astra" },
];

const GA_PROPERTIES = [
  { name: "AutoRinka — autorinka.lt", meta: "GA4 · property 384201556 · 41k visits / 14d", full: "GA4 · AutoRinka — autorinka.lt (384201556)" },
  { name: "AutoRinka Staging — staging.autorinka.lt", meta: "GA4 · property 384209912", full: "GA4 · AutoRinka Staging — staging.autorinka.lt (384209912)" },
  { name: "AutoRinka App", meta: "GA4 · property 391004417 · iOS & Android", full: "GA4 · AutoRinka App (391004417)" },
];

const TIER_STYLES: Record<string, [string, string]> = {
  featured: ["#E9F2FF", "#1B2B6B"],
  plus: ["#EEF2FF", "#405FF2"],
  standard: ["#F3F5F8", "#50565E"],
};

const PLAN_STYLES: Record<string, [string, string]> = {
  Free: ["#F3F5F8", "#50565E"],
  Premium: ["#EEF2FF", "#405FF2"],
  Dealer: ["#050B20", "#fff"],
};

const REPORTS = [
  { id: "r1", reason: "SCAM", what: "Listing #1042 — asks for deposit via bank transfer before viewing" },
  { id: "r2", reason: "WRONG INFO", what: "Listing #987 — mileage reported as rolled back by 3 users" },
];

const TXNS = [
  { date: "Aug 16", what: "Featured listing", who: "Baltic Auto Group", amt: "€34.99" },
  { date: "Aug 16", what: "Premium monthly", who: "Eglė S.", amt: "€24.99" },
  { date: "Aug 15", what: "Bump", who: "Tomas K.", amt: "€2.99" },
  { date: "Aug 15", what: "Plus listing", who: "Rūta B.", amt: "€19.99" },
  { date: "Aug 14", what: "Dealer monthly", who: "UAB Autolygis", amt: "€79.99" },
  { date: "Aug 14", what: "Standard listing", who: "Mindaugas P.", amt: "€9.99" },
];

const sellerOf = (id: number) => USERS[id % 8].name;

export function AdminConsole() {
  const [view, setView] = useState<View>("Overview");
  const [decisions, setDecisions] = useState<Record<number, "approved" | "rejected" | "featured">>({});
  const [auto, setAuto] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prices, setPrices] = useState<Record<string, string>>({
    "Standard listing": "9.99",
    "Plus listing": "19.99",
    "Featured listing": "34.99",
    "Bump (one-off)": "2.99",
    "Premium /mo": "24.99",
    "Dealer /mo": "79.99",
  });
  const [listingQuery, setListingQuery] = useState("");
  const [listingStatus, setListingStatus] = useState("");
  const [suspended, setSuspended] = useState<number[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [userPlan, setUserPlan] = useState("");
  const [banned, setBanned] = useState<string[]>([]);
  const [reportOutcomes, setReportOutcomes] = useState<Record<string, string>>({});
  const [showGlobe, setShowGlobe] = useState(false);
  const [gaConnected, setGaConnected] = useState(false);
  const [gaModal, setGaModal] = useState(false);
  const [gaChoice, setGaChoice] = useState(0);

  const pending = PENDING_IDX.map((i) => LISTINGS[i]);
  const openCount = pending.filter((l) => !decisions[l.id]).length;

  const listingStatusOf = (l: Listing) =>
    suspended.includes(l.id)
      ? "Suspended"
      : pending.some((p) => p.id === l.id) && !decisions[l.id]
        ? "Pending"
        : "Active";

  const listingRows = LISTINGS.filter((l) => {
    const q = listingQuery.toLowerCase();
    return (
      (!q || `${l.make} ${l.model} ${l.city} ${sellerOf(l.id)}`.toLowerCase().includes(q)) &&
      (!listingStatus || listingStatusOf(l) === listingStatus)
    );
  });

  const userRows = USERS.filter((u) => {
    const q = userQuery.toLowerCase();
    return (!q || `${u.name} ${u.email}`.toLowerCase().includes(q)) && (!userPlan || u.plan === userPlan);
  });

  const searchCls =
    "flex-1 rounded-[10px] border border-line px-3.5 py-2.5 text-[13.5px] font-semibold outline-none";
  const filterCls =
    "rounded-[10px] border border-line bg-white px-3 py-2.5 text-[13px] font-bold outline-none";
  const pill = "rounded-full px-[9px] py-[3px] text-[10.5px] font-extrabold";

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      {/* Sidebar */}
      <aside className="flex w-[220px] shrink-0 flex-col bg-ink py-[22px] text-white">
        <Link href="/" className="mb-1.5 px-6 text-[19px] font-extrabold tracking-[-0.5px] text-white">
          Auto<span className="text-logo-accent">Rinka</span>
        </Link>
        <div className="mb-[22px] px-6 text-[10.5px] font-extrabold tracking-[1px] text-white/45">
          ADMIN CONSOLE
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setView(label)}
              className={`flex cursor-pointer items-center justify-between px-6 py-[11px] text-left text-[13.5px] font-bold ${
                view === label
                  ? "border-l-[3px] border-logo-accent bg-white/8 text-white"
                  : "border-l-[3px] border-transparent text-white/65"
              }`}
            >
              {label}
              {label === "Moderation" && openCount > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10.5px] font-extrabold text-white">
                  {openCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 px-6 py-4 text-xs font-semibold text-white/55">
          <Link href="/" className="text-white/75">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1 px-10 pb-20 pt-8">
        <div className="mb-[26px] flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-[-0.6px]">
            {view === "Overview" ? "Analytics Overview" : view}
          </h1>
          <span className="text-[12.5px] font-bold text-muted">
            admin@autorinka.lt · <span className="text-badge-green">● live data</span>
          </span>
        </div>

        {/* ===== OVERVIEW ===== */}
        {view === "Overview" && (
          <>
            <div className="mb-5 flex items-center gap-3.5 rounded-[14px] border border-line bg-white px-[22px] py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#F3F5F8] text-[17px] font-extrabold text-[#E37400]">
                G
              </span>
              {!gaConnected ? (
                <>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-extrabold">Google Analytics not linked</div>
                    <div className="text-xs font-semibold text-muted">
                      Link a GA4 property to pull visits, traffic sources and conversions into this
                      overview automatically.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGaModal(true)}
                    className="shrink-0 cursor-pointer rounded-[10px] bg-accent px-[18px] py-2.5 text-[12.5px] font-bold text-white"
                  >
                    Connect Google Analytics
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-extrabold">
                      Google Analytics linked{" "}
                      <span className="ml-1.5 rounded-full bg-[#E6F7EF] px-[9px] py-[3px] text-[10.5px] font-extrabold text-[#1D7A4F]">
                        SYNCING
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-muted">
                      {GA_PROPERTIES[gaChoice].full} · last sync 2 min ago · visits and locations on this
                      page now come from GA
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGaConnected(false)}
                    className="shrink-0 cursor-pointer text-[12.5px] font-bold text-[#B4232A]"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>

            <div className="mb-6 grid grid-cols-4 gap-4">
              {KPIS.map((k) => (
                <div key={k.k} className="rounded-[14px] border border-line bg-white px-[22px] py-5">
                  <div className="mb-1.5 text-xs font-bold text-muted">{k.k}</div>
                  <div className="text-[26px] font-extrabold tracking-[-0.6px]">{k.v}</div>
                  <div className="mt-0.5 text-xs font-bold" style={{ color: k.dc }}>
                    {k.d}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-5 grid grid-cols-[1.5fr_1fr] gap-5">
              {/* Traffic chart */}
              <button
                type="button"
                onClick={() => setShowGlobe(true)}
                className="cursor-pointer rounded-2xl border border-line bg-white p-6 text-left transition-shadow hover:shadow-[0_10px_28px_rgba(5,11,32,.08)]"
              >
                <div className="mb-[18px] flex items-baseline justify-between">
                  <span className="flex items-baseline gap-2.5 text-[15px] font-extrabold">
                    Visits — last 14 days{" "}
                    <span className="whitespace-nowrap text-xs font-bold text-accent">View on globe →</span>
                  </span>
                  <span className="text-xs font-bold text-muted">total 41 280 · ▲ 11%</span>
                </div>
                <div className="flex h-[140px] items-end gap-1.5">
                  {TRAFFIC.map((v, i) => (
                    <div
                      key={i}
                      title={`${2200 + v * 12} visits`}
                      className="flex h-full flex-1 flex-col justify-end"
                    >
                      <div
                        className="rounded-t-[5px]"
                        style={{ height: `${v}%`, background: i >= 12 ? "#405FF2" : "#C7D2F9" }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10.5px] font-bold text-[#9AA1AC]">
                  <span>Aug 3</span>
                  <span>Aug 10</span>
                  <span>Aug 16</span>
                </div>
              </button>
              {/* Revenue breakdown */}
              <div className="rounded-2xl border border-line bg-white p-6">
                <div className="mb-4 text-[15px] font-extrabold">Revenue — August</div>
                {REVENUE.map((r) => (
                  <div key={r.k} className="mb-3">
                    <div className="mb-1 flex justify-between text-[12.5px] font-bold">
                      <span className="text-muted">{r.k}</span>
                      <span>{r.v}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#F3F5F8]">
                      <div className="h-1.5 rounded-full bg-accent" style={{ width: r.w }} />
                    </div>
                  </div>
                ))}
                <div className="mt-3.5 flex justify-between border-t border-hairline pt-3 text-[13.5px] font-extrabold">
                  <span>Total MTD</span>
                  <span>€4 312</span>
                </div>
                <div className="mt-1 text-[11.5px] font-bold text-badge-green">
                  ▲ 18% vs July · MRR €4 570
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div className="rounded-2xl border border-line bg-white p-[22px]">
                <div className="mb-3.5 text-sm font-extrabold">Top searched makes</div>
                {TOP_MAKES.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between border-b border-[#F3F5F8] py-[7px] text-[13px] font-semibold"
                  >
                    <span>{k}</span>
                    <span className="text-muted">{v}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-line bg-white p-[22px]">
                <div className="mb-3.5 text-sm font-extrabold">Listings by city</div>
                {BY_CITY.map(([k, v, w]) => (
                  <div key={k} className="mb-[9px]">
                    <div className="mb-[3px] flex justify-between text-[12.5px] font-bold">
                      <span>{k}</span>
                      <span className="text-muted">{v}</span>
                    </div>
                    <div className="h-[5px] rounded-full bg-[#F3F5F8]">
                      <div className="h-[5px] rounded-full bg-logo-accent" style={{ width: w }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-line bg-white p-[22px]">
                <div className="mb-3.5 text-sm font-extrabold">Marketplace health</div>
                {HEALTH.map((h) => (
                  <div
                    key={h.k}
                    className="flex justify-between border-b border-[#F3F5F8] py-[7px] text-[13px] font-semibold"
                  >
                    <span className="text-muted">{h.k}</span>
                    <span className="font-extrabold" style={{ color: h.c }}>
                      {h.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Listing experience reviews */}
            <div className="mt-5 rounded-2xl border border-line bg-white p-6">
              <div className="mb-[18px] flex items-baseline justify-between">
                <span className="text-[15px] font-extrabold">Listing experience reviews</span>
                <span className="text-xs font-bold text-muted">
                  collected after a listing sells or expires · 312 this quarter
                </span>
              </div>
              <div className="grid grid-cols-[220px_1fr] items-start gap-8">
                <div>
                  <div className="text-4xl font-extrabold tracking-[-1px]">
                    4.6<span className="text-[15px] font-bold text-muted"> / 5</span>
                  </div>
                  <div className="mb-3.5 text-xs font-bold text-muted">average seller rating</div>
                  {REVIEW_DIST.map(([k, w]) => (
                    <div
                      key={k}
                      className="mb-1.5 flex items-center gap-2.5 text-[11.5px] font-bold text-muted"
                    >
                      <span className="w-[22px]">{k}</span>
                      <div className="h-[5px] flex-1 rounded-full bg-[#F3F5F8]">
                        <div className="h-[5px] rounded-full bg-[#F59E0B]" style={{ width: w }} />
                      </div>
                      <span className="w-8 text-right">{w}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {RECENT_REVIEWS.map((rv) => (
                    <div key={rv.who} className="rounded-xl border border-hairline px-[18px] py-4">
                      <div className="mb-2 text-[13px] tracking-[2px] text-[#F59E0B]">{rv.stars}</div>
                      <div className="mb-2.5 text-[13px] font-semibold leading-[1.55] text-[#3A4048]">
                        &quot;{rv.text}&quot;
                      </div>
                      <div className="text-[11.5px] font-bold text-muted">{rv.who}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== LISTINGS ===== */}
        {view === "Listings" && (
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
              <input
                value={listingQuery}
                onChange={(e) => setListingQuery(e.target.value)}
                placeholder="Search make, model, seller, city…"
                className={searchCls}
              />
              <select
                value={listingStatus}
                onChange={(e) => setListingStatus(e.target.value)}
                className={filterCls}
              >
                <option value="">All statuses</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>
            </div>
            <div className="grid grid-cols-[2.2fr_1fr_1fr_.9fr_.8fr_1.4fr] border-b border-hairline bg-[#FAFBFC] px-5 py-[11px] text-[11px] font-extrabold tracking-[.4px] text-muted">
              <span>LISTING</span>
              <span>SELLER</span>
              <span>PRICE</span>
              <span>VIEWS</span>
              <span>TIER</span>
              <span className="text-right">STATUS / ACTIONS</span>
            </div>
            {listingRows.slice(0, 12).map((l) => {
              const sus = suspended.includes(l.id);
              const st = listingStatusOf(l).toUpperCase();
              return (
                <div
                  key={l.id}
                  className="grid grid-cols-[2.2fr_1fr_1fr_.9fr_.8fr_1.4fr] items-center border-b border-[#F3F5F8] px-5 py-3 text-[13px] font-semibold"
                  style={{ opacity: sus ? 0.55 : 1 }}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-8 w-[46px] shrink-0 rounded-[7px]"
                      style={{ background: stripe(l.id) }}
                    />
                    <Link
                      href={`/listing/${l.id}`}
                      className="overflow-hidden text-ellipsis whitespace-nowrap font-extrabold"
                    >
                      {l.make} {l.model} – {l.year}
                    </Link>
                  </span>
                  <span className="text-muted">{sellerOf(l.id)}</span>
                  <span className="font-extrabold">{fmtPrice(l.price)}</span>
                  <span className="text-muted">{l.views}</span>
                  <span>
                    <span
                      className={pill}
                      style={{ background: TIER_STYLES[l.tier][0], color: TIER_STYLES[l.tier][1] }}
                    >
                      {l.tier.toUpperCase()}
                    </span>
                  </span>
                  <span className="flex items-center justify-end gap-3">
                    <span
                      className={pill}
                      style={{
                        background: sus ? "#FDECEC" : st === "PENDING" ? "#FFF4E0" : "#E6F7EF",
                        color: sus ? "#B4232A" : st === "PENDING" ? "#B45309" : "#1D7A4F",
                      }}
                    >
                      {st}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSuspended(sus ? suspended.filter((x) => x !== l.id) : [...suspended, l.id])
                      }
                      className="cursor-pointer text-xs font-bold"
                      style={{ color: sus ? "#2BB673" : "#B4232A" }}
                    >
                      {sus ? "Restore" : "Suspend"}
                    </button>
                  </span>
                </div>
              );
            })}
            <div className="px-5 py-3 text-xs font-semibold text-muted">
              {listingRows.length} listings shown
            </div>
          </div>
        )}

        {/* ===== USERS ===== */}
        {view === "Users" && (
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
              <input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search name or email…"
                className={searchCls}
              />
              <select value={userPlan} onChange={(e) => setUserPlan(e.target.value)} className={filterCls}>
                <option value="">All plans</option>
                <option>Free</option>
                <option>Premium</option>
                <option>Dealer</option>
              </select>
            </div>
            <div className="grid grid-cols-[1.8fr_1.8fr_.9fr_.9fr_.9fr_1.4fr] border-b border-hairline bg-[#FAFBFC] px-5 py-[11px] text-[11px] font-extrabold tracking-[.4px] text-muted">
              <span>USER</span>
              <span>EMAIL</span>
              <span>PLAN</span>
              <span>LISTINGS</span>
              <span>JOINED</span>
              <span className="text-right">STATUS / ACTIONS</span>
            </div>
            {userRows.map((u) => {
              const isBanned = banned.includes(u.email);
              return (
                <div
                  key={u.email}
                  className="grid grid-cols-[1.8fr_1.8fr_.9fr_.9fr_.9fr_1.4fr] items-center border-b border-[#F3F5F8] px-5 py-3 text-[13px] font-semibold"
                  style={{ opacity: isBanned ? 0.55 : 1 }}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel-blue text-[11.5px] font-extrabold text-accent">
                      {u.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span className="font-extrabold">
                      {u.name} {u.verified && <span className="text-accent">✓</span>}
                    </span>
                  </span>
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap text-muted">
                    {u.email}
                  </span>
                  <span>
                    <span
                      className={pill}
                      style={{ background: PLAN_STYLES[u.plan][0], color: PLAN_STYLES[u.plan][1] }}
                    >
                      {u.plan}
                    </span>
                  </span>
                  <span className="text-muted">{u.listings}</span>
                  <span className="text-muted">{u.joined}</span>
                  <span className="flex items-center justify-end gap-3">
                    <span
                      className={pill}
                      style={{
                        background: isBanned ? "#FDECEC" : "#E6F7EF",
                        color: isBanned ? "#B4232A" : "#1D7A4F",
                      }}
                    >
                      {isBanned ? "BANNED" : "ACTIVE"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setBanned(isBanned ? banned.filter((x) => x !== u.email) : [...banned, u.email])
                      }
                      className="cursor-pointer text-xs font-bold"
                      style={{ color: isBanned ? "#2BB673" : "#B4232A" }}
                    >
                      {isBanned ? "Unban" : "Ban"}
                    </button>
                  </span>
                </div>
              );
            })}
            <div className="px-5 py-3 text-xs font-semibold text-muted">
              {USERS.length} users shown · 2 flagged for review
            </div>
          </div>
        )}

        {/* ===== MODERATION ===== */}
        {view === "Moderation" && (
          <>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="flex items-center justify-between border-b border-hairline px-[22px] py-[18px]">
                <span className="text-base font-extrabold">
                  Moderation queue <span className="font-semibold text-muted">({openCount})</span>
                </span>
                <label
                  onClick={() => setAuto(!auto)}
                  className="flex cursor-pointer items-center gap-[9px] text-[12.5px] font-bold text-muted"
                >
                  Auto-approve verified sellers
                  <span
                    className="relative h-5 w-[34px] rounded-full transition-colors"
                    style={{ background: auto ? "#405FF2" : "#C6CBD4" }}
                  >
                    <span
                      className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-[left]"
                      style={{ left: auto ? 16 : 2 }}
                    />
                  </span>
                </label>
              </div>
              {pending.map((l, i) => {
                const d = decisions[l.id];
                return (
                  <div
                    key={l.id}
                    className="flex items-center gap-4 border-b border-[#F3F5F8] px-[22px] py-4"
                    style={{ opacity: d ? 0.6 : 1 }}
                  >
                    <span
                      className="h-[52px] w-[76px] shrink-0 rounded-[10px]"
                      style={{ background: stripe(l.id) }}
                    />
                    <div className="min-w-0 flex-1">
                      <Link href={`/listing/${l.id}`} className="text-[14.5px] font-extrabold">
                        {l.make} {l.model} – {l.year}
                      </Link>
                      <div className="text-xs font-semibold text-muted">
                        {fmtPrice(l.price)} · {l.city} · by {MOD_SELLERS[i]} · submitted 2h ago
                      </div>
                    </div>
                    {!d ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setDecisions({ ...decisions, [l.id]: "approved" })}
                          className="shrink-0 cursor-pointer rounded-[10px] bg-badge-green px-4 py-[9px] text-xs font-extrabold text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecisions({ ...decisions, [l.id]: "rejected" })}
                          className="shrink-0 cursor-pointer rounded-[10px] border-[1.5px] border-line px-4 py-2 text-xs font-extrabold text-[#B4232A]"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecisions({ ...decisions, [l.id]: "featured" })}
                          className="shrink-0 cursor-pointer text-xs font-extrabold text-accent"
                        >
                          ☆ Feature
                        </button>
                      </>
                    ) : (
                      <span
                        className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold"
                        style={{
                          background: d === "approved" ? "#E6F7EF" : d === "featured" ? "#E9F2FF" : "#FDECEC",
                          color: d === "approved" ? "#1D7A4F" : d === "featured" ? "#1B2B6B" : "#B4232A",
                        }}
                      >
                        {d.toUpperCase()}
                      </span>
                    )}
                  </div>
                );
              })}
              {openCount === 0 && (
                <div className="p-10 text-center text-[13.5px] font-semibold text-muted">Queue clear ✓</div>
              )}
            </div>
            <div className="mt-5 rounded-2xl border border-line bg-white p-[22px]">
              <div className="mb-3 text-sm font-extrabold">
                Reported content <span className="font-semibold text-muted">(2)</span>
              </div>
              {REPORTS.map((r) => {
                const out = reportOutcomes[r.id];
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3.5 border-b border-[#F3F5F8] py-[11px] text-[13px] font-semibold"
                    style={{ opacity: out ? 0.55 : 1 }}
                  >
                    <span className="shrink-0 rounded-full bg-[#FDECEC] px-2.5 py-[3px] text-[10.5px] font-extrabold text-[#B4232A]">
                      {r.reason}
                    </span>
                    <span className="flex-1">{r.what}</span>
                    {!out ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setReportOutcomes({ ...reportOutcomes, [r.id]: "DISMISSED" })}
                          className="cursor-pointer text-xs font-bold text-muted"
                        >
                          Dismiss
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReportOutcomes({ ...reportOutcomes, [r.id]: "CONTENT REMOVED" })
                          }
                          className="cursor-pointer text-xs font-bold text-[#B4232A]"
                        >
                          Remove content
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] font-extrabold text-muted">{out}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== PRICING ===== */}
        {view === "Pricing" && (
          <div className="grid grid-cols-[400px_1fr] items-start gap-5">
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="mb-1 text-sm font-extrabold">Pricing config</div>
              <div className="mb-3.5 text-[11.5px] font-semibold text-muted">
                Edits apply to new purchases immediately
              </div>
              {Object.entries(prices).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-[7px] text-[13px] font-semibold">
                  <span className="text-muted">{k}</span>
                  <span className="flex items-center gap-1 font-extrabold">
                    €
                    <input
                      value={v}
                      onChange={(e) => {
                        setPrices({ ...prices, [k]: e.target.value });
                        setSaved(false);
                      }}
                      className="w-[62px] rounded-lg border border-line px-2 py-1.5 text-right text-[13px] font-bold outline-none"
                    />
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSaved(true)}
                className="mt-3 block w-full cursor-pointer rounded-[10px] bg-ink py-2.5 text-center text-[12.5px] font-bold text-white"
              >
                {saved ? "✓ Saved to pricing_config" : "Save changes"}
              </button>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="mb-3.5 text-sm font-extrabold">Recent transactions</div>
              {TXNS.map((t, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1.6fr_1fr_.8fr] border-b border-[#F3F5F8] py-[9px] text-[12.5px] font-semibold"
                >
                  <span className="text-muted">{t.date}</span>
                  <span>{t.what}</span>
                  <span className="text-muted">{t.who}</span>
                  <span className="text-right font-extrabold">{t.amt}</span>
                </div>
              ))}
              <button
                type="button"
                className="mt-3 inline-block cursor-pointer text-[12.5px] font-bold text-accent"
              >
                Open Stripe dashboard ↗
              </button>
            </div>
          </div>
        )}

        {/* GA connect modal */}
        {gaModal && (
          <div
            onClick={() => setGaModal(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(5,11,32,.55)]"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[450px] max-w-[92vw] rounded-[18px] bg-white p-[30px] shadow-[0_30px_70px_rgba(5,11,32,.3)]"
            >
              <h2 className="mb-1 text-[19px] font-extrabold tracking-[-0.4px]">Link Google Analytics</h2>
              <div className="mb-5 text-[12.5px] font-semibold text-muted">
                Signed in as <b>admin@autorinka.lt</b> ·{" "}
                <span className="cursor-pointer text-accent">switch account</span>
              </div>
              <div className="mb-2.5 text-xs font-extrabold text-muted">CHOOSE A PROPERTY</div>
              <div className="mb-[22px] flex flex-col gap-2">
                {GA_PROPERTIES.map((p, i) => (
                  <label
                    key={p.name}
                    onClick={() => setGaChoice(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-[13px] ${
                      gaChoice === i ? "border-2 border-accent" : "border border-line"
                    }`}
                  >
                    <span
                      className={`box-border h-4 w-4 shrink-0 rounded-full ${
                        gaChoice === i ? "border-[5px] border-accent" : "border-[1.5px] border-[#C6CBD4]"
                      }`}
                    />
                    <span>
                      <span className="block text-[13.5px] font-extrabold">{p.name}</span>
                      <span className="block text-[11.5px] font-semibold text-muted">{p.meta}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setGaModal(false)}
                  className="cursor-pointer rounded-[10px] border-[1.5px] border-[#C6CBD4] px-5 py-[11px] text-[13.5px] font-bold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGaConnected(true);
                    setGaModal(false);
                  }}
                  className="cursor-pointer rounded-[10px] bg-accent px-6 py-3 text-[13.5px] font-bold text-white"
                >
                  Link property
                </button>
              </div>
            </div>
          </div>
        )}

        {showGlobe && <GlobeModal onClose={() => setShowGlobe(false)} />}
      </main>
    </div>
  );
}
