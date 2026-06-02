import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const rutasProtegidas = ["/admin", "/usuario"];

  const requiereAuth = rutasProtegidas.some((ruta) =>
    pathname.startsWith(ruta)
  );

  if (requiereAuth && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/usuario/:path*"],
};
