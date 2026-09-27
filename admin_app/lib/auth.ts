/**
 * The gateway's roles come from the Firebase custom claim `roles: [...]`
 * (set with scripts/grant-role.sh). The gateway enforces ADMIN on every
 * /*-service/admin/** call regardless; this check only keeps non-admins out
 * of the admin UI, so they get a clear page instead of a wall of 403s.
 *
 * Plain module (no 'use client'): the middleware, server components and the
 * login page all call it.
 */
export const ADMIN_ROLE = "ADMIN";

export function isAdmin(claims: Record<string, unknown> | null | undefined): boolean {
    const roles = claims?.roles;
    return Array.isArray(roles) && roles.includes(ADMIN_ROLE);
}
