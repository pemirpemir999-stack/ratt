import React, { useState } from 'react';
import { 
  Palette, Globe, Store, ExternalLink, Save, Check, Sparkles, 
  Eye, Layout, FileText, Bell 
} from 'lucide-react';
import { api } from '../utils/api';

const THEMES = [
  { id: 'indigo', name: 'Indigo Neon', bg: 'bg-indigo-600', ring: 'ring-indigo-500' },
  { id: 'cyan', name: 'Cyber Cyan', bg: 'bg-cyan-500', ring: 'ring-cyan-400' },
  { id: 'emerald', name: 'Matrix Emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-400' },
  { id: 'purple', name: 'Violet Glow', bg: 'bg-purple-600', ring: 'ring-purple-500' },
  { id: 'rose', name: 'Cyber Rose', bg: 'bg-rose-500', ring: 'ring-rose-400' },
  { id: 'amber', name: 'Sunset Amber', bg: 'bg-amber-500', ring: 'ring-amber-400' }
];

export default function AdminSettings({ settings, onRefresh }) {
  const [formData, setFormData] = useState({
    storeName: settings?.storeName || 'Flexora Mağazası',
    slug: settings?.slug || 'magazam',
    slogan: settings?.slogan || '7/24 Otomatik Doğrulama Kodu & Hesap Teslimatı',
    tabTitle: settings?.tabTitle || 'Flexora | Anında Doğrulama & Hesap Teslimatı',
    faviconUrl: settings?.faviconUrl || '',
    logoUrl: settings?.logoUrl || '',
    bannerUrl: settings?.bannerUrl || '',
    themeColor: settings?.themeColor || 'indigo',
    announcement: settings?.announcement || '',
    customDomain: settings?.customDomain || '',
    showGameShowcase: settings?.showGameShowcase !== false
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const storeUrl = `${window.location.origin}/store/${formData.slug || 'magazam'}`;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Mağaza Özelleştirme & Ayarlar</h2>
          <p className="text-xs text-slate-400">
            Müşterilerinizin göreceği mağaza linki, logo, renk teması ve duyuruları özelleştirin.
          </p>
        </div>

        <a
          href={`/store/${formData.slug || 'magazam'}`}
          target="_blank"
          rel="noreferrer"
          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer w-fit"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Mağazayı Canlı Gör</span>
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Link & Slug Box */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Store className="w-4 h-4 text-indigo-400" />
            <span>Size Özel Mağaza Linki</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
              {window.location.origin}/store/
            </div>
            <input
              type="text"
              required
              placeholder="magaza-adiniz"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Müşterilerinize doğrudan bu linki iletebilirsiniz: <strong className="text-indigo-400">{storeUrl}</strong>
          </p>
        </div>

        {/* Branding & Appearance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Palette className="w-4 h-4 text-indigo-400" />
            <span>Marka & Görünüm</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mağaza / Marka Adı</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Slogan / Alt Başlık</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tarayıcı Sekme Başlığı</label>
              <input
                type="text"
                value={formData.tabTitle}
                onChange={e => setFormData({ ...formData, tabTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Logo URL (İsteğe bağlı)</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.logoUrl}
                onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Color Themes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Tema Rengi</label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, themeColor: theme.id })}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    formData.themeColor === theme.id
                      ? 'border-white ring-2 ring-indigo-500 bg-slate-800'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${theme.bg}`} />
                  <span className="text-[11px] font-medium text-white truncate">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>Üst Duyuru Bandı (Announcement Bar)</span>
          </div>

          <textarea
            rows={2}
            value={formData.announcement}
            onChange={e => setFormData({ ...formData, announcement: e.target.value })}
            placeholder="🔥 Hoş geldiniz! Kodlarınızı 7/24 anında teslim alabilirsiniz."
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <p className="text-[11px] text-slate-500">Müşterilerin mağaza sayfasının en üstünde göreceği duyuru metni.</p>
        </div>

        {/* Game Showcase & Custom Domain */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Katalog & Alan Adı (Domain)</span>
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showGameShowcase}
              onChange={e => setFormData({ ...formData, showGameShowcase: e.target.checked })}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 mt-0.5"
            />
            <div>
              <span className="text-xs font-semibold text-white block">Mağazada Oyun Vitrinini Göster</span>
              <span className="text-[11px] text-slate-400 block">Katalogdaki oyunları ana sayfada sergiler.</span>
            </div>
          </label>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Özel Alan Adı (Custom Domain)</label>
            <input
              type="text"
              placeholder="auth.benimmagazam.com"
              value={formData.customDomain}
              onChange={e => setFormData({ ...formData, customDomain: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Kendi domaininizi bağlamak için DNS ayarlarınızdan CNAME kaydı ekleyebilirsiniz.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {success && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
              <Check className="w-4 h-4" /> Ayarlar Başarıyla Kaydedildi!
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Ayarları Kaydet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
