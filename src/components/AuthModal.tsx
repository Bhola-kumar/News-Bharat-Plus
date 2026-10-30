/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Lock, User, X } from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { useLanguage } from '../lib/i18n';
import { getGoogleClientId, initializeGoogleIdentity } from '../lib/googleAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, title, message, onSuccess }) => {
  const store = useNewsStore();
  const { language, t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const clientId = getGoogleClientId();

  useEffect(() => {
    if (!isOpen || !clientId) return;
    let timer: number | undefined;
    let attempts = 0;
    const setupGoogleSignIn = () => {
      const googleId = window.google?.accounts?.id;
      if (!googleId) {
        if (attempts >= 20) {
          setAuthError('Google Identity Services did not load. Check the browser network policy and retry.');
          return;
        }
        attempts += 1;
        timer = window.setTimeout(setupGoogleSignIn, 250);
        return;
      }

      const initialized = initializeGoogleIdentity(user => {
        setIsProcessing(true);
        setAuthError('');
        if (!user.idToken) {
          setIsProcessing(false);
          setAuthError('Google did not return an ID token.');
          return;
        }
        void store.signInWithGoogleToken(user.idToken).then(account => {
          setIsProcessing(false);
          if (!account) {
            setAuthError(store.getDatabaseError() || 'Google sign-in failed.');
            return;
          }
          setSignedInEmail(account.email);
          window.setTimeout(() => {
            setSignedInEmail(null);
            onClose();
            onSuccess?.();
          }, 600);
        });
      });
      if (!initialized) {
        setAuthError('Google Identity could not be initialized.');
        return;
      }
      setIsGoogleReady(true);
      if (googleBtnRef.current) googleId.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 340,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      });
    };
    setIsGoogleReady(false);
    setAuthError('');
    setupGoogleSignIn();
    return () => { if (timer) window.clearTimeout(timer); };
  }, [isOpen, clientId, store, onClose, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-stone-200">
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 flex items-center justify-center text-red-500">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">{title || t('ssoTitle')}</h3>
              <p className="text-[11px] text-stone-400">
                {language === 'hi' ? 'Google खाते द्वारा सुरक्षित प्रवेश' : 'Secure reader authentication'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed text-center">{message || t('ssoSub')}</p>
          {signedInEmail ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold">{t('ssoAuthenticated')}</div>
                <div className="font-mono text-[11px] truncate">{signedInEmail}</div>
              </div>
            </div>
          ) : clientId ? (
            <>
              <div className="flex justify-center w-full min-h-[44px]"><div ref={googleBtnRef} className="flex justify-center w-full" /></div>
              {!isGoogleReady && <p className="text-xs text-center text-stone-500">Loading Google sign-in…</p>}
              {isProcessing && <p className="text-xs text-center text-stone-500">{t('ssoSigningIn')}</p>}
            </>
          ) : (
            <p className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              {language === 'hi'
                ? 'साइन-इन के लिए Google OAuth और Supabase प्रमाणीकरण कॉन्फ़िगर करें।'
                : 'Google OAuth and Supabase authentication must be configured to sign in.'}
            </p>
          )}
          {authError && (
            <p role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
              {authError}
            </p>
          )}
        </div>

        <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1"><Lock size={12} className="text-stone-400" />Google Account</span>
          <span className="text-stone-400">News Bharat Plus</span>
        </div>
      </div>
    </div>
  );
};
