import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { captureRefFromUrl, track } from "@/lib/funnel";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Redirecting you home…</p>
        <Link to="/" className="mt-6 inline-block text-primary underline">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ResoFlex™ 7-Day Reset — ₦1,000 Wellness Restart Plan for all" },
      {
        name: "description",
        content:
          "The ResoFlex 7-Day Reset Kit: African Health & Wellness Integrated  Ecosystem, 15-min Achievable Reward Based Plan. Download NowNowGym app for  ₦14,000 Cashback",
      },
      { property: "og:title", content: "ResoFlex™ 7-Day Reset — ₦1,000 Wellness Restart Plan for all" },
      { property: "og:description", content: "The ResoFlex 7-Day Reset Kit: African Health & Wellness Integrated  Ecosystem, 15-min Achievable Reward Based Plan. Download NowNowGym app for  ₦14,000 Cashback" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ResoFlex™ 7-Day Reset — ₦1,000 Wellness Restart Plan for all" },
      { name: "description", content: "The ResoFlex 7-Day Reset Kit: African Health & Wellness Integrated  Ecosystem, 15-min Achievable Reward Based Plan. Download NowNowGym app for  ₦14,000 Cashback" },
      { name: "twitter:description", content: "The ResoFlex 7-Day Reset Kit: African Health & Wellness Integrated  Ecosystem, 15-min Achievable Reward Based Plan. Download NowNowGym app for  ₦14,000 Cashback" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/h9FjQC7YZTQgoe6NGi2VssP5YW62/social-images/social-1778975600448-n1000-reset-mobile-optimized.webp_4.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/h9FjQC7YZTQgoe6NGi2VssP5YW62/social-images/social-1778975600448-n1000-reset-mobile-optimized.webp_4.webp" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    captureRefFromUrl();
    track("page_view", { path: window.location.pathname });
    return installBehaviorSignals({ page: window.location.pathname });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <MobileBottomNav />
    </QueryClientProvider>
  );
}

