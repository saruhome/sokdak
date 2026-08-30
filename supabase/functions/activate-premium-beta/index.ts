import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// 베타 전용 mock 결제: 인증된 사용자에게 결제 없이 프리미엄을 부여한다.
// is_premium은 트리거로 service_role만 쓸 수 있으므로 이 함수가 유일한 클라이언트 경로다.
// ponytail: 실결제(Stripe/Play Billing) 도입 시 이 함수를 영수증 검증 웹훅으로 교체하고 제거.

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
    return json({ error: "Premium activation is temporarily unavailable" }, 500);
  }

  // 관리 권한을 얻기 전에 호출자의 bearer 토큰을 검증한다 (delete-account와 동일 패턴).
  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: userError } = await caller.auth.getUser();
  if (userError || !user) return json({ error: "Authentication is required" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await admin
    .from("account_settings")
    .update({ is_premium: true })
    .eq("user_id", user.id);
  if (error) return json({ error: "Premium activation failed" }, 500);

  return json({ ok: true });
});
