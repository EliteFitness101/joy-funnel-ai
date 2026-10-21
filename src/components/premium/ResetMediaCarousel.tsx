import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const VIDEO = "/ResoFlex_7-Day_Reset_Kit_20261018175604.mp4";
const POSTER = "/bg-hero.svg";

const MOMENTS = [
  { eyebrow: "RESET · 01", title: "Keep meals familiar.", caption: "Build a steady routine around food you already know.", label: "Meals" },
  { eyebrow: "RESET · 02", title: "Move at your pace.", caption: "Short, approachable movement belongs in a real day.", label: "Movement" },
  { eyebrow: "RESET · 03", title: "Make consistency easier.", caption: "Small daily choices can help you keep your rhythm.", label: "Daily rhythm" },
  { eyebrow: "RESET · 04", title: "Come back tomorrow.", caption: "Progress is a practice, not a perfect streak.", label: "Consistency" },
];

type Props = { compact?: boolean; title?: string };

export function ResetMediaCarousel({ compact = false, title = "A closer look at your Reset" }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pausedByUser, setPausedByUser] = useState(false);
  const reduceMotion = useReducedMotion();
  const item = useMemo(() => MOMENTS[index % MOMENTS.length], [index]);
  const step = (delta: number) => {
    setPausedByUser(true);
    setIndex((current) => (current + delta + MOMENTS.length) % MOMENTS.length);
  };

  useEffect(() => {
    if (reduceMotion || playing || pausedByUser) return;
    const interval = setInterval(() => setIndex((current) => (current + 1) % MOMENTS.length), 7000);
    return () => clearInterval(interval);
  }, [playing, pausedByUser, reduceMotion]);

  return (
    <section aria-label={title} className="luxe-card overflow-hidden !p-0">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">Short preview · captions rotate · choose any topic</p>
        </div>
        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] text-primary">{index + 1} / {MOMENTS.length}</span>
      </div>
      <div className={`relative mt-4 overflow-hidden bg-black ${compact ? "aspect-[16/9]" : "aspect-[4/3] sm:aspect-[16/9]"}`}>
        <video
          key={VIDEO}
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEO}
          poster={POSTER}
          muted
          loop
          playsInline
          preload="none"
          controls
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label="ResoFlex Reset short video preview"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <AnimatePresence mode="wait">
          <motion.div
            key={item.eyebrow}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-none absolute inset-x-4 bottom-4 text-white sm:inset-x-5 sm:bottom-5"
          >
            <span className="inline-flex rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur-xl">{item.eyebrow} · {item.label}</span>
            <h3 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{item.title}</h3>
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-white/80 sm:text-sm">{item.caption}</p>
          </motion.div>
        </AnimatePresence>
        {!playing && <span className="pointer-events-none absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-xl"><Play size={16} fill="currentColor" /></span>}
      </div>
      <div className="flex items-center justify-between gap-3 p-3 sm:px-5 sm:py-4">
        <div className="flex flex-wrap gap-2">
          {MOMENTS.map((moment, i) => (
            <button key={moment.eyebrow} type="button" onClick={() => { setPausedByUser(true); setIndex(i); }} aria-pressed={index === i} className={`rounded-full px-3 py-2 text-xs transition ${index === i ? "bg-primary text-primary-foreground" : "border border-border bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
              {moment.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" aria-label="Previous preview caption" onClick={() => step(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/70 transition hover:border-primary/60"><ChevronLeft size={17} /></button>
          <button type="button" aria-label="Next preview caption" onClick={() => step(1)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/70 transition hover:border-primary/60"><ChevronRight size={17} /></button>
        </div>
      </div>
    </section>
  );
}
