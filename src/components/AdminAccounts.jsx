import React, { useState } from 'react';
import { 
  Plus, Upload, Search, Mail, Shield, Trash2, Edit2, CheckCircle2, 
  AlertCircle, Key, ExternalLink, RefreshCw, Eye, EyeOff, Check, Copy 
} from 'lucide-react';
import { api } from '../utils/api';

const PLATFORMS = [
  { id: 'steam', name: 'Steam (Steam Guard)', defaultHost: 'imap.gmail.com' },
  { id: 'netflix', name: 'Netflix', defaultHost: 'outlook.office365.com' },
  { id: 'chatgpt', name: 'ChatGPT / OpenAI', defaultHost: 'imap.gmail.com' },
  { id: 'epic', name: 'Epic Games', defaultHost: 'imap.gmail.com' },
  { id: 'ea', name: 'EA / Origin', defaultHost: 'imap.gmail.com' },
  { id: 'ubisoft', name: 'Ubisoft', defaultHost: 'imap.gmail.com' },
  { id: 'riot', name: 'Riot Games', defaultHost: 'imap.gmail.com' },
  { id: 'rockstar', name: 'Rockstar Games', defaultHost: 'imap.gmail.com' },
  { id: 'microsoft', name: 'Microsoft / Xbox', defaultHost: 'outlook.office365.com' },
  { id: 'google', name: 'Google', defaultHost: 'imap.gmail.com' },
  { id: 'amazon', name: 'Amazon', defaultHost: 'imap.gmail.com' },
  { id: 'binance', name: 'Binance', defaultHost: 'imap.gmail.com' },
  { id: 'custom', name: 'Diğer / Özel Mail', defaultHost: 'mail.alanadiniz.com' }
];

export default function AdminAccounts({ accounts, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'steam',
    deliveryType: 'info_and_code', // code_only, info_only, info_and_code
    authType: 'imap', // imap, totp, exnor
    credentials: { username: '', password: '', extraNotes: '' },
    imapConfig: { host: 'imap.gmail.com', port: 993, secure: true, user: '', pass: '', mailbox: 'INBOX' },
    totpSecret: '',
    exnorKey: '',
    exnorHost: 'https://exnor.com.tr'
  });

  // Bulk Import Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkPlatform, setBulkPlatform] = useState('steam');
  const [bulkDelivery, setBulkDelivery] = useState('info_and_code');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Test states
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const resetForm = () => {
    setEditId(null);
    setFormData({
      name: '',
      platform: 'steam',
      deliveryType: 'info_and_code',
      authType: 'imap',
      credentials: { username: '', password: '', extraNotes: '' },
      imapConfig: { host: 'imap.gmail.com', port: 993, secure: true, user: '', pass: '', mailbox: 'INBOX' },
      totpSecret: '',
      exnorKey: '',
      exnorHost: 'https://exnor.com.tr'
    });
    setTestResult(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setEditId(acc.id);
    setFormData({
      name: acc.name,
      platform: acc.platform,
      deliveryType: acc.deliveryType,
      authType: acc.authType || 'imap',
      credentials: {
        username: acc.credentials?.username || '',
        password: acc.credentials?.password || '',
        extraNotes: acc.credentials?.extraNotes || ''
      },
      imapConfig: {
        host: acc.imapConfig?.host || '',
        port: acc.imapConfig?.port || 993,
        secure: acc.imapConfig?.secure !== false,
        user: acc.imapConfig?.user || '',
        pass: acc.imapConfig?.pass || '',
        mailbox: acc.imapConfig?.mailbox || 'INBOX'
      },
      totpSecret: acc.totpSecret || '',
      exnorKey: acc.exnorKey || '',
      exnorHost: acc.exnorHost || 'https://exnor.com.tr'
    });
    setTestResult(null);
    setModalOpen(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.updateAccount(editId, formData);
      } else {
        await api.addAccount(formData);
      }
      setModalOpen(false);
      resetForm();
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm('Bu hesabı silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteAccount(id);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTestImap = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testImap(formData.imapConfig);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleTestTotp = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testTotp(formData.totpSecret);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleTestExnor = async () => {
    const key = formData.exnorKey || formData.credentials?.password;
    if (!key) {
      alert('Lütfen test etmek için Exnor erişim kodunu girin.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testExnor({
        accessCode: key,
        host: formData.exnorHost || 'https://exnor.com.tr'
      });
      setTestResult(res);
      // Auto-populate form credentials if available
      if (res.data) {
        setFormData(prev => ({
          ...prev,
          name: prev.name && prev.name !== 'Yeni Hesap' ? prev.name : (res.data.title || 'Call of Duty Modern Warfare 4 - Steam'),
          credentials: {
            ...prev.credentials,
            username: res.data.username || prev.credentials.username,
            password: res.data.password || prev.credentials.password,
            extraNotes: prev.credentials.extraNotes || 'Steam girişte "Beni Hatırla" seçeneğini işaretlemeyi unutmayınız.'
          }
        }));
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkText.trim()) return;
    setBulkLoading(true);
    try {
      const res = await api.bulkImportAccounts({
        rawText: bulkText,
        defaultPlatform: bulkPlatform,
        defaultDelivery: bulkDelivery
      });
      alert(res.message);
      setBulkModalOpen(false);
      setBulkText('');
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          acc.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (acc.credentials?.username && acc.credentials.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlatform = platformFilter === 'all' || acc.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Hesaplar & Mailler</h2>
          <p className="text-xs text-slate-400">Mail (IMAP) veya 2FA Authenticator bağlı hesapları ekleyin ve yönetin.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Toplu Hesap Ekle</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Hesap Ekle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Hesap adı veya kullanıcı adı ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Tüm Platformlar ({accounts.length})</option>
            {PLATFORMS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Hesap / Tanım</th>
                <th className="py-3.5 px-4">Platform</th>
                <th className="py-3.5 px-4">Teslimat Türü</th>
                <th className="py-3.5 px-4">Doğrulama Yöntemi</th>
                <th className="py-3.5 px-4">Kullanıcı Adı</th>
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAccounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{acc.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {acc.platform}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {acc.deliveryType === 'code_only' && <span className="text-amber-400">Sadece Kod</span>}
                    {acc.deliveryType === 'info_only' && <span className="text-cyan-400">Sadece Hesap Bilgisi</span>}
                    {acc.deliveryType === 'info_and_code' && <span className="text-emerald-400">Hesap + Canlı Kod</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    {acc.authType === 'exnor' ? (
                      <span className="text-rose-400 flex items-center gap-1">🌐 Exnor Köprüsü</span>
                    ) : acc.authType === 'totp' ? (
                      <span className="text-purple-400 flex items-center gap-1">⚡ Authenticator (2FA)</span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">📧 IMAP ({acc.imapConfig?.host || 'Mail'})</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {acc.credentials?.username || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(acc)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAccounts.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            Kayıtlı hesap bulunamadı. "Yeni Hesap Ekle" butonuna tıklayarak ilk hesabınızı ekleyin.
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">
              {editId ? 'Hesabı Düzenle' : 'Yeni Doğrulama Hesabı Ekle'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">Müşterilerinize sunacağınız hesap bilgilerini ve kod okuma yöntemini girin.</p>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hesap / İlan Başlığı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Steam CS2 + Cyberpunk VIP #1"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={e => {
                      const plat = e.target.value;
                      const matched = PLATFORMS.find(p => p.id === plat);
                      setFormData({
                        ...formData,
                        platform: plat,
                        imapConfig: {
                          ...formData.imapConfig,
                          host: matched?.defaultHost || formData.imapConfig.host
                        }
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery Type Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Teslimat Modu</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'info_and_code', title: 'Hesap Bilgisi + Kod', desc: 'Hem şifre hem canlı kod verilir' },
                    { id: 'code_only', title: 'Sadece Kod Teslimi', desc: 'Hesap şifresi gizli kalır' },
                    { id: 'info_only', title: 'Sadece Hesap Bilgisi', desc: 'Kodsuz hesaplar için' }
                  ].map(mode => (
                    <div
                      key={mode.id}
                      onClick={() => setFormData({ ...formData, deliveryType: mode.id })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.deliveryType === mode.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{mode.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{mode.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Credentials */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-white block">Hesap Giriş Bilgileri (Müşteriye Teslim Edilecek)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Kullanıcı Adı / E-Posta</label>
                    <input
                      type="text"
                      placeholder="hesap_kullaniciadi"
                      value={formData.credentials.username}
                      onChange={e => setFormData({
                        ...formData,
                        credentials: { ...formData.credentials, username: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Hesap Şifresi</label>
                    <input
                      type="text"
                      placeholder="hesap_sifresi"
                      value={formData.credentials.password}
                      onChange={e => setFormData({
                        ...formData,
                        credentials: { ...formData.credentials, password: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ekstra Not / Müşteri Talimatı</label>
                  <input
                    type="text"
                    placeholder="Örn: Steam Aile Paylaşımı aktiftir. Lütfen şifreyi değiştirmeyiniz."
                    value={formData.credentials.extraNotes}
                    onChange={e => setFormData({
                      ...formData,
                      credentials: { ...formData.credentials, extraNotes: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Authentication Mode (IMAP vs TOTP) */}
              {formData.deliveryType !== 'info_only' && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Doğrulama (Kod Alma) Yöntemi</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, authType: 'imap' })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          formData.authType === 'imap'
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        📧 E-Posta (IMAP)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, authType: 'totp' })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          formData.authType === 'totp'
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        ⚡ Authenticator (2FA)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, authType: 'exnor' })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          formData.authType === 'exnor'
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        🌐 Exnor Köprüsü
                      </button>
                    </div>
                  </div>

                  {/* IMAP Config */}
                  {formData.authType === 'imap' && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] text-slate-400 mb-1">IMAP Sunucu Adresi (Host)</label>
                          <input
                            type="text"
                            placeholder="imap.gmail.com"
                            value={formData.imapConfig.host}
                            onChange={e => setFormData({
                              ...formData,
                              imapConfig: { ...formData.imapConfig, host: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Port</label>
                          <input
                            type="number"
                            value={formData.imapConfig.port}
                            onChange={e => setFormData({
                              ...formData,
                              imapConfig: { ...formData.imapConfig, port: Number(e.target.value) }
                            })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Mail Adresi / Kullanıcı</label>
                          <input
                            type="text"
                            placeholder="hesap@gmail.com"
                            value={formData.imapConfig.user}
                            onChange={e => setFormData({
                              ...formData,
                              imapConfig: { ...formData.imapConfig, user: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Mail Şifresi / App Password</label>
                          <input
                            type="password"
                            placeholder="Gmail Uygulama Şifresi"
                            value={formData.imapConfig.pass}
                            onChange={e => setFormData({
                              ...formData,
                              imapConfig: { ...formData.imapConfig, pass: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={handleTestImap}
                          disabled={testing}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                          <span>Bağlantıyı Test Et</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TOTP 2FA Secret Config */}
                  {formData.authType === 'totp' && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">2FA Authenticator Secret Key (Base32)</label>
                        <input
                          type="text"
                          placeholder="JBSWY3DPEHPK3PXP"
                          value={formData.totpSecret}
                          onChange={e => setFormData({ ...formData, totpSecret: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Google Authenticator veya platformun size verdiği 16+ haneli gizli anahtarı girin.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestTotp}
                        disabled={testing}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                        <span>2FA Kodunu Önizle</span>
                      </button>
                    </div>
                  )}

                  {/* Exnor Guard Bridge Config */}
                  {formData.authType === 'exnor' && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                        💡 <strong>Exnor Köprüsü:</strong> exnor.com.tr üzerindeki hazır keyinizi bağlayarak canlı Steam Guard kodunu ve hesap bilgilerini otomatik olarak kendi sitenizden müşterinize sunabilirsiniz.
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Exnor Erişim Kodu (Key)</label>
                          <input
                            type="text"
                            placeholder="Örn: 3ES16-WQHP8-YZ5JJ"
                            value={formData.exnorKey || ''}
                            onChange={e => setFormData({ ...formData, exnorKey: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Guard Sunucu Adresi</label>
                          <input
                            type="text"
                            value={formData.exnorHost || 'https://exnor.com.tr'}
                            onChange={e => setFormData({ ...formData, exnorHost: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestExnor}
                        disabled={testing || !formData.exnorKey}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                        <span>Exnor Bilgilerini Çek & Test Et (Otomatik Doldur)</span>
                      </button>
                    </div>
                  )}

                  {/* Test Feedback */}
                  {testResult && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                    }`}>
                      {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{testResult.message} {testResult.code && <strong>(Üretilen Kod: {testResult.code})</strong>}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {editId ? 'Değişiklikleri Kaydet' : 'Hesabı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Toplu Hesap İçe Aktar</h3>
            <p className="text-xs text-slate-400 mb-4">
              Her satıra bir hesap gelecek şekilde <code>kullaniciadi:sifre</code> veya <code>email:sifre:platform</code> formatında yapıştırın.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Varsayılan Platform</label>
                <select
                  value={bulkPlatform}
                  onChange={e => setBulkPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  {PLATFORMS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Varsayılan Teslimat</label>
                <select
                  value={bulkDelivery}
                  onChange={e => setBulkDelivery(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="info_and_code">Hesap + Kod</option>
                  <option value="code_only">Sadece Kod</option>
                  <option value="info_only">Sadece Hesap Bilgisi</option>
                </select>
              </div>
            </div>

            <textarea
              rows={6}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="steam_user1:Password123&#10;steam_user2:Password456&#10;musteri@gmail.com:Pass789:netflix"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={bulkLoading || !bulkText.trim()}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white"
              >
                {bulkLoading ? 'Aktarılıyor...' : 'Hesapları İçe Aktar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
