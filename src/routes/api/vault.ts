import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/vault")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const email = (url.searchParams.get("email") ?? "").toLowerCase();
        if (!email) return Response.json({ plans: [] });

        const { data: user } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (!user) return Response.json({ plans: [] });

        const { data: pays } = await supabaseAdmin
          .from("payments")
          .select("plan")
          .eq("user_id", user.id)
          .eq("status", "success");

        const plans = Array.from(new Set((pays ?? []).map((p) => p.plan)));
        return Response.json({ plans });
      },
    },
  },
});
