import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"><rect width="16" height="10" fill="#141414"/><path d="M5 6.5 7 4.5 9 6.5 11 5 13 7H3z" fill="#D4AF37" opacity=".55"/></svg>`,
  );

type ImgProps = {
  src: string;
  alt: string;
  /** e.g. "16/9" — preserves layout, prevents CLS */
  ratio?: string;
  /** srcset candidates for responsive delivery */
  srcSet?: string;
  sizes?: string;
  /** optional modern formats; browser picks the first it supports */
  avif?: string;
  webp?: string;
  className?: string;
  priority?: boolean;
};

/**
 * Production image: lazy loading, blur-up placeholder, responsive srcset,
 * AVIF/WebP with automatic fallback, aspect-ratio lock, error fallback.
 */
export function SmartImage({
  src,
  alt,
  ratio = "16/9",
  srcSet,
  sizes = "(max-width: 768px) 100vw, 50vw",
  avif,
  webp,
  className,
  priority = false,
}: ImgProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card",
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      {!loaded && (
        <div className="luxe-shimmer absolute inset-0 bg-border/40" aria-hidden="true" />
      )}
      <picture>
        {avif && !failed && <source srcSet={avif} type="image/avif" />}
        {webp && !failed && <source srcSet={webp} type="image/webp" />}
        <img
          src={failed ? FALLBACK : src}
          srcSet={failed ? undefined : srcSet}
          sizes={sizes}
          alt={alt}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
          className={cn(
            "h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out",
            loaded ? "scale-100 opacity-100" : "scale-105 opacity-0",
          )}
        />
      </picture>
    </div>
  );
}

/**
 * Lightweight video card: poster first, lazy source attach, muted autoplay
 * only while visible, pauses off-screen.
 */
export function LuxeVideoCard({
  src,
  poster,
  label,
  ratio = "16/9",
  className,
}: {
  src: string;
  poster: string;
  label?: string;
  ratio?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          if (!reduce) void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={cn("luxe-card luxe-border-anim overflow-hidden !p-0", className)}
      style={{ aspectRatio: ratio }}
    >
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        className="h-full w-full object-cover"
      >
        {armed && <source src={src} type="video/mp4" />}
      </video>
      {label && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 text-sm font-semibold">
          {label}
        </div>
      )}
    </div>
  );
}
