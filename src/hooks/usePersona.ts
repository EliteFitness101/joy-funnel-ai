import { useEffect, useState } from "react";
import { loadSession, getRef } from "@/lib/funnel";

export type Persona = {
  greeting: string;
  firstName?: string;
  isMember: boolean;
  isPremium: boolean;
  isReferred: boolean;
  /** Contextual next-best-action copy for CTAs. */
  nextAction: { label: string; to: string; note: string };
};

function greetingFor(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Presentation-only personalization: reads the existing localStorage funnel
 * session (no new backend calls) to tailor greeting + CTA copy.
 */
export function usePersona(): Persona {
  const [persona, setPersona] = useState<Persona>({
    greeting: "Welcome",
    isMember: false,
    isPremium: false,
    isReferred: false,
    nextAction: {
      label: "Start my 7-Day Reset — ₦1,000",
      to: "/checkout",
      note: "Pay once · Instant vault access",
    },
  });

  useEffect(() => {
    const s = loadSession();
    const plans = s.paid_plans ?? [];
    const isPremium = plans.includes("premium");
    const isMember = plans.length > 0 || Boolean(s.last_reference);
    const firstName = s.email?.split("@")[0];

    setPersona({
      greeting: greetingFor(),
      firstName,
      isMember,
      isPremium,
      isReferred: Boolean(getRef()),
      nextAction: isPremium
        ? {
            label: "Open my Premium Vault",
            to: "/vault",
            note: "21-day transformation unlocked",
          }
        : isMember
          ? {
              label: "Unlock Premium — ₦3,000",
              to: "/upgrade",
              note: "Faster results, 21-day system",
            }
          : {
              label: "Start my 7-Day Reset — ₦1,000",
              to: "/checkout",
              note: "Pay once · Instant vault access",
            },
    });
  }, []);

  return persona;
}
