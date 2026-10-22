const SUPABASE_URL = "https://qefzfgxrwktsrdmldfhx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZnpmZ3hyd2t0c3JkbWxkZmh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTg3ODcsImV4cCI6MjEwODIzNDc4N30.FUDlyopogKT7LDY0epAS7x0-3KHQrS3ezCfzZB3sJz0";

export async function fetchMappingsFromSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/hits_gc_seller_mapping?select=*&order=gc_name.asc,seller_name.asc`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) {
      throw new Error(`Supabase request failed with status ${res.status}`);
    }

    const data = await res.json();
    return { data, source: "supabase" };
  } catch (err) {
    console.warn("Supabase fetch failed, falling back to local snapshot:", err);
    return { error: err.message, source: "fallback" };
  }
}