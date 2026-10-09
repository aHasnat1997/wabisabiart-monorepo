import { NextRequest, NextResponse } from "next/server";

// ─── Route config ─────────────────────────────────────────────────────────────

/**
 * Paths that require the user to be authenticated (any role).
 * Supports exact strings and prefix patterns ending with "/*".
 */
const AUTHENTICATED_PATHS: string[] = [
  "/profile/*",
  "/profile/order",
  "/profile/inbox",
  "/profile/cart",
  "/profile/account",
];

/**
 * Paths that require a specific role.
 * The user must be authenticated AND have the listed role(s).
 */
const ROLE_PROTECTED_PATHS: { pattern: string; roles: string[] }[] = [
  { pattern: "/seller-dashboard/*", roles: ["seller"] },
  { pattern: "/seller-dashboard", roles: ["seller"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesPattern(pathname: string, pattern: string): boolean {
  if (pattern.endsWith("/*")) {
    const base = pattern.slice(0, -2); // strip "/*"
    return pathname === base || pathname.startsWith(base + "/");
  }
  return pathname === pattern;
}

function isAuthenticatedPath(pathname: string): boolean {
  return AUTHENTICATED_PATHS.some((p) => matchesPattern(pathname, p));
}

function requiredRoles(pathname: string): string[] | null {
  const match = ROLE_PROTECTED_PATHS.find(({ pattern }) =>
    matchesPattern(pathname, pattern),
  );
  return match ? match.roles : null;
}

/**
 * Mirrors the logic in isUser() — matches the exact cookie name and
 * empty-string check your server auth uses.
 */
function getToken(req: NextRequest): string | undefined {
  const value = req.cookies.get("wsa-access-token")?.value;
  return value && value.length > 0 ? value : undefined;
}

/**
 * Decodes the role from the JWT payload without verifying the signature.
 * Full verification still happens on the server / API layer via profileInfo().
 *
 * Update the payload key below if your JWT uses a different field name
 * (e.g. payload.userRole, payload["custom:role"]).
 */
function getRoleFromToken(token: string): string | undefined {
  try {
    const [, base64Payload] = token.split(".");
    if (!base64Payload) return undefined;

    // atob is available in the Edge Runtime
    const json = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as Record<string, unknown>;

    return typeof payload.role === "string" ? payload.role : undefined;
  } catch {
    return undefined;
  }
}

// ─── Proxy ────────────────────────────────────────────────────────────────────

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = getToken(req);
  const isAuthenticated = Boolean(token);

  // ── 1. Unauthenticated user hitting a protected path ──────────────────────
  if (isAuthenticatedPath(pathname) && !isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "?signin-modal=signin";
    return NextResponse.redirect(url);
  }

  // ── 2. Role-gated path ────────────────────────────────────────────────────
  const roles = requiredRoles(pathname);
  if (roles) {
    // Not logged in → send to sign-in modal
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "?signin-modal=signin";
      return NextResponse.redirect(url);
    }

    // Logged in but wrong role → send to home silently
    const userRole = getRoleFromToken(token!);
    if (!userRole || !roles.includes(userRole)) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  /*
   * Run on all routes EXCEPT:
   *  - Next.js internals  (_next/static, _next/image)
   *  - Static files with extensions (favicon, images, fonts, etc.)
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)).*)",
  ],
};
