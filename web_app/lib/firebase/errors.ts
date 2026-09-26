/** Firebase's sign-in error codes, in words a person can act on. */
export function friendlyError(error: unknown): string {
    const code = (error as { code?: string })?.code ?? '';
    if (/invalid-credential|wrong-password|user-not-found|invalid-email/.test(code)) return 'That email and password don’t match an account.';
    if (code.includes('too-many-requests')) return 'Too many attempts. Wait a moment and try again.';
    if (code.includes('network-request-failed')) return 'Couldn’t reach the sign-in service. Check your connection.';
    return 'Couldn’t sign you in. Please try again.';
}
