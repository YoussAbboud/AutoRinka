// AutoRinka mock data — Lithuanian market.
// Ported from the Claude Design prototype (project/data.js). Replace with
// Supabase queries once the backend lands (see uploads/lt-car-marketplace-prompt.md §7).

export const MAKES = [
  "Audi",
  "BMW",
  "Ford",
  "Hyundai",
  "Kia",
  "Mazda",
  "Mercedes-Benz",
  "Nissan",
  "Opel",
  "Peugeot",
  "Renault",
  "Škoda",
  "Toyota",
  "Volkswagen",
  "Volvo",
] as const;

export const CITIES = [
  "Vilnius",
  "Kaunas",
  "Klaipėda",
  "Šiauliai",
  "Panevėžys",
  "Alytus",
  "Marijampolė",
] as const;

export const BODY_TYPES = ["SUV", "Sedan", "Hatchback", "Wagon", "Coupe", "Convertible"] as const;

export const FUELS = ["Petrol", "Diesel", "Hybrid", "PHEV", "Electric"] as const;

export const COLORS: ReadonlyArray<readonly [string, string]> = [
  ["Black", "#1a1a1e"],
  ["White", "#f2f2f0"],
  ["Grey", "#8b8f96"],
  ["Silver", "#c9ccd2"],
  ["Blue", "#2a4d8f"],
  ["Red", "#a02830"],
  ["Green", "#3d5c48"],
];

export const OPTIONS = [
  "Heated seats",
  "Parking sensors",
  "Rear camera",
  "Adaptive cruise",
  "LED headlights",
  "Panoramic roof",
  "Tow hitch",
  "Apple CarPlay",
] as const;

/** Feature catalog for the Sell wizard: [group name, description, items]. */
export const FEATURES: ReadonlyArray<readonly [string, string, readonly string[]]> = [
  ["Interior", "Choose interior comfort and trim elements, such as leather interior, sunroof.", ["Leather seats", "Partly leather", "Alcantara", "Sport seats", "Tinted windows", "Multifunctional steering wheel", "Heated seats", "Sunroof", "Electric seats", "Panoramic roof", "Auxiliary heating", "Ventilated seats", "Electric seats with memory", "Boot cover", "Heated steering wheel", "Massaging seats", "Two trunks", "Dual-pane glass"]],
  ["Electronics", "Mark the devices that facilitate driving and everyday life – e.g., navigation, autopilot.", ["Electric mirrors", "Electric boot lid", "Automatic headlamps", "Electrically adjustable steering wheel", "Rainfall sensor", "Heated mirrors", "Dimming mirror", "Parking sensors", "Keyless entry system", "Cruise control", "Heated windshield", "Start-Stop system", "Voice commands", "Paddle shifters", "LCD monitor", "Navigation/GPS", "Head-Up display", "Digital driver display", "Wireless phone charger", "Touch screen", "Remote software update", "Virtual mirrors"]],
  ["Security", "Introduce anti-theft measures – e.g. alarm system, immobilizer.", ["Immobilizer", "Alarm", "Satellite tracking system", "Armoured"]],
  ["Audio/video equipment", "Indicate audio and video system elements – e.g., USB, Bluetooth, screens.", ["CD player", "MP3 player", "Additional audio equipment", "CD changer", "AUX input", "Subwoofer", "HiFi audio system", "DVD player", "USB input", "USB-C input", "Handsfree kit", "Apple CarPlay / Android Auto"]],
  ["Exterior", "Exterior", ["Light alloy rims", "LED daytime running lights", "LED headlights", "Xenon lights", "Fog lights", "Tow hook", "Headlights washers", "Roof racks", "Automatic folding mirrors", "Set of winter tyres", "Soft close doors", "Matrix headlights"]],
  ["Other features", "Additional information about the car – what is useful for the buyer to know, e.g., service book, spare tire.", ["Not registered in Lithuania", "Imported from US", "For exchange", "Available for leasing", "Service book", "Catalytic converter", "Multiple key sets", "Adapted for disabled people", "Increased engine power", "Prepared for motorsport", "Pneumatic suspension", "Spare wheel", "Remote start", "Remote climate control"]],
  ["Safety", "Indicate safety equipment – e.g., distance maintenance system, ISOFIX mounting points.", ["Traction control system", "ESP", "Hill-start assist control", "Automated Parking", "Adaptive Cruise Control", "Blind Spot Detection", "Lane Departure Warning", "Night vision assist", "Road sign recognition", "ISOFIX mounts", "Collision prevention assist", "High beam assist", "Dynamic cornering lights", "Rear view camera", "Front view camera", "360° degree camera"]],
  ["Features of electric cars", "Mark the features of the electric vehicle", ["Fast charging", "Three-phase charging", "Two-way energy transfer", "Heat pump", "Battery warranty", "APVA compensation has not been used"]],
];

export type Tier = "featured" | "plus" | "standard";
export type Badge = "Great Price" | "Low Mileage";

export interface Listing {
  id: number;
  make: string;
  model: string;
  trim: string;
  year: number;
  price: number;
  km: number;
  fuel: string;
  gearbox: string;
  drive: string;
  body: string;
  kw: number;
  color: string;
  city: string;
  tier: Tier;
  vin: string | null;
  status: string;
  isNew: boolean;
  negotiable: boolean;
  ta: string;
  options: string[];
  views: number;
  saves: number;
  badge?: Badge;
  oldPrice?: number;
}

const L = (
  id: number,
  make: string,
  model: string,
  trim: string,
  year: number,
  price: number,
  km: number,
  fuel: string,
  gearbox: string,
  drive: string,
  body: string,
  kw: number,
  color: string,
  city: string,
  tier: Tier,
  extra: Partial<Listing> = {},
): Listing => ({
  id,
  make,
  model,
  trim,
  year,
  price,
  km,
  fuel,
  gearbox,
  drive,
  body,
  kw,
  color,
  city,
  tier,
  vin: id % 4 === 2 ? null : "WAUZZZ4G" + String(70000000 + id * 5417).padStart(9, "0"),
  status: "active",
  isNew: km < 100,
  negotiable: true,
  ta: "2027-04-01",
  options: OPTIONS.slice(id % 4, (id % 4) + 3),
  views: 120 + id * 37,
  saves: 4 + (id % 19),
  ...extra,
});

export const LISTINGS: Listing[] = [
  L(1, "BMW", "530d", "xDrive M Sport", 2019, 18900, 142000, "Diesel", "Automatic", "AWD", "Sedan", 195, "Black", "Vilnius", "featured", { badge: "Great Price", oldPrice: 20500 }),
  L(2, "Volkswagen", "Tiguan", "2.0 TDI Highline", 2021, 24500, 68000, "Diesel", "Automatic", "AWD", "SUV", 110, "Grey", "Kaunas", "featured", { badge: "Low Mileage" }),
  L(3, "Toyota", "RAV4", "2.5 Hybrid Active", 2022, 29900, 41000, "Hybrid", "Automatic", "AWD", "SUV", 160, "White", "Vilnius", "featured"),
  L(4, "Audi", "A4", "40 TDI S line", 2020, 22400, 98000, "Diesel", "Automatic", "FWD", "Sedan", 140, "Blue", "Klaipėda", "plus", { badge: "Great Price", oldPrice: 23900 }),
  L(5, "Škoda", "Octavia", "1.5 TSI Style", 2021, 17800, 54000, "Petrol", "Manual", "FWD", "Wagon", 110, "Silver", "Kaunas", "plus", { badge: "Low Mileage" }),
  L(6, "Mercedes-Benz", "GLC 220d", "4MATIC AMG Line", 2020, 33500, 87000, "Diesel", "Automatic", "AWD", "SUV", 143, "Black", "Vilnius", "plus"),
  L(7, "Volvo", "XC60", "B4 Momentum", 2021, 31900, 72000, "Diesel", "Automatic", "AWD", "SUV", 145, "Grey", "Šiauliai", "standard"),
  L(8, "Renault", "Clio", "1.0 TCe Zen", 2022, 12900, 29000, "Petrol", "Manual", "FWD", "Hatchback", 67, "Red", "Panevėžys", "standard", { badge: "Low Mileage" }),
  L(9, "Hyundai", "Tucson", "1.6 T-GDI Hybrid", 2023, 28700, 22000, "Hybrid", "Automatic", "FWD", "SUV", 169, "Blue", "Vilnius", "standard"),
  L(10, "Ford", "Focus", "1.5 EcoBlue Titanium", 2019, 12400, 121000, "Diesel", "Manual", "FWD", "Wagon", 88, "White", "Kaunas", "standard", { badge: "Great Price", oldPrice: 13500 }),
  L(11, "Kia", "Sportage", "1.6 CRDi GT-Line", 2022, 26800, 38000, "Diesel", "Automatic", "AWD", "SUV", 100, "Green", "Klaipėda", "standard"),
  L(12, "Peugeot", "308", "1.2 PureTech Allure", 2021, 15600, 47000, "Petrol", "Automatic", "FWD", "Hatchback", 96, "Grey", "Vilnius", "standard"),
  L(13, "Nissan", "Qashqai", "1.3 DIG-T Tekna", 2021, 20400, 59000, "Petrol", "Automatic", "FWD", "SUV", 116, "Silver", "Alytus", "standard"),
  L(14, "Mazda", "CX-5", "2.2 Skyactiv-D", 2020, 21900, 84000, "Diesel", "Automatic", "AWD", "SUV", 135, "Red", "Kaunas", "standard"),
  L(15, "Opel", "Astra", "1.5 D Elegance", 2020, 13200, 92000, "Diesel", "Manual", "FWD", "Hatchback", 90, "Black", "Marijampolė", "standard", { badge: "Great Price", oldPrice: 14400 }),
  L(16, "Volkswagen", "ID.4", "Pro Performance", 2022, 31500, 33000, "Electric", "Automatic", "RWD", "SUV", 150, "White", "Vilnius", "plus"),
  L(17, "BMW", "320i", "Sport Line", 2018, 16700, 134000, "Petrol", "Automatic", "RWD", "Sedan", 135, "Blue", "Šiauliai", "standard"),
  L(18, "Toyota", "Corolla", "1.8 Hybrid Comfort", 2023, 23900, 9000, "Hybrid", "Automatic", "FWD", "Sedan", 103, "Silver", "Vilnius", "standard", { badge: "Low Mileage", isNew: false }),
  L(19, "Audi", "Q5", "45 TFSI quattro", 2021, 35800, 61000, "Petrol", "Automatic", "AWD", "SUV", 195, "Grey", "Kaunas", "featured"),
  L(20, "Volvo", "V60", "D3 Inscription", 2019, 19200, 110000, "Diesel", "Automatic", "FWD", "Wagon", 110, "Black", "Klaipėda", "standard"),
  L(21, "Mercedes-Benz", "E 220d", "Avantgarde", 2020, 28400, 96000, "Diesel", "Automatic", "RWD", "Sedan", 143, "Silver", "Vilnius", "plus"),
  L(22, "Škoda", "Kodiaq", "2.0 TDI 4x4 Style", 2021, 28900, 76000, "Diesel", "Automatic", "AWD", "SUV", 147, "White", "Panevėžys", "standard"),
  L(23, "Renault", "Megane", "E-Tech EV60", 2023, 27500, 14000, "Electric", "Automatic", "FWD", "Hatchback", 160, "Blue", "Vilnius", "standard", { badge: "Low Mileage" }),
  L(24, "Ford", "Kuga", "2.5 PHEV ST-Line", 2022, 27900, 44000, "PHEV", "Automatic", "FWD", "SUV", 165, "Red", "Kaunas", "standard"),
];

// Deterministic thousands grouping (NBSP) — matches lt-LT formatting without
// depending on ICU tables, so server and client render identically.
const group = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const fmtPrice = (n: number) => "€" + group(n);
export const fmtKm = (n: number) => group(n) + " km";
export const monthly = (price: number) => Math.round((price * 1.07) / 60);
export const getListing = (id: number | string) => LISTINGS.find((l) => l.id === Number(id));

// Labeled placeholder "photo" — a subtle diagonal stripe unique-ish per listing.
// Swap for real photos (next/image + Supabase Storage) when available.
export const stripe = (seed: number) => {
  const hues: ReadonlyArray<readonly [number, number]> = [
    [222, 14],
    [220, 8],
    [215, 10],
    [228, 12],
  ];
  const [h, s] = hues[seed % hues.length];
  const l1 = 90 - (seed % 3) * 2;
  const l2 = l1 - 4;
  return `repeating-linear-gradient(135deg, hsl(${h} ${s}% ${l1}%) 0 14px, hsl(${h} ${s}% ${l2}%) 14px 28px)`;
};
