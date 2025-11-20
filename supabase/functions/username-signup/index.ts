// Edge Function: username-signup
// Creates an auth user using a provided handle (username) and password.
// If email is omitted, generates a placeholder email and confirms it.
// Also inserts a row into public.users with the same id + handle.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type Payload = {
  handle: string;
  password: string;
  email?: string | null;
  name?: string | null;
};

function validateHandle(h: string) {
  if (!h) return false;
  if (h.length < 3 || h.length > 30) return false;
  if (!/^[a-z0-9_]+$/.test(h)) return false;
  if (/__+/.test(h)) return false;
  if (/^_|_$/.test(h)) return false;
  return true;
}

serve(async (req) => {
  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
    } as const;

    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST")
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: corsHeaders });
    let stage = "parse-body";
    const body = (await req.json()) as Payload;
    const handle = (body.handle || "").toLowerCase().trim();
    const password = body.password || "";
    const emailRaw = (body.email || "").trim();
    const name = body.name?.trim() || "";

    stage = "validate";
    if (!validateHandle(handle))
      return new Response(JSON.stringify({ error: "Invalid handle format" }), { status: 400, headers: corsHeaders });
    if (password.length < 6)
      return new Response(JSON.stringify({ error: "Password too short" }), { status: 400, headers: corsHeaders });

    stage = "read-env";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    // NOTE: Edge Function secrets cannot start with SUPABASE_. Use SERVICE_ROLE_KEY.
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing env", stage }), { status: 500, headers: corsHeaders });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Ensure handle is unique in public.users
    stage = "check-handle";
    const { data: existing, error: existsErr } = await admin
      .from("users")
      .select("id")
      .eq("handle", handle)
      .limit(1);
    if (existsErr)
      return new Response(JSON.stringify({ error: existsErr.message }), { status: 500, headers: corsHeaders });
    if (existing && existing.length > 0)
      return new Response(JSON.stringify({ error: "Handle already taken" }), { status: 409, headers: corsHeaders });

    const fallbackDomain = "users.local.sona"; // non-routable app domain
    const email = emailRaw || `${handle}@${fallbackDomain}`;

    // Create auth user and auto-confirm (idempotent handling for existing email)
    let uid: string | null = null;
    stage = "create-user";
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { signup_via: "username" },
    });
    if (createErr || !created?.user) {
      const msg = createErr?.message || "Create failed";
      const lower = msg.toLowerCase();
      if (lower.includes("already registered") || lower.includes("already exists") || lower.includes("duplicate")) {
        // Lookup existing auth user by email via auth schema
        stage = "lookup-auth";
        const { data: authUser, error: authLookupErr } = await admin
          .schema("auth")
          .from("users")
          .select("id")
          .eq("email", email)
          .limit(1)
          .maybeSingle();
        if (authLookupErr || !authUser?.id) {
          return new Response(JSON.stringify({ error: msg, stage }), { status: 409, headers: corsHeaders });
        }
        uid = authUser.id as string;
      } else {
        return new Response(JSON.stringify({ error: msg, stage, details: createErr }), { status: 500, headers: corsHeaders });
      }
    } else {
      uid = created.user.id;
    }

    // Insert minimal profile row (avoid depending on optional columns)
    // Upsert profile row (idempotent across retries)
    stage = "upsert-profile";
    const { error: upsertErr } = await admin
      .from("users")
      .upsert({ id: uid, handle, name: name || null }, { onConflict: "id" });
    if (upsertErr) {
      const msg = upsertErr.message || "Insert failed";
      const lower = msg.toLowerCase();
      if (lower.includes("duplicate") || lower.includes("unique")) {
        return new Response(JSON.stringify({ error: "Handle already taken", stage }), { status: 409, headers: corsHeaders });
      }
      return new Response(JSON.stringify({ error: msg, stage }), { status: 500, headers: corsHeaders });
    }

    return new Response(
      JSON.stringify({ ok: true, user_id: uid, email_used: email, handle }),
      { headers: corsHeaders, status: 200 },
    );
  } catch (e) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
    } as const;
    const anyE: any = e;
    return new Response(JSON.stringify({ error: anyE?.message || "Unknown error", stage: (anyE && anyE.stage) || undefined, stack: anyE?.stack || undefined }), { status: 500, headers: corsHeaders });
  }
});
