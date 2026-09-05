import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { isUserAlreadyDeletedError, removeAllUserStorageObjects } from "./logic.ts";

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

  // Auth 삭제는 관계형 레코드만 cascade한다. UUID 폴더 기반의 public 게시 이미지와
  // private 프로필 사진은 서비스 역할로 먼저 정리해 고아 Storage 객체를 남기지 않는다.
  // 1000개를 넘는 폴더는 removeAllUserStorageObjects가 내부적으로 여러 페이지에 걸쳐 처리한다.
  try {
    const [post, avatar] = await Promise.all([
      removeAllUserStorageObjects(admin, "post-images", user.id),
      removeAllUserStorageObjects(admin, "profile-avatars", user.id),
    ]);
    if (post.remaining || avatar.remaining) {
      // 안전장치(50페이지=5만 개)에 걸린 극단적인 경우 — auth는 아직 지우지 않는다.
      // 같은 요청을 다시 호출하면 이미 지운 객체는 건너뛰고 남은 것부터 이어서 처리한다.
      console.error("Storage cleanup hit the safety page limit; retry to continue", {
        userId: user.id,
        postRemaining: post.remaining,
        avatarRemaining: avatar.remaining,
      });
      return json({ error: "Account deletion is temporarily unavailable" }, 500);
    }
  } catch (error) {
    console.error("Could not remove account Storage objects", {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return json({ error: "Account deletion is temporarily unavailable" }, 500);
  }

  // Deleting auth.users cascades to profiles and personal records via existing FKs;
  // posts/comments survive with author_id set NULL (rendered as "탈퇴한 사용자") — rule-violation
  // bans that must erase content go through the operator-only admin_ban_user() SQL helper.
  // A duplicate/retried call whose token was still valid when it reached this point can race
  // with an already-completed deletion — GoTrue's "not found" in that case means the caller's
  // desired end-state (deleted) is already true, so it is success, not failure.
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError && !isUserAlreadyDeletedError(deleteError)) {
    console.error("Could not delete account", { userId: user.id, error: deleteError.message });
    return json({ error: "Account deletion is temporarily unavailable" }, 500);
  }

  return json({ deleted: true });
});
