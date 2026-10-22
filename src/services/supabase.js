const SUPABASE_URL = "https://qefzfgxrwktsrdmldfhx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZnpmZ3hyd2t0c3JkbWxkZmh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTg3ODcsImV4cCI6MjEwODIzNDc4N30.FUDlyopogKT7LDY0epAS7x0-3KHQrS3ezCfzZB3sJz0";

export async function fetchMappingsFromSupabase() {
  try {
    // Check count and fetch sample records
    const res = await fetch(`${SUPABASE_URL}/rest/v1/hits_gc_seller_mapping?select=*&limit=1000`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "count=exact"
      }
    });

    if (!res.ok) {
      throw new Error(`Supabase request failed with status ${res.status}`);
    }

    const contentRange = res.headers.get("content-range") || "";
    const totalCount = contentRange ? parseInt(contentRange.split("/")[1], 10) : 18749;
    const data = await res.json();

    return { data, totalCount, source: "supabase" };
  } catch (err) {
    console.warn("Supabase live connection check:", err.message);
    return { error: err.message, totalCount: 18749, source: "offline" };
  }
}