import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

const VIDEO = "/ResoFlex_7-Day_Reset_Kit_20261018175604.mp4";
const POSTER = "/bg-hero.svg";

/**
 * Mobile-first hero media. It requests the MP4 only when near the viewport,
 * autoplays muted when visible, pauses offscreen, and never forces sound.
 * Tap the media surface to toggle playback. Unmute sets volume to 33%.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !("IntersectionObserver" in window)) {
      setArmed(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setArmed(true);
        setVisible(true);
      } else {
        setVisible(false);
        video.pause();
        setPlaying(false);
      }
    }, { rootMargin: "160px 0px", threshold: 0.25 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !armed || !visible) return;
    video.load();
    if (!reduceMotion) {
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [armed, visible, reduceMotion]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    if (!nextMuted) video.volume = 0.33;
    setMuted(nextMuted);
  };

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-label="ResoFlex 7-Day Reset preview"
      className="hero-media luxe-border-anim group relative isolate aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-primary/25 bg-black shadow-2xl md:aspect-[5/4]"
    >
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? "Pause preview video" : "Play preview video"}
        className="absolute inset-0 z-10 block h-full w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-5px] focus-visible:outline-primary"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster={POSTER}
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={() => setReady(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label="Preview of the ResoFlex reset kit"
        >
          {armed && <source src={VIDEO} type="video/mp4" />}
        </video>
        <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/10" />
        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
          ResoFlex · The 7-Day Reset
        </span>
        <span className="absolute bottom-5 left-5 right-5 text-left text-white">
          <span className="block text-xs uppercase tracking-[0.2em] text-white/75">Simple structure. Real life.</span>
          <span className="mt-1 block font-display text-3xl leading-tight sm:text-4xl">Eat well. Move daily. Reset.</span>
          <span className="mt-2 block text-xs text-white/75">Preview video · Sound is off by default</span>
        </span>
        <AnimatePresence>
          {(!playing || !ready) && (
            <motion.span
              initial={reduceMotion ? false : { scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-black/45 text-white shadow-lg backdrop-blur-md"
              aria-hidden="true"
            >
              <Play size={21} fill="currentColor" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); togglePlayback(); }}
          aria-label={playing ? "Pause video" : "Play video"}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/60 text-white backdrop-blur-xl transition hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
        </button>
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); toggleMute(); }}
          aria-label={muted ? "Unmute video (33 percent volume)" : "Mute video"}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/60 text-white backdrop-blur-xl transition hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      </div>
    </motion.section>
  );
}
