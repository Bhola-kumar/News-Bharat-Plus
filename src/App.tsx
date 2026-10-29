/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNewsStore, isAuthorizedAdminEmail, getAuthorizedAdminEmails } from './lib/newsStore';
import { Article } from './types/news';
import { useLanguage } from './lib/i18n';
import { getGoogleClientId, initializeGoogleIdentity } from './lib/googleAuth';
import { Shield, AlertTriangle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

// Public Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BreakingTicker } from './components/BreakingTicker';
import { AuthModal } from './components/AuthModal';

// Public Pages
import { HomePage } from './pages/HomePage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { DistrictPage } from './pages/DistrictPage';
import { CategoryPage } from './pages/CategoryPage';
import { VideosPage } from './pages/VideosPage';
import { SearchPage } from './pages/SearchPage';
import { StaticPages } from './pages/StaticPages';

// Admin Components
import { AdminLayout, AdminTab } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCreateEditNews } from './pages/admin/AdminCreateEditNews';
import { AdminManageNews } from './pages/admin/AdminManageNews';
import { AdminAdManager } from './pages/admin/AdminAdManager';
import { AdminInbox } from './pages/admin/AdminInbox';
import { AdminMediaLibrary } from './pages/admin/AdminMediaLibrary';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminUsersAnalytics } from './pages/admin/AdminUsersAnalytics';

export default function App() {
  const store = useNewsStore();
  const { language, t } = useLanguage();
  const currentUser = store.getCurrentUser();

  // Navigation State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('admin=true')) return '/admin';
      return window.location.pathname || '/';
    }
    return '/';
  });
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  
  // Correction modal / draft state
  const [correctionArticle, setCorrectionArticle] = useState<Article | null>(null);

  // Admin Tab & Edit ID
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [editArticleId, setEditArticleId] = useState<string | null>(null);

  // Reader Auth Modal State (Strictly for readers on consumer site)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTitle, setAuthTitle] = useState('Reader Sign In');
  const [authMessage, setAuthMessage] = useState('Sign in with your Google account to submit suggestions, corrections, or advertising inquiries.');
  const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);

  // Admin SSO Gate States (Strictly on /admin)
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminGoogleEmail, setAdminGoogleEmail] = useState('');
  const [promptAdminEmail, setPromptAdminEmail] = useState(false);
  const [adminIsSigningIn, setAdminIsSigningIn] = useState(false);

  const clientId = getGoogleClientId();

  // Listen to browser popstate (back/forward) & query params
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      if (search.includes('admin=true') || path.startsWith('/admin')) {
        setCurrentPath('/admin');
      } else if (path.startsWith('/article/')) {
        setSelectedArticleSlug(path.replace('/article/', ''));
        setCurrentPath(path);
      } else {
        setSelectedArticleSlug(null);
        setCurrentPath(path || '/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);



  const navigateTo = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo(0, 0);
    }

    if (path.startsWith('/article/')) {
      setSelectedArticleSlug(path.replace('/article/', ''));
    } else {
      setSelectedArticleSlug(null);
    }

    store.recordUserActivity(path, `Viewing ${path}`);
  };

  const handleSelectArticle = (slug: string) => {
    setSelectedArticleSlug(slug);
    navigateTo(`/article/${slug}`);
  };

  const handleOpenAuth = (message?: string, onSuccess?: () => void) => {
    setAuthTitle(language === 'hi' ? 'पाठक लॉगिन' : 'Reader Sign In');
    if (message) setAuthMessage(message);
    if (onSuccess) setAuthSuccessCallback(() => onSuccess);
    setAuthModalOpen(true);
  };

  const handleOpenCorrection = (article: Article) => {
    setCorrectionArticle(article);
    navigateTo('/suggestion');
  };

  const isStaff = currentUser?.role === 'editor' || currentUser?.role === 'admin';
  const isAdminView = currentPath.startsWith('/admin');

  // Handle Admin Google SSO
  const processAdminSsoEmail = (email: string, name?: string) => {
    setAdminAuthError(null);
    setAdminIsSigningIn(true);

    const cleanEmail = email.trim().toLowerCase();
    const authorized = isAuthorizedAdminEmail(cleanEmail);

    setTimeout(() => {
      setAdminIsSigningIn(false);
      if (authorized) {
        const adminName = name || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        store.login(adminName, cleanEmail, 'admin');
        setPromptAdminEmail(false);
      } else {
        setAdminAuthError(
          `Access Denied: "${cleanEmail}" is not authorized. Configured admin emails: ${getAuthorizedAdminEmails().join(', ')}`
        );
      }
    }, 400);
  };

  // --- RENDER ADMIN PORTAL IF PATH IS /admin ---
  if (isAdminView) {
    if (!isStaff) {
      return (
        <div className="min-h-screen bg-stone-900 text-stone-200 flex flex-col justify-center items-center p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-2xl max-w-md w-full p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-black font-serif">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">
                Editorial & Admin Portal
              </h1>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                This restricted portal is for authorized editors and administrators of News Bharat Plus.
              </p>
            </div>

            {/* Error banner if email not in VITE_ADMIN_EMAILS */}
            {adminAuthError && (
              <div className="p-3 bg-red-950/80 border border-red-700 rounded-xl text-left text-xs text-red-200 flex items-start gap-2">
                <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{adminAuthError}</div>
              </div>
            )}

            {/* Prompt for Google Email if Client ID not set or custom prompt */}
            {promptAdminEmail ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  processAdminSsoEmail(adminGoogleEmail);
                }}
                className="space-y-3 pt-2 text-left"
              >
                <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl">
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Enter your authorized Google Email:
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={adminGoogleEmail}
                    onChange={(e) => setAdminGoogleEmail(e.target.value)}
                    placeholder="thisisrajukumar14@gmail.com"
                    className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-950 text-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Authorized in environment: <span className="font-mono text-red-400">{getAuthorizedAdminEmails().join(', ')}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setPromptAdminEmail(false); setAdminAuthError(null); }}
                    className="flex-1 py-2 text-xs font-semibold text-stone-400 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adminIsSigningIn}
                    className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {adminIsSigningIn ? 'Verifying...' : 'Sign In with SSO'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 pt-1">
                {/* Real Google SSO Button for Staff */}
                <button
                  type="button"
                  onClick={() => {
                    if (clientId && window.google?.accounts?.id) {
                      initializeGoogleIdentity((user) => {
                        processAdminSsoEmail(user.email, user.name);
                      });
                      window.google.accounts.id.prompt();
                    } else {
                      setPromptAdminEmail(true);
                    }
                  }}
                  disabled={adminIsSigningIn}
                  className="w-full py-3 px-4 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {/* Google G Logo */}
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
                    {adminIsSigningIn ? 'Signing In...' : 'Continue with Google (Staff SSO)'}
                  </span>
                </button>

                <p className="text-[11px] text-stone-400 leading-relaxed pt-1">
                  Only accounts listed in <code className="text-red-400 bg-stone-900 px-1 py-0.5 rounded font-mono">VITE_ADMIN_EMAILS</code> are granted access.
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => navigateTo('/')}
                className="w-full py-2 px-4 bg-transparent hover:bg-stone-900 text-stone-400 hover:text-stone-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {t('returnHome')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Authenticated Staff View
    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => {
          setAdminTab(tab);
          if (tab !== 'create_news') setEditArticleId(null);
        }}
        onNavigatePublic={navigateTo}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onSelectTab={setAdminTab}
            onEditArticle={(id) => {
              setEditArticleId(id);
              setAdminTab('create_news');
            }}
          />
        )}
        {adminTab === 'users_analytics' && <AdminUsersAnalytics />}
        {adminTab === 'create_news' && (
          <AdminCreateEditNews
            editArticleId={editArticleId}
            onBack={() => setAdminTab('manage_news')}
            onSaveSuccess={() => {
              setEditArticleId(null);
              setAdminTab('manage_news');
            }}
          />
        )}
        {adminTab === 'manage_news' && (
          <AdminManageNews
            onEditArticle={(id) => {
              setEditArticleId(id);
              setAdminTab('create_news');
            }}
            onCreateNew={() => {
              setEditArticleId(null);
              setAdminTab('create_news');
            }}
          />
        )}
        {adminTab === 'ads' && <AdminAdManager />}
        {adminTab === 'inbox' && <AdminInbox />}
        {adminTab === 'media' && <AdminMediaLibrary />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // --- PUBLIC CONSUMER WEBSITE ---
  let pageContent = null;

  if (selectedArticleSlug || currentPath.startsWith('/article/')) {
    const slug = selectedArticleSlug || currentPath.replace('/article/', '');
    pageContent = (
      <ArticleDetailPage
        slug={slug}
        onNavigate={navigateTo}
        onOpenCorrectionModal={handleOpenCorrection}
      />
    );
  } else if (currentPath.startsWith('/district/')) {
    const distId = currentPath.replace('/district/', '');
    pageContent = (
      <DistrictPage
        districtId={distId}
        onSelectArticle={handleSelectArticle}
        onNavigate={navigateTo}
      />
    );
  } else if (currentPath.startsWith('/category/')) {
    const cat = currentPath.replace('/category/', '') as 'bihar' | 'national';
    pageContent = (
      <CategoryPage
        type={cat}
        onSelectArticle={handleSelectArticle}
        onNavigate={navigateTo}
      />
    );
  } else if (currentPath.startsWith('/topic/')) {
    const topic = currentPath.replace('/topic/', '');
    pageContent = (
      <CategoryPage
        type="topic"
        topicSlug={topic}
        onSelectArticle={handleSelectArticle}
        onNavigate={navigateTo}
      />
    );
  } else if (currentPath === '/videos') {
    pageContent = <VideosPage onSelectArticle={handleSelectArticle} />;
  } else if (currentPath === '/all-news' || currentPath.startsWith('/search')) {
    const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') || '' : '';
    pageContent = (
      <SearchPage
        initialQuery={q}
        onSelectArticle={handleSelectArticle}
      />
    );
  } else if (currentPath === '/about') {
    pageContent = <StaticPages type="about" onOpenAuth={() => handleOpenAuth()} />;
  } else if (currentPath === '/contact') {
    pageContent = <StaticPages type="contact" onOpenAuth={() => handleOpenAuth()} />;
  } else if (currentPath === '/suggestion') {
    pageContent = (
      <StaticPages
        type="suggestion"
        onOpenAuth={() => handleOpenAuth()}
        preselectedArticle={correctionArticle ? { id: correctionArticle.id, headline: correctionArticle.headline } : undefined}
      />
    );
  } else if (currentPath === '/editorial-policy') {
    pageContent = <StaticPages type="editorial" onOpenAuth={() => handleOpenAuth()} />;
  } else if (currentPath === '/privacy-policy') {
    pageContent = <StaticPages type="privacy" onOpenAuth={() => handleOpenAuth()} />;
  } else if (currentPath === '/grievance') {
    pageContent = <StaticPages type="grievance" onOpenAuth={() => handleOpenAuth()} />;
  } else {
    // Default: Home Page
    pageContent = (
      <HomePage
        onSelectArticle={handleSelectArticle}
        onNavigate={navigateTo}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900">
      {/* 1. Header with Logo, District Dropdown & Search (Strictly consumer, with Language Changer) */}
      <Header
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenAuth={() => handleOpenAuth()}
      />

      {/* 2. Breaking News Ticker (Visible ONLY when active breaking news exists) */}
      <BreakingTicker onSelectArticle={handleSelectArticle} />

      {/* 3. Main Page Content View */}
      <main className="flex-1 pb-12">
        {pageContent}
      </main>

      {/* 4. Footer with Policies, Contacts, and Disclaimers */}
      <Footer onNavigate={navigateTo} />

      {/* SSO Auth Modal for Readers ONLY (No admin/staff buttons on consumer site) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authTitle}
        message={authMessage}
        onSuccess={() => {
          if (authSuccessCallback) {
            authSuccessCallback();
            setAuthSuccessCallback(null);
          }
        }}
      />
    </div>
  );
}
