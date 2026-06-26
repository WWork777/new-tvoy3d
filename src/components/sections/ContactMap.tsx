import { ArrowUpRight } from "lucide-react";

const lat = 55.5833;
const lon = 38.9333;
const delta = 0.012;
const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
const openMapHref = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;

export function ContactMap({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-full overflow-hidden rounded-3xl glass p-2 ${className}`}>
      <div className="relative h-[420px] w-full overflow-hidden rounded-[1.4rem] sm:h-[480px]">
        <iframe
          title="Карта — Куровское, ул. Советская 105"
          src={mapSrc}
          className="absolute inset-0 h-full w-full grayscale-[15%]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(219,17,37,0.08)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.55))]" />
        <a
          href={openMapHref}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-background/85 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-md transition hover:bg-background"
        >
          Открыть карту <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
