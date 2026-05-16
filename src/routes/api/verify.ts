import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/verify")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const reference = url.searchParams.get("reference");
        if (!reference) return Response.json({ error: "missing reference" }, { status: 400 });

        const { data } = await supabaseAdmin
          .from("payments")
          .select("status, plan")
          .eq("reference", reference)
          .maybeSingle();
        if (!data) return Response.json({ status: "unknown" });
        return Response.json({ status: data.status, plan: data.plan });
      },
    },
  },
});
