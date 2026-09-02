"use client";

import { useEffect, useRef } from "react";

interface GlobePoint {
  city: string;
  lat: number;
  lng: number;
  v: number;
  lt: number;
}

const POINTS: GlobePoint[] = (
  [
    ["Vilnius", 54.69, 25.28, 12480, 1],
    ["Kaunas", 54.9, 23.9, 6910, 1],
    ["Klaipėda", 55.71, 21.13, 3640, 1],
    ["Šiauliai", 55.93, 23.31, 1870, 1],
    ["Panevėžys", 55.73, 24.36, 1310, 1],
    ["London", 51.51, -0.13, 2210, 0],
    ["Dublin", 53.35, -6.26, 1460, 0],
    ["Oslo", 59.91, 10.75, 1120, 0],
    ["Warsaw", 52.23, 21.01, 980, 0],
    ["Berlin", 52.52, 13.4, 840, 0],
    ["Riga", 56.95, 24.11, 760, 0],
    ["Chicago", 41.88, -87.63, 620, 0],
  ] as const
).map(([city, lat, lng, v, lt]) => ({ city, lat, lng, v, lt }));

const TOP_LOCATIONS: Array<[string, string, number]> = [
  ["Vilnius, LT", "12 480", 1],
  ["Kaunas, LT", "6 910", 1],
  ["Klaipėda, LT", "3 640", 1],
  ["London, UK", "2 210", 0],
  ["Šiauliai, LT", "1 870", 1],
  ["Dublin, IE", "1 460", 0],
  ["Panevėžys, LT", "1 310", 1],
  ["Oslo, NO", "1 120", 0],
  ["Warsaw, PL", "980", 0],
  ["Berlin, DE", "840", 0],
  ["Riga, LV", "760", 0],
  ["Chicago, US", "620", 0],
];

/** Full-screen modal rendering the visits globe with globe.gl (three.js),
 *  loaded on demand so the admin bundle stays light. */
export function GlobeModal({ onClose }: { onClose: () => void }) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let globe: { _destructor?: () => void } | null = null;
    (async () => {
      const { default: Globe } = await import("globe.gl");
      const node = nodeRef.current;
      if (disposed || !node) return;
      const g = new Globe(node, { rendererConfig: { antialias: true, alpha: true } })
        .width(670)
        .height(560)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
        .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
        .atmosphereColor("#6E8BFF")
        .pointsData(POINTS)
        .pointLat("lat")
        .pointLng("lng")
        .pointAltitude((d) => 0.03 + (d as GlobePoint).v / 26000)
        .pointRadius((d) => ((d as GlobePoint).lt ? 0.55 : 0.45))
        .pointColor((d) => ((d as GlobePoint).lt ? "#6E8BFF" : "#F59E0B"))
        .pointLabel((d) => {
          const p = d as GlobePoint;
          return `${p.city}: ${p.v.toLocaleString()} visits`;
        });
      g.pointOfView({ lat: 54, lng: 20, altitude: 1.7 }, 0);
      g.controls().autoRotate = true;
      g.controls().autoRotateSpeed = 0.5;
      g.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      globe = g;
    })();
    return () => {
      disposed = true;
      globe?._destructor?.();
    };
  }, []);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(5,11,32,.78)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid w-[940px] max-w-[94vw] grid-cols-[1fr_270px] overflow-hidden rounded-[20px] bg-[#0B1530] text-white"
      >
        <div className="relative h-[560px]">
          <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-white/50">
            Loading globe…
          </span>
          <div ref={nodeRef} className="absolute inset-0" />
        </div>
        <aside className="flex flex-col border-l border-white/10 px-6 py-[26px]">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-base font-extrabold">Visits by location</span>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-1.5 py-0.5 text-lg text-white/60"
            >
              ✕
            </button>
          </div>
          <div className="mb-[18px] text-[11.5px] font-semibold text-white/55">
            Last 14 days · 41 280 visits · drag to rotate
          </div>
          <div className="flex flex-1 flex-col gap-px overflow-y-auto">
            {TOP_LOCATIONS.map(([k, v, lt]) => (
              <div
                key={k}
                className="flex items-center justify-between border-b border-white/8 py-2 text-[13px] font-semibold"
              >
                <span className="flex items-center gap-[9px]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: lt ? "#6E8BFF" : "#F59E0B" }}
                  />
                  {k}
                </span>
                <span className="font-extrabold">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-[11.5px] font-semibold leading-[1.6] text-white/55">
            <span className="text-logo-accent">●</span> Lithuania — 78% of visits
            <br />
            <span className="text-[#F59E0B]">●</span> Abroad (mostly LT diaspora) — 22%
          </div>
        </aside>
      </div>
    </div>
  );
}
