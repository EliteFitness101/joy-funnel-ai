import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react";

const POSTER = "/bg-hero.svg";

type Clip = {
  src: string;
  label: string;
  eyebrow: string;
  title: string;
  caption: string;
};

const PREMIUM_CLIPS: Clip[] = [
  {
    src: "/Fitness_commercial_for_ResoFlex_…_20260921104853.mp4",
    label: "ResoFlex offer",
    eyebrow: "PREMIUM · OFFER",
    title: "Take the next step with ResoFlex.",
    caption: "Explore the next level of guided support.",
  },
  {
    src: "/Nigerian_fitness_advertisement_v…_20260921105647.mp4",
    label: "Fitness campaign",
    eyebrow: "PREMIUM · CAMPAIGN",
    title: "Build a routine that fits real life.",
    caption: "See the offer and choose the support that suits you.",
  },
];

const LIFESTYLE_CLIPS: Clip[] = [
  {
    src: "/Characters_cooking_in_kitchen_20260922084926.mp4",
    label: "From market to kitchen",
    eyebrow: "EVERYDAY WELLNESS · 01",
    title: "Bring practical choices into your kitchen.",
    caption: "Make the most of familiar ingredients and everyday meals.",
  },
  {
    src: "/Coach_Buchi_and_Candy_cooking_20260922084103.mp4",
    label: "Cooking together",
    eyebrow: "EVERYDAY WELLNESS · 02",
    title: "Keep healthy habits doable.",
    caption: "Turn simple preparation into a routine you can repeat.",
  },
  {
    src: "/Seven_day_campaign_move_plan_20260922085200.mp4",
    label: "Movement",
    eyebrow: "EVERYDAY WELLNESS · 03",
    title: "Move at a pace that works for you.",
    caption: "Start comfortably and build consistency over time.",
  },
  {
    src: "/Coach_Buchi_presenting_movement_…_20260922085715.mp4",
    label: "Daily movement",
    eyebrow: "EVERYDAY WELLNESS · 04",
    title: "Make space for movement.",
    caption: "Choose practical movement that fits your day.",
  },
  {
    src: "/Coaches_continue_90-day_wellness…_20260922090416.mp4",
    label: "Long-term habits",
    eyebrow: "EVERYDAY WELLNESS · 05",
    title: "Keep going beyond day one.",
    caption: "Build a rhythm around small, repeatable actions.",
  },
  {
    src: "/ResoFlex_7-Day_Reset_Kit_20261018171723.mp4",
    label: "Reset guide",
    eyebrow: "YOUR RESET · 06",
    title: "Start with one small reset.",
    caption: "A practical seven-day guide built around everyday routines.",
  },
  {
    src: "/ResoFlex_7-Day_Reset_Kit_20261018174251.mp4",
    label: "Daily rhythm",
    eyebrow: "YOUR RESET · 07",
    title: "Make room for consistency.",
    caption: "Keep the next step simple enough to repeat tomorrow.",
  },
  {
    src: "/ResoFlex_7-Day_Reset_Kit_20261018175604.mp4",
    label: "Meal ideas",
    eyebrow: "YOUR RESET · 08",
    title: "Keep meals familiar.",
    caption: "Build a steady routine around food you already know.",
  },
];

type Props = {
  compact?: boolean;
  title?: string;
  collection?: "lifestyle" | "premium";
};

export function ResetMediaCarousel({
  compact = false,
  title = "A closer look at your Reset",
  collection = "lifestyle",
}: Props) {
  const clips = collection === "premium" ? PREMIUM_CLIPS : LIFESTYLE_CLIPS;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [inView, setInView] = useState(false);
  const [soundPrompt, setSoundPrompt] = useState(false);
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clip = clips[index];

  const step = (delta: number) => {
    setPlaying(false);
    setSoundPrompt(false);
    setIndex((current) => (current + delta + clips.length) % clips.length);
  };

  useEffect(() => {
    const element = cardRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.55),
      { threshold: [0, 0.55, 0.8] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Dwell for three seconds while the card is mostly visible, then attempt
  // playback at 33% volume. Browsers may reject audible autoplay; in that case
  // play muted and offer a one-tap sound control.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    if (!inView || reduceMotion) {
      video.pause();
      setPlaying(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      if (cancelled || !videoRef.current) return;
      const activeVideo = videoRef.current;
      activeVideo.volume = 0.33;
      activeVideo.muted = false;
      try {
        await activeVideo.play();
        if (!cancelled) {
          setMuted(false);
          setPlaying(true);
          setSoundPrompt(false);
        }
      } catch {
        if (cancelled) return;
        activeVideo.muted = true;
        try {
          await activeVideo.play();
          if (!cancelled) {
            setMuted(true);
            setPlaying(true);
            setSoundPrompt(true);
          }
        } catch {
          if (!cancelled) {
            setPlaying(false);
            setSoundPrompt(true);
          }
        }
      }
    }, 3000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      video.pause();
      setPlaying(false);
    };
  }, [inView, index, reduceMotion, collection]);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.volume = 0.33;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (video.paused) void video.play().then(() => setPlaying(true)).catch(() => setSoundPrompt(true));
    setSoundPrompt(video.muted);
  }

  return (
    <section ref={cardRef} aria-label={title} className="luxe-card overflow-hidden !p-0">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-primary">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {collection === "premium" ? "Premium video offers · swipe or choose a preview" : "Lifestyle videos · kitchen, meals and movement"}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] text-primary">{index + 1} / {clips.length}</span>
      </div>

      <div className={`relative mt-4 overflow-hidden bg-black ${compact ? "aspect-[16/9]" : "aspect-[4/3] sm:aspect-[16/9]"}`}>
        <video
          key={clip.src}
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={clip.src}
          poster={POSTER}
          muted={muted}
          playsInline
          preload="none"
          controls
          onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setIndex((current) => (current + 1) % clips.length);
          }}
          aria-label={`ResoFlex video: ${clip.label}`}
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
        {soundPrompt && (
          <button type="button" onClick={toggleSound} className="absolute right-4 top-16 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/30 bg-black/70 px-4 text-xs font-semibold text-white backdrop-blur-xl" aria-label="Enable video sound at 33 percent volume">
            <VolumeX size={15} /> Tap for sound
          </button>
        )}
        {playing && !muted && (
          <button type="button" onClick={toggleSound} className="absolute right-4 top-16 grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur-xl" aria-label="Mute video">
            <Volume2 size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 p-3 sm:px-5 sm:py-4">
        <div className="flex flex-wrap gap-2">
          {clips.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => { setSoundPrompt(false); setIndex(i); }}
              aria-pressed={index === i}
              className={`rounded-full px-3 py-2 text-xs transition ${index === i ? "bg-primary text-primary-foreground" : "border border-border bg-background/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
            >
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
