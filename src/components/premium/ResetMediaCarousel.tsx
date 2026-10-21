import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const POSTER = "/bg-hero.svg";

// Every path below was confirmed in this repository's public/ directory.
const CLIPS = [
  { src: "/ResoFlex_7-Day_Reset_Kit_20261018171723.mp4", label: "Reset", eyebrow: "RESET · 01", title: "Start with one small reset.", caption: "A practical seven-day guide built around everyday routines." },
  { src: "/ResoFlex_7-Day_Reset_Kit_20261018174251.mp4", label: "Daily rhythm", eyebrow: "RESET · 02", title: "Make room for consistency.", caption: "Keep the next step simple enough to repeat tomorrow." },
  { src: "/ResoFlex_7-Day_Reset_Kit_20261018175604.mp4", label: "Meal ideas", eyebrow: "RESET · 03", title: "Keep meals familiar.", caption: "Build a steady routine around food you already know." },
  { src: "/Characters_cooking_in_kitchen_20260922084926.mp4", label: "Kitchen", eyebrow: "RESET · 04", title: "Bring the plan into your kitchen.", caption: "Make practical choices with the ingredients around you." },
  { src: "/Coach_Buchi_and_Candy_cooking_20260922084103.mp4", label: "Cooking", eyebrow: "RESET · 05", title: "Make healthy habits feel doable.", caption: "Turn everyday preparation into a repeatable routine." },
  { src: "/Seven_day_campaign_move_plan_20260922085200.mp4", label: "Movement", eyebrow: "RESET · 06", title: "Move at your pace.", caption: "Choose comfortable movement and build from there." },
];

type Props = { compact?: boolean; title?: string };

export function ResetMediaCarousel({ compact = false, title = "A closer look at your Reset" }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pausedByUser, setPausedByUser] = useState(false);
  const reduceMotion = useReducedMotion();
  const clip = CLIPS[index];
  const step = (delta: number) => {
    setPausedByUser(true);
    setPlaying(false);
    setIndex((current) => (current + delta + CLIPS.length) % CLIPS.length);
  };

  useEffect(() => {
    if (reduceMotion || playing || pausedByUser) return;
    const interval = setInterval(() => setIndex((current) => (current + 1) % CLIPS.length), 7000);
    return () => clearInterval(interval);
  }, [playing, pausedByUser, reduceMotion]);

  return (
    <section aria-label={title} className="luxe-card overflow-hidden !p-0">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">Short videos · rotating previews · choose a topic</p>
        </div>
        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] text-primary">{index + 1} / {CLIPS.length}</span>
      </div>
      <div className={`relative mt-4 overflow-hidden bg-black ${compact ? "aspect-[16/9]" : "aspect-[4/3] sm:aspect-[16/9]"}`}>
        <video
          key={clip.src}
          className="absolute inset-0 h-full w-full object-cover"
          src={clip.src}
          poster={POSTER}
          muted
          playsInline
          preload="none"
          controls
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setIndex((current) => (current + 1) % CLIPS.length); }}
          aria-label={`ResoFlex Reset preview: ${clip.label}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <AnimatePresence mode="wait">
          <motion.div
            key={clip.eyebrow}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-none absolute inset-x-4 bottom-4 text-white sm:inset-x-5 sm:bottom-5"
          >
            <span className="inline-flex rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur-xl">{clip.eyebrow} · {clip.label}</span>
            <h3 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{clip.title}</h3>
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-white/80 sm:text-sm">{clip.caption}</p>
          </motion.div>
        </AnimatePresence>
        {!playing && <span className="pointer-events-none absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-xl"><Play size={16} fill="currentColor" /></span>}
      </div>
      <div className="flex items-center justify-between gap-3 p-3 sm:px-5 sm:py-4">
        <div className="flex flex-wrap gap-2">
          {CLIPS.map((item, i) => (
            <button key={item.src} type="button" onClick={() => { setPausedByUser(true); setPlaying(false); setIndex(i); }} aria-pressed={index === i} className={`rounded-full px-3 py-2 text-xs transition ${index === i ? "bg-primary text-primary-foreground" : "border border-border bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" aria-label="Previous video preview" onClick={() => step(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/70 transition hover:border-primary/60"><ChevronLeft size={17} /></button>
          <button type="button" aria-label="Next video preview" onClick={() => step(1)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/70 transition hover:border-primary/60"><ChevronRight size={17} /></button>
        </div>
      </div>
    </section>
  );
}
