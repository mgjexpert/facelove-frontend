import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const jar = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase Auth não configurado");
  return createServerClient(url, key, {
    cookies: {
      getAll() { return jar.getAll(); },
      setAll(changes) {
        try { changes.forEach(({ name, value, options }) => jar.set(name, value, options)); }
        catch { /* Next Server Component: a proxy refreshes the session. */ }
      },
    },
  });
}
