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
  picture?: string;
  sub?: string;
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
export function initializeGoogleIdentity(onSuccess: (user: GoogleUserPayload) => void) {
  const clientId = getGoogleClientId();
  if (!clientId || typeof window === 'undefined' || !window.google?.accounts?.id) {
    return false;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response.credential) {
          const payload = parseJwtPayload(response.credential);
          if (payload) {
            onSuccess({ ...payload, idToken: response.credential });
          }
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });
    return true;
  } catch {
    return false;
  }
}
