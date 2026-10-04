import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getServerConfig } from "./lib/supabase/config";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");

  let user = null;
  try {
    const { url, key } = getServerConfig();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          const previous = response;
          response = NextResponse.next({ request });
          for (const name of ["Cache-Control", "Expires", "Pragma"]) {
            const value = previous.headers.get(name);
            if (value) response.headers.set(name, value);
          }
          for (const cookie of previous.cookies.getAll()) response.cookies.set(cookie);
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
          for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      user = data.user;
    }
  } catch {
    user = null;
  }

  if (!user) {
    const demoRole = request.cookies.get("yuran_demo_role")?.value;
    if (demoRole && ["admin", "staff", "orang_tua"].includes(demoRole)) {
      user = { id: `demo-${demoRole}`, email: `${demoRole}@yuran.demo` };
    }
  }

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    const redirect = NextResponse.redirect(loginUrl);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    for (const name of ["Cache-Control", "Expires", "Pragma"]) {
      const value = response.headers.get(name);
      if (value) redirect.headers.set(name, value);
    }
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/staff/:path*", "/orangtua/:path*", "/admin/:path*"],
};
