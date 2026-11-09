import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, MessageSquare, ExternalLink, Shield, Lock, 
  HelpCircle, Sparkles, CheckCircle2, ChevronRight, Bell 
} from 'lucide-react';
import CustomerPortal from './components/CustomerPortal';
import GameShowcase from './components/GameShowcase';
import FeedbackModal from './components/FeedbackModal';
import AdminPanel from './components/AdminPanel';
import { api } from './utils/api';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [storeData, setStoreData] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Sync route
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Determine slug from URL: e.g. /store/magazam or default
  const isStoreRoute = currentPath.startsWith('/store/');
  const slugFromUrl = isStoreRoute ? currentPath.replace('/store/', '').split('/')[0] : '';

  // Fetch Store Info
  useEffect(() => {
    api.getStoreInfo(slugFromUrl).then(res => {
      if (res?.store) {
        setStoreData(res);
        if (res.store.tabTitle) {
          document.title = res.store.tabTitle;
        }
      }
    }).catch(err => {
      console.warn('Failed to load store info:', err);
    });
  }, [slugFromUrl]);

  const isAdmin = currentPath.startsWith('/admin');

  if (isAdmin) {
    return <AdminPanel onNavigateHome={() => navigateTo('/')} />;
  }

  const store = storeData?.store || {
    storeName: 'Flexora Doğrulama Portalı',
    slogan: '7/24 Otomatik Doğrulama Kodu & Hesap Teslimatı',
    announcement: '🔥 Flexora sistemine hoş geldiniz! Keyinizi girerek anında kodunuzu veya hesap bilgilerinizi alabilirsiniz.'
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Announcement Bar */}
      {store.announcement && !announcementDismissed && (
        <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-indigo-900/80 border-b border-indigo-500/20 py-2.5 px-4 text-center text-xs text-indigo-100 flex items-center justify-center gap-2 backdrop-blur-md">
          <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium">{store.announcement}</span>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="text-indigo-300 hover:text-white text-xs ml-3 px-1.5 py-0.5 rounded bg-indigo-950/60"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Header / Navbar */}
      <header className="w-full max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wider flex items-center gap-2">
              <span>{store.storeName}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                7/24 Aktif
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">{store.slogan}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeedbackOpen(true)}
            className="py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">İstek / Öneri</span>
          </button>

          <button
            onClick={() => navigateTo('/admin')}
            className="py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Panel Girişi</span>
          </button>
        </div>
      </header>

      {/* Hero Section & Customer Portal */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Hero titles */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Siz Uyurken Bile Kesintisiz Otomatik Teslimat</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Anında Doğrulama Kodu & Hesap Teslimatı
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            Steam, Netflix, ChatGPT, Epic Games ve 2FA Authenticator kodlarınızı satıcıyı beklemeden 7/24 anında kendiniz alın.
          </p>
        </div>

        {/* Customer Key Checker & Deliveries Component */}
        <CustomerPortal
          storeSettings={store}
          onOpenFeedback={() => setFeedbackOpen(true)}
        />

        {/* Public Storefront Game Showcase */}
        {storeData?.games && storeData.games.length > 0 && (
          <GameShowcase games={storeData.games} />
        )}
      </main>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />

      {/* Modern Sleek Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>&copy; {new Date().getFullYear()} {store.storeName}. Powered by <strong>Flexora Enterprise</strong>.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> %100 Güvenli & Otomatik
            </span>
            <button
              onClick={() => navigateTo('/admin')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Yönetici Paneli
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
