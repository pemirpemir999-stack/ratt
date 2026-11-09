import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Mail, Key, Gamepad2, Settings, MessageSquare, 
  ShieldCheck, LogOut, ExternalLink, RefreshCw, Lock, User, 
  CheckCircle2, AlertCircle, ArrowUpRight, Clock, ShieldAlert, Sparkles 
} from 'lucide-react';
import { api } from '../utils/api';
import AdminAccounts from './AdminAccounts';
import AdminKeys from './AdminKeys';
import AdminPackages from './AdminPackages';
import AdminSettings from './AdminSettings';
import AdminFeedback from './AdminFeedback';
import AdminLicense from './AdminLicense';

export default function AdminPanel({ onNavigateHome }) {
  const [token, setToken] = useState(localStorage.getItem('flexora_admin_token') || localStorage.getItem('zguard_admin_token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin Data
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [keys, setKeys] = useState([]);
  const [packages, setPackages] = useState([]);
  const [games, setGames] = useState([]);
  const [storeSettings, setStoreSettings] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [license, setLicense] = useState(null);

  // Check login and fetch data
  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const res = await api.login(username, password);
      localStorage.setItem('flexora_admin_token', res.token);
      setToken(res.token);
    } catch (err) {
      setLoginError(err.message || 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('flexora_admin_token');
    localStorage.removeItem('zguard_admin_token');
    setToken(null);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        accountsRes,
        keysRes,
        packagesRes,
        gamesRes,
        settingsRes,
        feedbackRes,
        licenseRes
      ] = await Promise.all([
        api.getStats().catch(() => ({ stats: null, license: null })),
        api.getAccounts().catch(() => ({ accounts: [] })),
        api.getKeys().catch(() => ({ keys: [] })),
        api.getPackages().catch(() => ({ packages: [] })),
        api.getGames().catch(() => ({ games: [] })),
        api.getSettings().catch(() => ({ settings: null })),
        api.getFeedback().catch(() => ({ feedback: [] })),
        api.getLicense().catch(() => ({ license: null }))
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (accountsRes?.accounts) setAccounts(accountsRes.accounts);
      if (keysRes?.keys) setKeys(keysRes.keys);
      if (packagesRes?.packages) setPackages(packagesRes.packages);
      if (gamesRes?.games) setGames(gamesRes.games);
      if (settingsRes?.settings) setStoreSettings(settingsRes.settings);
      if (feedbackRes?.feedback) setFeedback(feedbackRes.feedback);
      if (licenseRes?.license) setLicense(licenseRes.license);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, show Login Screen
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Flexora Yönetici Paneli</h2>
            <p className="text-xs text-slate-400">Mağazanızı ve teslimat sisteminizi yönetmek için giriş yapın.</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kullanıcı Adı</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Kullanıcı adınızı girin"
                  autoComplete="off"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Şifrenizi girin"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Güvenli Giriş Yap</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Gösterge Paneli', icon: LayoutDashboard },
    { id: 'accounts', label: 'Hesaplar & Mailler', icon: Mail, badge: accounts.length },
    { id: 'keys', label: 'Key Yönetimi', icon: Key, badge: keys.length },
    { id: 'packages', label: 'Paket & Oyun Sistemi', icon: Gamepad2, badge: packages.length },
    { id: 'settings', label: 'Mağaza Özelleştirme', icon: Settings },
    { id: 'feedback', label: 'Müşteri Talepleri', icon: MessageSquare, badge: feedback.filter(f => f.status === 'pending').length || null },
    { id: 'license', label: 'Lisans & Kurulum', icon: ShieldCheck, badge: `${license?.daysRemaining || 30} Gün` }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-white tracking-wider">FLEXORA</h1>
                <span className="text-[10px] text-indigo-400 font-mono block">v1.0 • OTO-TESLİMAT</span>
              </div>
            </div>

            <button
              onClick={fetchAllData}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Verileri Yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isActive ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <a
            href={`/store/${storeSettings?.slug || 'magazam'}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mağaza Portalı</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 max-w-6xl">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Gösterge Paneli (Dashboard)</h2>
              <p className="text-xs text-slate-400">Canlı teslimat istatistikleri ve anlık sistem metrikleri.</p>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[11px] font-medium text-slate-400 block">Toplam Hesap Havuzu</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white">{accounts.length}</span>
                  <span className="text-xs text-indigo-400 font-medium">Mail & 2FA</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[11px] font-medium text-slate-400 block">Aktif Satış Keyleri</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-emerald-400">
                    {keys.filter(k => (k.maxUses === 0 || k.usedCount < k.maxUses)).length}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Stokta</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[11px] font-medium text-slate-400 block">Başarılı Kod Teslimatı</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-purple-400">
                    {stats?.totalVerifications || 0}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Otomatik</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[11px] font-medium text-slate-400 block">Kalan Lisans Süresi</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-amber-400">
                    {license?.daysRemaining || 30} Gün
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">Aktif</span>
                </div>
              </div>
            </div>

            {/* Sales / Activity Chart & Recent Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Bar Chart */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Son 7 Günlük Teslimat Grafiği</h3>
                  <span className="text-xs text-slate-400">Anlık Kod İstekleri</span>
                </div>

                <div className="h-48 flex items-end justify-between gap-2 pt-6">
                  {(stats?.chartData || []).map((day, idx) => {
                    const maxVal = Math.max(5, ...((stats?.chartData || []).map(d => d.count)));
                    const heightPercent = Math.max(10, (day.count / maxVal) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <span className="text-[10px] font-mono text-slate-400">{day.count}</span>
                        <div
                          className="w-full rounded-t-lg bg-indigo-600 hover:bg-indigo-500 transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] text-slate-500 whitespace-nowrap">
                          {day.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white">Hızlı İşlemler</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('keys')}
                    className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white block">Toplu Key Üret</span>
                      <span className="text-[10px] text-slate-400">Satış sitelerine yapıştırmak için</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white block">Yeni Hesap / Mail Ekle</span>
                      <span className="text-[10px] text-slate-400">Steam, Netflix veya ChatGPT</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('packages')}
                    className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white block">Oyun Paketi Düzenle</span>
                      <span className="text-[10px] text-slate-400">Müşteriye oyun seçtirme kuralı</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Deliveries Table */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Son Kod Teslimat Logları</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Zaman</th>
                      <th className="py-2 px-3">Erişim Keyi</th>
                      <th className="py-2 px-3">Platform</th>
                      <th className="py-2 px-3">Teslim Edilen Kod</th>
                      <th className="py-2 px-3">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(stats?.recentLogs || []).map(log => (
                      <tr key={log.id} className="text-slate-300">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-indigo-400">{log.keyCode}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-bold">{log.platform}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{log.code || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* OTHER TABS */}
        {activeTab === 'accounts' && <AdminAccounts accounts={accounts} onRefresh={fetchAllData} />}
        {activeTab === 'keys' && <AdminKeys keys={keys} accounts={accounts} packages={packages} onRefresh={fetchAllData} />}
        {activeTab === 'packages' && <AdminPackages packages={packages} games={games} accounts={accounts} onRefresh={fetchAllData} />}
        {activeTab === 'settings' && <AdminSettings settings={storeSettings} onRefresh={fetchAllData} />}
        {activeTab === 'feedback' && <AdminFeedback feedback={feedback} onRefresh={fetchAllData} />}
        {activeTab === 'license' && <AdminLicense license={license} onRefresh={fetchAllData} />}
      </main>
    </div>
  );
}
