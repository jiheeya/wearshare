import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/items/new", "/my"];

export function proxy(request: NextRequest) {
  const isProtected = PROTECTED.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected) {
    const hasCookie = request.cookies.getAll().some((c) =>
      c.name.includes("supabase") || c.name.includes("sb-")
    );
    if (!hasCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
