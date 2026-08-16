import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ error: "Authentication is required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Missing Supabase Edge Function environment configuration");
    return json({ error: "Account deletion is temporarily unavailable" }, 500);
  }

  // Validate the caller's bearer token before obtaining any administrative capability.
  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: userError } = await caller.auth.getUser();
  if (userError || !user) return json({ error: "Authentication is required" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Post images are stored under the authenticated user's UUID. Remove Storage
  // objects first because deleting auth.users only cascades relational records.
  const { data: files, error: listError } = await admin.storage
    .from("post-images")
    .list(user.id, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (listError) {
    console.error("Could not list account Storage objects", { userId: user.id, error: listError.message });
    return json({ error: "Account deletion is temporarily unavailable" }, 500);
  }

  if (files && files.length > 0) {
    const paths = files.filter(file => file.name).map(file => `${user.id}/${file.name}`);
    const { error: removeError } = await admin.storage.from("post-images").remove(paths);
    if (removeError) {
      console.error("Could not remove account Storage objects", { userId: user.id, error: removeError.message });
      return json({ error: "Account deletion is temporarily unavailable" }, 500);
    }
  }

  // Deleting auth.users cascades to profiles and relational records via existing FKs.
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Could not delete account", { userId: user.id, error: deleteError.message });
    return json({ error: "Account deletion is temporarily unavailable" }, 500);
  }

  return json({ deleted: true });
});
