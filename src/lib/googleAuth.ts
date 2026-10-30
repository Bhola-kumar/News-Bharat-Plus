/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleUserPayload {
  email: string;
  name: string;
  idToken?: string;
  nonce?: string;
  picture?: string;
  sub?: string;
}

async function createNoncePair(): Promise<{ nonce: string; hashedNonce: string }> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure browser cryptography is unavailable. Use HTTPS to sign in with Google.');
  }
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = btoa(String.fromCharCode(...bytes));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(nonce));
  const hashedNonce = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  return { nonce, hashedNonce };
}

/**
 * Parses JWT id_token returned by Google Identity Services
 */
export function parseJwtPayload(token: string): Omit<GoogleUserPayload, 'idToken'> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getGoogleClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    return '';
  }
  return clientId.trim();
}

/**
 * Initializes Google One Tap / GIS button if Client ID is configured
 */
export async function initializeGoogleIdentity(onSuccess: (user: GoogleUserPayload) => void): Promise<boolean> {
  const clientId = getGoogleClientId();
  if (!clientId || typeof window === 'undefined' || !window.google?.accounts?.id) {
    return false;
  }

  const { nonce, hashedNonce } = await createNoncePair();
  window.google.accounts.id.initialize({
    client_id: clientId,
    nonce: hashedNonce,
    callback: (response: any) => {
      if (response.credential) {
        const payload = parseJwtPayload(response.credential);
        if (payload) {
          onSuccess({ ...payload, idToken: response.credential, nonce });
        }
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true
  });
  return true;
}
