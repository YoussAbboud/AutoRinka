"use client";

import Link from "next/link";
import { useState } from "react";
import { BODY_TYPES, CITIES, COLORS, FEATURES, FUELS, LISTINGS, MAKES, stripe } from "@/lib/listings";

const STEP_LABELS = ["1 · Vehicle", "2 · Photos", "3 · Details", "4 · Contacts", "5 · Package & Pay"];

const TIERS = [
  { key: "standard", name: "Standard", price: "€9.99", popular: false, features: "Live for 30 days · standard card · renew any time" },
  { key: "plus", name: "Plus", price: "€19.99", popular: true, features: "Highlighted card styling · 1 bump to top · 30 days" },
  { key: "featured", name: "Featured", price: "€34.99", popular: false, features: "Homepage Featured slot · highlighted · 3 bumps · 30 days" },
] as const;

const COND_ROWS: Array<[string, string]> = [
  ["Engine and gearbox", "engine"],
  ["Chassis", "chassis"],
  ["Body", "bodyCond"],
  ["Condition of the glass", "glass"],
  ["Condition of the interior", "interior"],
  ["Electronics", "electronics"],
  ["General condition", "general"],
];

const CONTACT_CHECKS = [
  { key: "business", label: "Check if you are selling as a business", hint: "(vehicles, parts, or other automotive products)", req: false },
  { key: "news", label: "AutoRinka news and offers", hint: "", req: false },
  { key: "agree", label: "I agree with the AutoRinka rules and have read the privacy policy", hint: "", req: true },
] as const;

interface Vehicle {
  make: string;
  model: string;
  year: string;
  month: string;
  body: string;
  fuel: string;
  gearbox: string;
  km: string;
  kw: string;
  cc: string;
  vin: string;
  ta: string;
  color: string;
  damage: string;
  doors: string;
  wheel: string;
  price: string;
  city: string;
  descLt: string;
  descEn: string;
  negotiable: boolean;
  options: string[];
  country: string;
  email: string;
  contactPhone: string;
  phone2: string;
  business: boolean;
  news: boolean;
  agree: boolean;
}

const labelCls = "block text-[12.5px] font-bold text-muted";
const inputCls =
  "mt-1.5 box-border w-full rounded-[10px] border border-line bg-white px-3 py-[11px] text-sm font-semibold text-ink outline-none";

export function SellWizard() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [tier, setTier] = useState<string>("plus");
  const [photos, setPhotos] = useState(0);
  const [vinInput, setVinInput] = useState("");
  const [vinStatus, setVinStatus] = useState<"ok" | "bad" | null>(null);
  const [featQuery, setFeatQuery] = useState("");
  const [openCats, setOpenCats] = useState<string[]>([]);
  const [cond, setCond] = useState<Record<string, string | undefined>>({});
  const [wasDamaged, setWasDamaged] = useState(false);
  const [repainted, setRepainted] = useState(false);
  const [vatShow, setVatShow] = useState(false);
  const [vatRate, setVatRate] = useState("21");
  const [v, setVState] = useState<Vehicle>({
    make: "",
    model: "",
    year: "",
    month: "",
    body: "",
    fuel: "",
    gearbox: "",
    km: "",
    kw: "",
    cc: "",
    vin: "",
    ta: "",
    color: "",
    damage: "No damages",
    doors: "",
    wheel: "LHD",
    price: "",
    city: "",
    descLt: "",
    descEn: "",
    negotiable: true,
    options: [],
    country: "Lietuva",
    email: "tomas.k@gmail.com",
    contactPhone: "",
    phone2: "",
    business: false,
    news: false,
    agree: false,
  });
  const setV = (patch: Partial<Vehicle>) => setVState((prev) => ({ ...prev, ...patch }));

  const models = v.make
    ? [...new Set(LISTINGS.filter((l) => l.make === v.make).map((l) => l.model)), "Other…"]
    : [];

  const decodeVin = () => {
    const vin = vinInput.trim().toUpperCase();
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      setVinStatus("bad");
      return;
    }
    let h = 0;
    for (const ch of vin) h = (h * 31 + ch.charCodeAt(0)) % 997;
    const src = LISTINGS[h % LISTINGS.length];
    setVinStatus("ok");
    setV({
      vin,
      make: src.make,
      model: src.model,
      year: String(src.year),
      body: src.body,
      fuel: src.fuel,
      gearbox: src.gearbox,
      kw: String(src.kw),
      color: src.color,
      doors: "4/5",
    });
  };

  const parsedPrice = parseFloat(String(v.price).replace(/\s/g, ""));
  const priceExVat = parsedPrice
    ? Math.round(parsedPrice / (1 + Number(vatRate) / 100))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    : "—";

  return (
    <div className="mx-auto max-w-[760px] px-6 pb-[90px] pt-10">
      <h1 className="mb-1.5 text-[30px] font-extrabold tracking-[-0.7px]">Sell your car</h1>
      <p className="mb-[30px] text-sm text-muted">Five quick steps. Your draft saves automatically as you go.</p>

      {/* Step bar */}
      <div className="mb-[34px] flex gap-2">
        {STEP_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => !done && setStep(i)}
            className="flex-1 cursor-pointer text-left"
          >
            <div className={`mb-2 h-[5px] rounded-full ${i <= step ? "bg-accent" : "bg-line"}`} />
            <div className={`text-xs font-bold ${i <= step ? "text-ink" : "text-[#9AA1AC]"}`}>{label}</div>
          </button>
        ))}
      </div>

      {/* Step 1: Vehicle */}
      {step === 0 && (
        <>
          <div className="mb-4 grid grid-cols-[1fr_1.2fr] items-center gap-[26px] rounded-2xl border border-[#CBE8D4] bg-[#EAF6EE] px-[26px] py-[22px]">
            <div>
              <span className="mb-2.5 inline-block rounded-md bg-badge-green px-[11px] py-[5px] text-[11px] font-extrabold tracking-[.5px] text-white">
                SIMPLE AND QUICK
              </span>
              <div className="text-[13.5px] font-semibold leading-[1.55] text-[#2A4A36]">
                Enter the VIN code and we&apos;ll fill in the vehicle details automatically. Verified VINs
                get a free history-check button on your listing.
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[12.5px] font-bold text-[#2A4A36]">VIN code</div>
              <div className="flex gap-2">
                <input
                  value={vinInput}
                  onChange={(e) => {
                    setVinInput(e.target.value.toUpperCase());
                    setVinStatus(null);
                  }}
                  placeholder="e.g. WAUZZZ4G7FN012345"
                  className="min-w-0 flex-1 rounded-[10px] border border-[#CBE8D4] bg-white px-3 py-[11px] text-[13.5px] font-bold uppercase tracking-[.5px] outline-none"
                />
                <button
                  type="button"
                  onClick={decodeVin}
                  className="cursor-pointer self-center whitespace-nowrap rounded-[10px] bg-badge-green px-[18px] py-3 text-[13px] font-bold text-white"
                >
                  Auto-fill
                </button>
              </div>
              <div
                className="mt-2 min-h-4 text-xs font-bold"
                style={{ color: vinStatus === "bad" ? "#B4232A" : "#1D7A4F" }}
              >
                {vinStatus === "ok"
                  ? "✓ VIN verified — details filled in below. A history-check button will appear on your listing."
                  : vinStatus === "bad"
                    ? "VIN must be 17 characters (letters I, O, Q are never used). Check and try again."
                    : ""}
              </div>
              {vinStatus === "ok" && (
                <a
                  href={`https://autoistorija.lt/?vin=${vinInput.trim().toUpperCase()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#1D7A4F] underline"
                >
                  View history report on autoistorija.lt ↗
                </a>
              )}
            </div>
          </div>
          <div className="mb-4 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs font-extrabold tracking-[1px] text-[#9AA1AC]">OR FILL IN MANUALLY</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] rounded-2xl border border-line bg-white p-[30px]">
            <label className={labelCls}>
              Make <Req />
              <select
                value={v.make}
                onChange={(e) => setV({ make: e.target.value, model: "" })}
                className={inputCls}
              >
                <option value="">Select make…</option>
                {MAKES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              Model <Req />
              <select value={v.model} onChange={(e) => setV({ model: e.target.value })} className={inputCls}>
                <option value="">Select model…</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <div className={labelCls}>
              First registration <Req />
              <div className="mt-1.5 flex gap-2">
                <input
                  value={v.year}
                  onChange={(e) => setV({ year: e.target.value })}
                  placeholder="Year, e.g. 2020"
                  inputMode="numeric"
                  className="box-border min-w-0 flex-[1.4] rounded-[10px] border border-line px-3 py-[11px] text-sm font-semibold outline-none"
                />
                <select
                  value={v.month}
                  onChange={(e) => setV({ month: e.target.value })}
                  className="box-border flex-1 rounded-[10px] border border-line bg-white px-2 py-[11px] text-sm font-semibold text-ink outline-none"
                >
                  <option value="">Month</option>
                  {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((mo) => (
                    <option key={mo} value={mo}>
                      {mo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <SelectField label="Body type" required value={v.body} onChange={(x) => setV({ body: x })} options={BODY_TYPES} />
            <SelectField label="Fuel" required value={v.fuel} onChange={(x) => setV({ fuel: x })} options={[...FUELS, "LPG"]} />
            <SelectField label="Gearbox" required value={v.gearbox} onChange={(x) => setV({ gearbox: x })} options={["Manual", "Automatic"]} />
            <InputField label="Mileage (km)" required value={v.km} placeholder="85 000" numeric onChange={(x) => setV({ km: x })} />
            <InputField label="Power (kW)" required value={v.kw} placeholder="110" numeric onChange={(x) => setV({ kw: x })} />
            <InputField label="TA valid until" value={v.ta} placeholder="2027-04-01" onChange={(x) => setV({ ta: x })} />
            <InputField label="Engine capacity, cc" value={v.cc} placeholder="1 968" numeric onChange={(x) => setV({ cc: x })} />
            <SelectField label="Color" value={v.color} onChange={(x) => setV({ color: x })} options={[...COLORS.map((c) => c[0]), "Other"]} />
            <label className={labelCls}>
              Damage
              <select value={v.damage} onChange={(e) => setV({ damage: e.target.value })} className={inputCls}>
                <option>No damages</option>
                <option>Slight damage</option>
                <option>Damaged</option>
                <option>Not working</option>
              </select>
            </label>
            <div className={labelCls}>
              Number of doors
              <div className="mt-1.5 flex gap-2">
                {["2/3", "4/5", "Other"].map((d) => (
                  <Segment key={d} label={d} on={v.doors === d} onClick={() => setV({ doors: d })} />
                ))}
              </div>
            </div>
            <div className={labelCls}>
              Steering wheel
              <div className="mt-1.5 flex gap-2">
                {["LHD", "RHD"].map((w) => (
                  <Segment key={w} label={w} on={v.wheel === w} onClick={() => setV({ wheel: w })} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step 2: Photos */}
      {step === 1 && (
        <div className="rounded-2xl border border-line bg-white p-[30px]">
          <div className="mb-1 text-sm font-bold">
            Add photos <span className="font-semibold text-muted">(min 3, max 20 — first photo is the cover)</span>
          </div>
          <div className="mb-5 text-[12.5px] text-muted">Drag to reorder. Photos are compressed on upload.</div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }, (_, i) => {
              const filled = i < photos;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    filled
                      ? i === photos - 1 && setPhotos(photos - 1)
                      : i === photos && setPhotos(Math.min(photos + 1, 8))
                  }
                  className={`relative flex h-[100px] cursor-pointer items-center justify-center rounded-xl text-xs font-bold text-[#7A8494] ${
                    filled ? "border border-line" : "border-[1.5px] border-dashed border-[#C6CBD4] bg-[#FAFBFC]"
                  }`}
                  style={filled ? { background: stripe(i + 3) } : undefined}
                >
                  {!filled && i === photos ? "+ Add photo" : ""}
                  {filled && i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-[3px] text-[10px] font-extrabold text-white">
                      COVER
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div
            className="mt-4 text-[12.5px] font-bold"
            style={{ color: photos >= 3 ? "#2BB673" : "#D97706" }}
          >
            {photos >= 3 ? `✓ ${photos} photos added` : `${photos}/3 minimum — add ${3 - photos} more`}
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 2 && (
        <div className="flex flex-col gap-[18px] rounded-2xl border border-line bg-white p-[30px]">
          <div className="grid grid-cols-2 gap-5">
            <InputField
              label="Price in Lithuania, with taxes, €"
              required
              value={v.price}
              placeholder="18 900"
              numeric
              onChange={(x) => setV({ price: x })}
            />
            <div />
          </div>
          <label
            onClick={() => setV({ negotiable: !v.negotiable })}
            className="flex cursor-pointer items-center gap-2.5 text-[13.5px] font-semibold"
          >
            <Toggle on={v.negotiable} />
            Price is negotiable
          </label>
          <label
            onClick={() => setVatShow(!vatShow)}
            className="flex cursor-pointer items-center gap-2.5 text-[13.5px] font-bold text-accent"
          >
            <Checkbox on={vatShow} size={18} />
            Show additional price excl. VAT
          </label>
          {vatShow && (
            <div className="grid grid-cols-[140px_1fr] gap-5">
              <label className={labelCls}>
                VAT rate
                <select value={vatRate} onChange={(e) => setVatRate(e.target.value)} className={inputCls}>
                  <option value="21">21 %</option>
                  <option value="9">9 %</option>
                  <option value="0">0 %</option>
                </select>
              </label>
              <label className={labelCls}>
                Price without VAT
                <div className="mt-1.5 flex items-center justify-between rounded-[10px] border border-line bg-[#FAFBFC] px-3 py-[11px] text-sm font-semibold text-ink">
                  {priceExVat}
                  <span className="text-[#9AA1AC]">€</span>
                </div>
              </label>
            </div>
          )}
          <label className={labelCls}>
            Description (Lithuanian) <Req />
            <textarea
              value={v.descLt}
              onChange={(e) => setV({ descLt: e.target.value })}
              placeholder="Aprašykite automobilį…"
              className="mt-1.5 box-border min-h-20 w-full resize-y rounded-[10px] border border-line px-3 py-[11px] font-sans text-sm outline-none"
            />
          </label>
          <label className={labelCls}>
            Description (English, optional)
            <textarea
              value={v.descEn}
              onChange={(e) => setV({ descEn: e.target.value })}
              placeholder="Describe the car…"
              className="mt-1.5 box-border min-h-20 w-full resize-y rounded-[10px] border border-line px-3 py-[11px] font-sans text-sm outline-none"
            />
          </label>

          <div>
            <div className="mb-3.5 text-sm font-extrabold text-ink">Technical condition</div>
            <div className="flex flex-col gap-2.5">
              {COND_ROWS.map(([label, key]) => (
                <div key={key} className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <span className="whitespace-nowrap text-[13px] font-bold text-[#3A4048]">{label}</span>
                  <div className="flex gap-1.5">
                    {["Poor", "Average", "Good", "Excellent"].map((o) => {
                      const on = cond[key] === o;
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setCond({ ...cond, [key]: on ? undefined : o })}
                          className={`flex-1 cursor-pointer whitespace-nowrap rounded-[9px] py-2.5 text-center text-[13px] font-bold transition-colors hover:border-accent ${
                            on
                              ? "border-[1.5px] border-accent bg-accent text-white"
                              : "border border-line bg-white text-muted"
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mt-1 grid grid-cols-[200px_1fr] items-center gap-4 border-t border-[#F3F5F8] pt-3.5">
                <span className="text-[13px] font-bold text-[#3A4048]">Other</span>
                <div className="flex gap-7">
                  <label
                    onClick={() => setWasDamaged(!wasDamaged)}
                    className="flex cursor-pointer items-center gap-[9px] whitespace-nowrap text-[13px] font-semibold"
                  >
                    <Checkbox on={wasDamaged} size={18} />
                    Was damaged
                  </label>
                  <label
                    onClick={() => setRepainted(!repainted)}
                    className="flex cursor-pointer items-center gap-[9px] whitespace-nowrap text-[13px] font-semibold"
                  >
                    <Checkbox on={repainted} size={18} />
                    Repainted
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[12.5px] font-bold text-muted">Text search of features</div>
            <input
              value={featQuery}
              onChange={(e) => setFeatQuery(e.target.value)}
              placeholder="Enter a feature…"
              className="mb-4 box-border w-full rounded-[10px] border border-line px-3 py-[11px] text-[13.5px] font-semibold outline-none"
            />
            <div className="mb-2.5 text-[12.5px] font-bold text-muted">
              Choose features from the list{" "}
              <span className="font-semibold text-[#9AA1AC]">· {v.options.length} selected</span>
            </div>
            <div className="flex flex-col gap-2">
              {FEATURES.map(([name, desc, items]) => {
                const q = featQuery.trim().toLowerCase();
                const shown = q ? items.filter((x) => x.toLowerCase().includes(q)) : items;
                if (q && !shown.length) return null;
                const picked = items.filter((x) => v.options.includes(x)).length;
                const open = q ? true : openCats.includes(name);
                return (
                  <div key={name} className="overflow-hidden rounded-xl border border-line">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenCats(open ? openCats.filter((x) => x !== name) : [...openCats, name])
                      }
                      className="flex w-full cursor-pointer items-center gap-3 bg-white px-4 py-3.5 text-left"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-accent text-[13px] font-bold text-accent">
                        {open ? "−" : "+"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-extrabold">{name}</span>
                        <span className="block text-[11.5px] font-semibold text-muted">{desc}</span>
                      </span>
                      <span
                        className={`shrink-0 rounded-[7px] px-2.5 py-[5px] text-[11.5px] font-extrabold ${
                          picked ? "bg-panel-blue text-accent" : "bg-[#F3F5F8] text-muted"
                        }`}
                      >
                        {picked} / {items.length}
                      </span>
                    </button>
                    {open && (
                      <div className="flex flex-wrap gap-2 border-t border-[#F3F5F8] bg-[#FAFBFC] px-4 pb-4 pt-3.5">
                        {shown.map((o) => {
                          const on = v.options.includes(o);
                          return (
                            <button
                              key={o}
                              type="button"
                              onClick={() =>
                                setV({
                                  options: on ? v.options.filter((x) => x !== o) : [...v.options, o],
                                })
                              }
                              className={`cursor-pointer rounded-full px-[15px] py-2 text-[13px] font-semibold ${
                                on
                                  ? "border-[1.5px] border-accent bg-panel-blue text-accent"
                                  : "border border-line bg-white text-[#3A4048]"
                              }`}
                            >
                              {o}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Contacts */}
      {step === 3 && (
        <>
          <div className="grid grid-cols-3 gap-x-5 gap-y-[18px] rounded-2xl border border-line bg-white p-[30px]">
            <label className={labelCls}>
              Country <Req />
              <select
                value={v.country}
                onChange={(e) => setV({ country: e.target.value })}
                className={inputCls}
              >
                <option>Lietuva</option>
                <option>Latvija</option>
                <option>Estija</option>
                <option>Lenkija</option>
              </select>
            </label>
            <label className={labelCls}>
              City <Req />
              <select value={v.city} onChange={(e) => setV({ city: e.target.value })} className={inputCls}>
                <option value="">Select city…</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <InputField label="E-mail" value={v.email} onChange={(x) => setV({ email: x })} />
          </div>
          <div className="mt-4 grid grid-cols-[1fr_1.3fr] items-start gap-[30px] rounded-2xl border border-[#CBE8D4] bg-[#EAF6EE] px-[26px] py-6">
            <div className="flex flex-col gap-3.5">
              <label className="block text-[12.5px] font-bold text-[#2A4A36]">
                Contact phone <Req />
                <input
                  value={v.contactPhone}
                  onChange={(e) => setV({ contactPhone: e.target.value })}
                  placeholder="+370 6XX XX XXX"
                  className="mt-1.5 box-border w-full rounded-[10px] border border-[#CBE8D4] bg-white px-3 py-[11px] text-sm font-semibold outline-none"
                />
              </label>
              <label className="block text-[12.5px] font-bold text-[#2A4A36]">
                Additional phone
                <input
                  value={v.phone2}
                  onChange={(e) => setV({ phone2: e.target.value })}
                  placeholder="+370 6XX XX XXX"
                  className="mt-1.5 box-border w-full rounded-[10px] border border-[#CBE8D4] bg-white px-3 py-[11px] text-sm font-semibold outline-none"
                />
              </label>
            </div>
            <div className="text-[12.5px] font-semibold leading-[1.65] text-[#2A4A36]">
              <b>Virtual number</b> — protection for your phone number! When placing an ad, we activate free
              protection of your personal number by assigning a virtual AutoRinka number to it. This helps
              avoid unwanted or fraudulent calls after the transaction.
              <br />
              If you provide two numbers, the virtual number redirects the call to the second one if the
              first is not answered.
              <br />
              <span className="cursor-pointer text-[#1D7A4F] underline">More information</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3.5 rounded-2xl border border-line bg-white px-[26px] py-6">
            {CONTACT_CHECKS.map((c) => {
              const on = v[c.key];
              return (
                <label
                  key={c.key}
                  onClick={() => setV({ [c.key]: !on })}
                  className="flex cursor-pointer items-center gap-[11px] text-[13.5px] font-semibold"
                >
                  <Checkbox on={on} size={18} />
                  <span>
                    {c.label} {c.hint && <span className="font-medium text-[#9AA1AC]">{c.hint}</span>}
                    {c.req && <span className="text-[#D42B2B]"> *</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}

      {/* Step 5: Package & Pay */}
      {step === 4 && !done && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {TIERS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTier(t.key)}
                className={`relative cursor-pointer rounded-2xl bg-white p-6 text-left ${
                  tier === t.key ? "border-2 border-accent" : "border border-line"
                }`}
              >
                {t.popular && (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-accent px-3 py-1 text-[10.5px] font-extrabold text-white">
                    POPULAR
                  </span>
                )}
                <div className="mb-1 text-[15px] font-extrabold">{t.name}</div>
                <div className="mb-0.5 text-2xl font-extrabold tracking-[-0.5px]">{t.price}</div>
                <div className="mb-3.5 text-xs font-semibold text-muted">30 days</div>
                <div className="text-[12.5px] leading-[1.7] text-[#3A4048]">{t.features}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-[14px] bg-panel-blue px-[22px] py-4 text-[13.5px] font-semibold text-[#1B2B6B]">
            <span>
              On <b>Premium</b> or <b>Dealer</b>? Listing fees are waived.{" "}
              <Link href="/pricing" className="text-accent underline">
                See plans
              </Link>
            </span>
            <span className="opacity-70">Payment via Stripe Checkout</span>
          </div>
        </>
      )}
      {step === 4 && done && (
        <div className="rounded-2xl border border-line bg-white p-[50px] text-center">
          <div className="mx-auto mb-[18px] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#E6F7EF] text-[26px] font-extrabold text-badge-green">
            ✓
          </div>
          <h2 className="mb-2 text-[22px] font-extrabold">Payment received — listing submitted</h2>
          <p className="mb-6 text-sm leading-[1.6] text-muted">
            Your {(v.make || "car") + " " + (v.model || "")} listing is <b>pending review</b>. Most listings
            are approved within 2 hours.
            <br />
            You&apos;ll get a notification when it goes live.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-accent px-[26px] py-[13px] text-sm font-bold text-white transition-colors hover:bg-accent-deep"
            >
              Go to Dashboard
            </Link>
            <Link href="/browse" className="rounded-xl border-[1.5px] border-ink px-[26px] py-3 text-sm font-bold">
              Browse cars
            </Link>
          </div>
        </div>
      )}

      {/* Nav buttons */}
      {!done && (
        <div className="mt-[26px] flex justify-between">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            className="cursor-pointer rounded-xl border-[1.5px] border-[#C6CBD4] px-[26px] py-3 text-sm font-bold text-muted"
            style={{ visibility: step === 0 ? "hidden" : "visible" }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => (step === 4 ? setDone(true) : setStep(step + 1))}
            className="cursor-pointer rounded-xl bg-accent px-[30px] py-[13px] text-sm font-bold text-white"
          >
            {step === 4 ? "Pay & Publish →" : "Continue →"}
          </button>
        </div>
      )}
    </div>
  );
}

function Req() {
  return <span className="text-[#D42B2B]">*</span>;
}

function InputField({
  label,
  value,
  placeholder,
  required,
  numeric,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  numeric?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className={labelCls}>
      {label} {required && <Req />}
      <input
        value={value}
        placeholder={placeholder}
        inputMode={numeric ? "numeric" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  required,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  required?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className={labelCls}>
      {label} {required && <Req />}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Segment({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 cursor-pointer rounded-[10px] py-[11px] text-center text-[13.5px] font-bold ${
        on ? "border-[1.5px] border-accent bg-accent text-white" : "border border-line bg-white text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className="relative h-5 w-[34px] rounded-full transition-colors"
      style={{ background: on ? "#405FF2" : "#C6CBD4" }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-[left]"
        style={{ left: on ? 16 : 2 }}
      />
    </span>
  );
}

function Checkbox({ on, size = 16 }: { on: boolean; size?: number }) {
  return (
    <span
      className={`box-border shrink-0 rounded-[5px] border-[1.5px] text-center text-xs leading-4 text-white ${
        on ? "border-accent bg-accent" : "border-[#C6CBD4] bg-white"
      }`}
      style={{ width: size, height: size }}
    >
      {on ? "✓" : ""}
    </span>
  );
}
