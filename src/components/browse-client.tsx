"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  type Listing,
  type Tier,
  BODY_TYPES,
  CITIES,
  COLORS,
  FUELS,
  LISTINGS,
  MAKES,
  fmtKm,
  fmtPrice,
  monthly,
  stripe,
} from "@/lib/listings";

interface Filters {
  city: string;
  make: string;
  model: string;
  cond: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  kmMax: string;
  body: string[];
  fuel: string[];
  gearbox: string;
  colors: string[];
}

const EMPTY_FILTERS: Filters = {
  city: "",
  make: "",
  model: "",
  cond: "",
  priceMin: "",
  priceMax: "",
  yearMin: "",
  yearMax: "",
  kmMax: "",
  body: [],
  fuel: [],
  gearbox: "",
  colors: [],
};

const SCALAR_KEYS = [
  "city",
  "make",
  "model",
  "cond",
  "priceMin",
  "priceMax",
  "yearMin",
  "yearMax",
  "kmMax",
  "gearbox",
] as const;

const TIER_ORDER: Record<Tier, number> = { featured: 0, plus: 1, standard: 2 };

const SORTS: Record<string, (a: Listing, b: Listing) => number> = {
  newest: (a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || b.id - a.id,
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  kmAsc: (a, b) => a.km - b.km,
  yearDesc: (a, b) => b.year - a.year,
};

function filtersFromParams(p: URLSearchParams): Filters {
  const f: Filters = { ...EMPTY_FILTERS, body: [], fuel: [], colors: [] };
  for (const k of SCALAR_KEYS) {
    const v = p.get(k);
    if (v) f[k] = v;
  }
  if (p.get("maxPrice")) f.priceMax = p.get("maxPrice")!;
  for (const k of ["body", "fuel", "colors"] as const) {
    const v = p.get(k);
    if (v) f[k] = v.split(",");
  }
  return f;
}

export function BrowseClient() {
  const params = useSearchParams();
  const [f, setFState] = useState<Filters>(() => filtersFromParams(new URLSearchParams(params)));
  const [sort, setSort] = useState(() => params.get("sort") || "newest");

  const syncURL = (next: Filters, nextSort: string) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) {
      if (Array.isArray(v)) {
        if (v.length) p.set(k, v.join(","));
      } else if (v) {
        p.set(k, v);
      }
    }
    if (nextSort !== "newest") p.set("sort", nextSort);
    const qs = p.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
  };

  const setF = (patch: Partial<Filters>) => {
    const next = { ...f, ...patch };
    setFState(next);
    syncURL(next, sort);
  };
  const toggleIn = (key: "body" | "fuel" | "colors", val: string) => {
    const arr = f[key];
    setF({ [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] });
  };
  const clearAll = () => {
    setFState(EMPTY_FILTERS);
    syncURL(EMPTY_FILTERS, sort);
  };

  const models = useMemo(
    () => (f.make ? [...new Set(LISTINGS.filter((l) => l.make === f.make).map((l) => l.model))] : []),
    [f.make],
  );

  const results = useMemo(() => {
    const res = LISTINGS.filter(
      (l) =>
        (!f.city || l.city === f.city) &&
        (!f.make || l.make === f.make) &&
        (!f.model || l.model === f.model) &&
        (!f.cond || (f.cond === "new" ? l.year >= 2022 : l.year < 2022)) &&
        (!f.priceMin || l.price >= +f.priceMin) &&
        (!f.priceMax || l.price <= +f.priceMax) &&
        (!f.yearMin || l.year >= +f.yearMin) &&
        (!f.yearMax || l.year <= +f.yearMax) &&
        (!f.kmMax || l.km <= +f.kmMax) &&
        (!f.body.length || f.body.includes(l.body)) &&
        (!f.fuel.length || f.fuel.includes(l.fuel)) &&
        (!f.gearbox || l.gearbox === f.gearbox) &&
        (!f.colors.length || f.colors.includes(l.color)),
    );
    return [...res].sort(SORTS[sort] ?? SORTS.newest);
  }, [f, sort]);

  const inputCls =
    "w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[13.5px] font-semibold outline-none";

  return (
    <div className="mx-auto grid max-w-[1360px] grid-cols-[280px_1fr] items-start gap-9 px-10 pb-20 pt-8">
      {/* Sidebar */}
      <aside className="sticky top-[88px] flex max-h-[calc(100vh-110px)] flex-col gap-[26px] overflow-y-auto pr-2.5">
        <div>
          <FilterTitle>Location</FilterTitle>
          <select value={f.city} onChange={(e) => setF({ city: e.target.value })} className={inputCls}>
            <option value="">All of Lithuania</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select className={`${inputCls} mt-2 text-muted`} defaultValue="Search within 50 km">
            <option>Search within 50 km</option>
            <option>Search within 100 km</option>
            <option>Search within 200 km</option>
            <option>Whole country</option>
          </select>
        </div>
        <div>
          <FilterTitle>Make &amp; Model</FilterTitle>
          <select
            value={f.make}
            onChange={(e) => setF({ make: e.target.value, model: "" })}
            className={inputCls}
          >
            <option value="">Any Make</option>
            {MAKES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={f.model}
            onChange={(e) => setF({ model: e.target.value })}
            className={`${inputCls} mt-2`}
          >
            <option value="">Any Model</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FilterTitle>Condition</FilterTitle>
          <div className="flex flex-col gap-2">
            {(
              [
                ["", "All"],
                ["new", "New (2022+)"],
                ["used", "Used"],
              ] as const
            ).map(([v, label]) => (
              <label
                key={label}
                onClick={() => setF({ cond: v })}
                className="flex cursor-pointer items-center gap-2.5 text-[13.5px] font-semibold"
              >
                <span
                  className={`box-border h-4 w-4 rounded-full bg-white ${
                    f.cond === v ? "border-[5px] border-accent" : "border-[1.5px] border-[#C6CBD4]"
                  }`}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <FilterTitle>Price (EUR)</FilterTitle>
          <div className="flex gap-2">
            <RangeInput value={f.priceMin} placeholder="From" onChange={(v) => setF({ priceMin: v })} />
            <RangeInput value={f.priceMax} placeholder="To" onChange={(v) => setF({ priceMax: v })} />
          </div>
        </div>
        <CheckGroup
          title="Body Type"
          options={BODY_TYPES}
          selected={f.body}
          onToggle={(v) => toggleIn("body", v)}
        />
        <CheckGroup title="Fuel" options={FUELS} selected={f.fuel} onToggle={(v) => toggleIn("fuel", v)} />
        <div>
          <FilterTitle>Gearbox</FilterTitle>
          <div className="flex gap-2">
            {["", "Manual", "Automatic"].map((g) => (
              <button
                key={g || "any"}
                type="button"
                onClick={() => setF({ gearbox: g })}
                className={`flex-1 cursor-pointer rounded-[10px] py-[9px] text-center text-[13px] font-bold ${
                  f.gearbox === g
                    ? "border-[1.5px] border-accent bg-accent text-white"
                    : "border border-line bg-white text-ink"
                }`}
              >
                {g || "Any"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <FilterTitle>Exterior Color</FilterTitle>
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map(([label, hex]) => (
              <button
                key={label}
                type="button"
                title={label}
                onClick={() => toggleIn("colors", label)}
                className="box-border h-[26px] w-[26px] cursor-pointer rounded-full border border-[#D6DAE2]"
                style={{
                  background: hex,
                  boxShadow: f.colors.includes(label) ? "0 0 0 3px #fff, 0 0 0 5px #405FF2" : "none",
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <FilterTitle>Year</FilterTitle>
          <div className="flex gap-2">
            <RangeInput value={f.yearMin} placeholder="From" onChange={(v) => setF({ yearMin: v })} />
            <RangeInput value={f.yearMax} placeholder="To" onChange={(v) => setF({ yearMax: v })} />
          </div>
        </div>
        <div>
          <FilterTitle>Max Mileage</FilterTitle>
          <select value={f.kmMax} onChange={(e) => setF({ kmMax: e.target.value })} className={inputCls}>
            <option value="">Any mileage</option>
            <option value="30000">Under 30 000 km</option>
            <option value="60000">Under 60 000 km</option>
            <option value="100000">Under 100 000 km</option>
            <option value="150000">Under 150 000 km</option>
          </select>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="cursor-pointer self-start text-[13px] font-bold text-accent"
        >
          Clear all filters
        </button>
      </aside>

      {/* Results */}
      <main>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="mb-0.5 text-[26px] font-extrabold tracking-[-0.6px]">Browse Cars</h1>
            <div className="text-[13.5px] font-semibold text-muted">
              {results.length} results · filters saved in URL
            </div>
          </div>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              syncURL(f, e.target.value);
            }}
            className="rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-[13.5px] font-bold outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="priceAsc">Price: low to high</option>
            <option value="priceDesc">Price: high to low</option>
            <option value="kmAsc">Mileage: lowest</option>
            <option value="yearDesc">Year: newest</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-[22px]">
          {results.map((l) => (
            <ResultCard key={l.id} listing={l} />
          ))}
        </div>
        {results.length === 0 && (
          <div className="py-[70px] text-center text-muted">
            <div className="mb-1.5 text-[17px] font-extrabold text-ink">No cars match these filters</div>
            <div className="mb-[18px] text-[13.5px]">Try widening the price or year range.</div>
            <button
              type="button"
              onClick={clearAll}
              className="inline-block cursor-pointer rounded-[10px] bg-accent px-[22px] py-[11px] text-[13.5px] font-bold text-white"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function FilterTitle({ children }: { children: React.ReactNode }) {
  return <div className="mb-2.5 text-[13px] font-extrabold">{children}</div>;
}

function RangeInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      inputMode="numeric"
      onChange={(e) => onChange(e.target.value)}
      className="box-border w-1/2 rounded-[10px] border border-line px-3 py-2.5 text-[13.5px] font-semibold outline-none"
    />
  );
}

function CheckGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <FilterTitle>{title}</FilterTitle>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <label
              key={o}
              onClick={() => onToggle(o)}
              className="flex cursor-pointer items-center gap-2.5 text-[13.5px] font-semibold"
            >
              <span
                className={`box-border h-4 w-4 rounded-[5px] border-[1.5px] text-center text-[11px] leading-[14px] text-white ${
                  on ? "border-accent bg-accent" : "border-[#C6CBD4] bg-white"
                }`}
              >
                {on ? "✓" : ""}
              </span>
              {o}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({ listing: l }: { listing: Listing }) {
  const cardStyle =
    l.tier === "featured"
      ? "border-[1.5px] border-accent bg-white"
      : l.tier === "plus"
        ? "border border-[#B9C6F7] bg-[#FAFBFF]"
        : "border border-line bg-white";
  return (
    <Link
      href={`/listing/${l.id}`}
      className={`block rounded-2xl px-[22px] pb-[18px] pt-[22px] transition-shadow hover:shadow-[0_14px_34px_rgba(5,11,32,.10)] ${cardStyle}`}
    >
      <div className="mb-0.5 flex justify-between gap-3">
        <div>
          <div className="text-[17px] font-extrabold">
            {l.make} {l.model}
          </div>
          <div className="text-[12.5px] font-semibold text-muted">
            {l.trim} · {l.badge ?? "Verified seller"}
          </div>
        </div>
        <div className="shrink-0 text-right">
          {l.oldPrice && (
            <span className="mr-1.5 text-[12.5px] text-[#9AA1AC] line-through">
              {fmtPrice(l.oldPrice)}
            </span>
          )}
          <span className="text-[17px] font-extrabold">{fmtPrice(l.price)}</span>
          <div className="text-[11.5px] font-semibold text-muted">
            est. €{monthly(l.price)} /mo financing
          </div>
        </div>
      </div>
      {l.tier === "featured" && (
        <span className="inline-block rounded-full bg-accent px-2.5 py-[3px] text-[10.5px] font-extrabold tracking-[.4px] text-white">
          FEATURED
        </span>
      )}
      <div className="relative mb-3.5 mt-3 h-[180px] rounded-xl" style={{ background: stripe(l.id) }}>
        <span className="absolute bottom-2 left-3 font-mono text-[10.5px] text-[#7A8494]">
          photo: {l.make} {l.model}, side profile
        </span>
      </div>
      <div className="mb-3 grid grid-cols-3 border-b border-hairline pb-3 text-center">
        <CardStat v={fmtKm(l.km)} k="Mileage" />
        <div className="border-x border-hairline">
          <CardStat v={String(l.year)} k="Year" />
        </div>
        <CardStat v={`${l.kw} kW`} k="Power" />
      </div>
      <div className="grid grid-cols-2 gap-x-[18px] gap-y-[5px] text-[12.5px] font-semibold text-muted">
        <span>{l.color} paint</span>
        <span>
          {l.fuel} · {l.gearbox}
        </span>
        <span>
          {l.drive} · {l.body}
        </span>
        <span>{l.city}</span>
      </div>
    </Link>
  );
}

function CardStat({ v, k }: { v: string; k: string }) {
  return (
    <div>
      <div className="text-[15px] font-extrabold">{v}</div>
      <div className="text-[11.5px] font-semibold text-muted">{k}</div>
    </div>
  );
}
