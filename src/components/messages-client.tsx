"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { InnerHeader } from "@/components/inner-header";
import { LISTINGS, fmtPrice, stripe } from "@/lib/listings";

type Msg = [who: "me" | "them", body: string, time: string];

const THREADS: Array<{ idx: number; name: string; time: string; unread: boolean; msgs: Msg[] }> = [
  {
    idx: 0,
    name: "Baltic Auto Group",
    time: "10:24",
    unread: true,
    msgs: [
      ["them", "Hello! Yes, the 530d is still available. Would you like to arrange a viewing?", "09:58"],
      ["me", "Hi! Great — is the service history complete? And is the price negotiable?", "10:05"],
      ["them", "Full history at BMW Vilnius, I can send the invoices. Small room on price for a quick deal.", "10:11"],
      ["them", "We're open until 19:00 today if you want to stop by.", "10:24"],
    ],
  },
  {
    idx: 2,
    name: "Rūta B.",
    time: "Yesterday",
    unread: true,
    msgs: [
      ["me", "Hi, does the RAV4 have a tow hitch?", "14:02"],
      ["them", "No hitch, but it has the factory wiring prep. Never towed anything.", "16:40"],
    ],
  },
  {
    idx: 4,
    name: "Mindaugas P.",
    time: "Tue",
    unread: false,
    msgs: [
      ["them", "The Octavia is sold, sorry! I'll mark it as sold today.", "11:12"],
      ["me", "No problem, thanks for letting me know.", "11:30"],
    ],
  },
  {
    idx: 8,
    name: "Eglė S.",
    time: "Mon",
    unread: false,
    msgs: [
      ["me", "Is the Tucson still under factory warranty?", "18:20"],
      ["them", "Yes, until 2028 or 100k km. First registered 03/2023.", "19:02"],
    ],
  },
];

export function MessagesClient() {
  const params = useSearchParams();
  const [active, setActive] = useState(() => {
    const lid = Number(params.get("listing"));
    if (!lid) return 0;
    return Math.max(
      0,
      THREADS.findIndex((t) => LISTINGS[t.idx].id === lid),
    );
  });
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<Record<number, Msg[]>>({});

  const thread = THREADS[active];
  const listing = LISTINGS[thread.idx];
  const allMsgs = [...thread.msgs, ...(extra[active] || [])];

  const send = () => {
    if (!draft.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setExtra({ ...extra, [active]: [...(extra[active] || []), ["me", draft.trim(), time]] });
    setDraft("");
  };

  return (
    <div className="flex h-screen flex-col">
      <InnerHeader active="Messages" right="avatar" />
      <div className="grid min-h-0 flex-1 grid-cols-[340px_1fr]">
        {/* Thread list */}
        <aside className="overflow-y-auto border-r border-hairline">
          <div className="px-[22px] pb-3 pt-5 text-[17px] font-extrabold">Messages</div>
          {THREADS.map((t, i) => {
            const l = LISTINGS[t.idx];
            const last = [...t.msgs, ...(extra[i] || [])].slice(-1)[0];
            const unread = t.unread && i !== active;
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => setActive(i)}
                className={`flex w-full cursor-pointer gap-3 px-[22px] py-3.5 text-left ${
                  i === active
                    ? "border-l-[3px] border-accent bg-[#F5F8FF]"
                    : "border-l-[3px] border-transparent bg-white"
                }`}
              >
                <span
                  className="h-10 w-[52px] shrink-0 rounded-lg"
                  style={{ background: stripe(l.id) }}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-2">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-extrabold">
                      {t.name}
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold text-[#9AA1AC]">{t.time}</span>
                  </span>
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-muted">
                    {l.make} {l.model} – {l.year}
                  </span>
                  <span
                    className={`block overflow-hidden text-ellipsis whitespace-nowrap text-xs ${
                      unread ? "font-bold text-ink" : "font-medium text-[#9AA1AC]"
                    }`}
                  >
                    {(last[0] === "me" ? "You: " : "") + last[1]}
                  </span>
                </span>
                {unread && <span className="h-2 w-2 shrink-0 self-center rounded-full bg-accent" />}
              </button>
            );
          })}
        </aside>

        {/* Conversation */}
        <main className="flex min-h-0 flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-hairline px-[26px] py-3.5">
            <div className="flex items-center gap-3">
              <span className="h-[42px] w-14 rounded-lg" style={{ background: stripe(listing.id) }} />
              <div>
                <div className="text-[14.5px] font-extrabold">{thread.name}</div>
                <Link
                  href={`/listing/${listing.id}`}
                  className="text-[12.5px] font-bold text-accent"
                >
                  {listing.make} {listing.model} · {fmtPrice(listing.price)} ↗
                </Link>
              </div>
            </div>
            <span className="text-xs font-bold text-badge-green">● Online</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[#FAFBFC] px-[26px] py-6">
            {allMsgs.map(([who, body, time], i) => (
              <div
                key={i}
                className={`max-w-[62%] px-4 py-[11px] text-[13.5px] font-medium leading-[1.55] ${
                  who === "me"
                    ? "self-end rounded-[14px_14px_4px_14px] bg-accent text-white"
                    : "self-start rounded-[14px_14px_14px_4px] bg-white text-ink"
                }`}
              >
                {body}
                <div className="mt-1 text-right text-[10.5px] opacity-60">{time}</div>
              </div>
            ))}
          </div>
          <div className="flex shrink-0 gap-2.5 border-t border-hairline px-[26px] py-4">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Write a message…"
              className="flex-1 rounded-xl border border-line px-4 py-[13px] text-sm outline-none"
            />
            <button
              type="button"
              onClick={send}
              className="flex cursor-pointer items-center rounded-xl bg-accent px-[26px] py-[13px] text-sm font-bold text-white"
            >
              Send
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
