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

async function removeUserStorageObjects(
  admin: ReturnType<typeof createClient>,
  bucket: "post-images" | "profile-avatars",
  userId: string,
) {
  const { data: files, error: listError } = await admin.storage
    .from(bucket)
    .list(userId, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (listError) throw new Error(`Could not list ${bucket}: ${listError.message}`);

  const paths = files?.filter(file => file.name).map(file => `${userId}/${file.name}`) ?? [];
  if (paths.length === 0) return;

  const { error: removeError } = await admin.storage.from(bucket).remove(paths);
  if (removeError) throw new Error(`Could not remove ${bucket}: ${removeError.message}`);
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

  // Auth 삭제는 관계형 레코드만 cascade한다. UUID 폴더 기반의 public 게시 이미지와
  // private 프로필 사진은 서비스 역할로 먼저 정리해 고아 Storage 객체를 남기지 않는다.
  try {
    await removeUserStorageObjects(admin, "post-images", user.id);
    await removeUserStorageObjects(admin, "profile-avatars", user.id);
  } catch (error) {
    console.error("Could not remove account Storage objects", {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return json({ error: "Account deletion is temporarily unavailable" }, 500);
  }

  // Deleting auth.users cascades to profiles and relational records via existing FKs.
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("Could not delete account", { userId: user.id, error: deleteError.message });
    return json({ error: "Account deletion is temporarily unavailable" }, 500);
  }

  return json({ deleted: true });
});
