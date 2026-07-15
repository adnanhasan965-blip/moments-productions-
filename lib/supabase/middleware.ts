import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/" || // public marketing homepage
    path.startsWith("/login") ||
    path.startsWith("/auth") ||
    path.startsWith("/brand") || // style guide, no data
    path.startsWith("/print"); // tokenized share pages

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured (missing env vars in this environment),
  // never crash the whole site — just let public pages render and send
  // everything else to /login rather than throwing a 500.
  if (!url || !anonKey) {
    if (isPublic) return supabaseResponse;
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    return NextResponse.redirect(redirect);
  }

  let response = supabaseResponse;
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Do not run code between createServerClient and getUser() —
  // it can cause random logouts. Guard against transient auth/network
  // failures so an unreachable database never 500s the site.
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    user = null;
  }

  if (!user && !isPublic) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    return NextResponse.redirect(redirect);
  }

  return response;
}
