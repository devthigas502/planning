import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  // Rotas públicas
  const publicPaths = ["/login", "/registro", "/api/auth"]
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Se está tentando acessar rota protegida sem estar logado
  if (!sessionCookie && !isPublicPath && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Se está logado e tentando acessar login/registro, redireciona para dashboard
  if (sessionCookie && (pathname === "/login" || pathname === "/registro")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
}
