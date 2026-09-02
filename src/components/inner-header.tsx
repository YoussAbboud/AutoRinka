import Link from "next/link";

const NAV = [
  ["Browse", "/browse"],
  ["Sell", "/sell"],
  ["Pricing", "/pricing"],
  ["Dashboard", "/dashboard"],
  ["Messages", "/messages"],
] as const;

type Right = "sell-button" | "locale-sell" | "autosave" | "user-avatar" | "avatar";

/** White sticky header used on every inner page. The right side varies per
 *  screen in the design: locale + CTA (Browse), CTA only (Listing/Pricing),
 *  autosave note (Sell), name + avatar (Dashboard), avatar (Messages/Saved). */
export function InnerHeader({
  active,
  right = "sell-button",
  sticky = false,
}: {
  active?: string;
  right?: Right;
  sticky?: boolean;
}) {
  return (
    <header
      className={`flex items-center justify-between border-b border-hairline bg-white px-10 py-[18px] ${
        sticky ? "sticky top-0 z-20" : ""
      }`}
    >
      <Link href="/" className="text-xl font-extrabold tracking-[-0.5px]">
        Auto<span className="text-accent">Rinka</span>
      </Link>
      <nav className="flex gap-7 text-sm font-semibold">
        {NAV.map(([label, href]) => (
          <Link key={label} href={href} className={active === label ? "text-accent" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      {right === "locale-sell" && (
        <div className="flex items-center gap-[18px] text-[13.5px] font-semibold">
          <span className="cursor-pointer text-muted">
            LT / <span className="text-ink underline">EN</span>
          </span>
          <Link
            href="/sell"
            className="rounded-full bg-accent px-5 py-[9px] text-white transition-colors hover:bg-accent-deep"
          >
            Sell your car
          </Link>
        </div>
      )}
      {right === "sell-button" && (
        <Link
          href="/sell"
          className="rounded-full bg-accent px-5 py-[9px] text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-deep"
        >
          Sell your car
        </Link>
      )}
      {right === "autosave" && (
        <span className="text-[12.5px] font-bold text-badge-green">● Draft autosaved</span>
      )}
      {right === "user-avatar" && (
        <div className="flex items-center gap-3.5">
          <span className="text-[13px] font-bold text-muted">Tomas K.</span>
          <Avatar />
        </div>
      )}
      {right === "avatar" && <Avatar />}
    </header>
  );
}

function Avatar() {
  return (
    <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-panel-blue text-[13px] font-extrabold text-accent">
      TK
    </span>
  );
}
