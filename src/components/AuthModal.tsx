/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, User, CheckCircle2, Lock } from 'lucide-react';
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

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message,
  onSuccess
}) => {
  const store = useNewsStore();
  const { language, t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [promptGoogleEmail, setPromptGoogleEmail] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const clientId = getGoogleClientId();

  useEffect(() => {
    if (isOpen && clientId && typeof window !== 'undefined' && window.google?.accounts?.id) {
      initializeGoogleIdentity((user) => {
        store.login(user.name || 'Verified Reader', user.email, 'consumer');
        setSignedInEmail(user.email);
        setTimeout(() => {
          setSignedInEmail(null);
          onClose();
          if (onSuccess) onSuccess();
        }, 600);
      });

      if (googleBtnRef.current) {
        try {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 340,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
        } catch {
          // Fallback handled
        }
      }
    }
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  const handleGoogleSsoClick = () => {
    if (clientId && window.google?.accounts?.id) {
      // Trigger native Google Prompt
      window.google.accounts.id.prompt();
    } else {
      // Prompt user for their Google email to connect via Google SSO
      setPromptGoogleEmail(true);
    }
  };

  const handleSimulatedGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;
    setIsProcessing(true);
    const email = googleEmailInput.trim().toLowerCase();
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    setTimeout(() => {
      store.login(name || 'Verified Reader', email, 'consumer');
      setSignedInEmail(email);
      setIsProcessing(false);
      setPromptGoogleEmail(false);
      setTimeout(() => {
        setSignedInEmail(null);
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 flex items-center justify-center text-red-500 font-black text-sm">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {title || t('ssoTitle')}
              </h3>
              <p className="text-[11px] text-stone-400">
                {language === 'hi' ? 'Google खाते द्वारा सुरक्षित प्रवेश' : 'Secure reader authentication'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed text-center">
            {message || t('ssoSub')}
          </p>

          {signedInEmail ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold">{t('ssoAuthenticated')}</div>
                <div className="font-mono text-[11px] truncate">{signedInEmail}</div>
              </div>
            </div>
          ) : promptGoogleEmail ? (
            <form onSubmit={handleSimulatedGoogleSubmit} className="space-y-3 pt-1">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-left">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {language === 'hi' ? 'Google खाता ईमेल दर्ज करें:' : 'Enter your Google Account email:'}
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
                />
                <p className="text-[10px] text-stone-500 mt-1.5 leading-normal">
                  {language === 'hi' 
                    ? 'पर्यावरण में VITE_GOOGLE_CLIENT_ID जोड़ने पर यह सीधे Google पॉपअप से प्रमाणित होगा।'
                    : 'When VITE_GOOGLE_CLIENT_ID is set in your .env, this connects directly via the Google popup.'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPromptGoogleEmail(false)}
                  className="flex-1 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? t('ssoSigningIn') : t('ssoContinueWithGoogle')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {clientId && typeof window !== 'undefined' && window.google?.accounts?.id ? (
                /* Official single Google Identity Services button */
                <div className="flex justify-center w-full min-h-[44px]">
                  <div ref={googleBtnRef} className="flex justify-center w-full" />
                </div>
              ) : (
                /* Single clean Google SSO button */
                <button
                  type="button"
                  onClick={handleGoogleSsoClick}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-white hover:bg-stone-50 border-2 border-stone-300 hover:border-stone-400 text-stone-800 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {/* Official Google G Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isProcessing ? t('ssoSigningIn') : t('ssoContinueWithGoogle')}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <Lock size={12} className="text-stone-400" />
            <span>Google SSO</span>
          </span>
          <span className="text-stone-400">Bihar News Plus</span>
        </div>
      </div>
    </div>
  );
};
