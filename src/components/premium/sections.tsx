import {
  Dumbbell,
  Salad,
  HeartPulse,
  Moon,
  Flower2,
  Pill,
  Users,
  Crown,
  Gift,
  LayoutDashboard,
  MessageCircleHeart,
} from "lucide-react";

export type SectionKey =
  | "fitness"
  | "nutrition"
  | "therapy"
  | "recovery"
  | "women"
  | "supplements"
  | "community"
  | "elite"
  | "referral"
  | "dashboard"
  | "coaching";

export type SectionTheme =
  | "theme-noir-gold"
  | "theme-rose-ivory"
  | "theme-emerald-obsidian"
  | "theme-sapphire-white"
  | "theme-platinum-black";

export const SECTIONS: Record<
  SectionKey,
  { label: string; icon: typeof Dumbbell; theme: SectionTheme; blurb: string }
> = {
  fitness: {
    label: "Fitness",
    icon: Dumbbell,
    theme: "theme-noir-gold",
    blurb: "10-minute home sessions engineered for real Lagos schedules.",
  },
  nutrition: {
    label: "Nutrition",
    icon: Salad,
    theme: "theme-emerald-obsidian",
    blurb: "Jollof-friendly fat-loss meals, portioned and swap-ready.",
  },
  therapy: {
    label: "Therapy",
    icon: HeartPulse,
    theme: "theme-emerald-obsidian",
    blurb: "Guided resets for stress, sleep debt and burnout.",
  },
  recovery: {
    label: "Recovery",
    icon: Moon,
    theme: "theme-sapphire-white",
    blurb: "Mobility, breathwork and deep-sleep protocols.",
  },
  women: {
    label: "Women's Wellness",
    icon: Flower2,
    theme: "theme-rose-ivory",
    blurb: "Cycle-aware training and hormone-friendly nutrition.",
  },
  supplements: {
    label: "Supplements",
    icon: Pill,
    theme: "theme-emerald-obsidian",
    blurb: "Only what moves the needle — no filler stacks.",
  },
  community: {
    label: "Community",
    icon: Users,
    theme: "theme-noir-gold",
    blurb: "Accountability circles that keep the streak alive.",
  },
  elite: {
    label: "Elite",
    icon: Crown,
    theme: "theme-platinum-black",
    blurb: "Concierge programming for members who want it handled.",
  },
  referral: {
    label: "Referral",
    icon: Gift,
    theme: "theme-noir-gold",
    blurb: "Invite friends, unlock cashback and bonus vault drops.",
  },
  dashboard: {
    label: "Dashboard",
    icon: LayoutDashboard,
    theme: "theme-noir-gold",
    blurb: "Your daily mission, streak and next best action.",
  },
  coaching: {
    label: "Coaching",
    icon: MessageCircleHeart,
    theme: "theme-sapphire-white",
    blurb: "ChatB2K checks in, adapts and nudges you forward.",
  },
};

/** Premium icon tile used across section headers and cards. */
export function SectionIcon({
  section,
  size = 22,
}: {
  section: SectionKey;
  size?: number;
}) {
  const Icon = SECTIONS[section].icon;
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary">
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}

/** Section wrapper that applies the section's theme automatically. */
export function ThemedSection({
  section,
  className = "",
  children,
}: {
  section: SectionKey;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${SECTIONS[section].theme} ${className}`}>
      {children}
    </section>
  );
}
