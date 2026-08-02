import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "section" | "article";
  animatedBorder?: boolean;
};

/** Glassmorphic luxury card with hover elevation + optional animated gold border. */
export function LuxeCard({
  as: Tag = "div",
  animatedBorder = true,
  className,
  children,
  ...rest
}: Props) {
  return (
    <Tag
      className={cn(
        "luxe-card p-5 sm:p-6",
        animatedBorder && "luxe-border-anim",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function LuxeCardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn("font-display text-2xl tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function LuxeCardMeta({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("mt-1 text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}
