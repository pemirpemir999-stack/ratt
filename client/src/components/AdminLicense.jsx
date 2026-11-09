import React, { useState } from 'react';
import { 
  ShieldCheck, Clock, Key, Check, AlertCircle, Sparkles, 
  RefreshCw, Terminal, CheckCircle2, Copy 
} from 'lucide-react';
import { api } from '../utils/api';

export default function AdminLicense({ license, onRefresh }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.activateLicense(code.trim());
      setSuccessMsg(res.message);
      setCode('');
      onRefresh();
    } catch (err) {
      setError(err.message || 'Lisans etkinleştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTestKey = async () => {
    try {
      const res = await api.generateTestKey();
      setGeneratedKey(res.code);
      setCode(res.code);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const daysRemaining = license?.daysRemaining || 0;
  const expiryDate = license?.expiresAt ? new Date(license.expiresAt).toLocaleDateString('tr-TR') : '-';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Lisans & Otomatik Kurulum Yönetimi</h2>
        <p className="text-xs text-slate-400">
          Flexora lisans durumunuzu görüntüleyin, yeni lisans kodunuzu girerek sürenizi 30 gün uzatın.
        </p>
      </div>

      {/* License Status Card */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{license?.plan || 'Pro Mağaza Lisansı (1 Ay)'}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    license?.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {license?.isActive ? 'Aktif Lisans' : 'Süresi Doldu'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Mevcut Kod: <strong className="font-mono text-indigo-300">{license?.licenseKey}</strong></p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Kalan Kullanım Süresi</span>
              <span className="font-mono text-3xl font-black text-white">{daysRemaining} Gün</span>
              <span className="text-[10px] text-slate-500 block">Bitiş: {expiryDate}</span>
            </div>
          </div>

          {/* Progress Bar (30 days total) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Abonelik İlerlemesi</span>
              <span>{Math.round((daysRemaining / 30) * 100)}% Kalan</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, (daysRemaining / 30) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activate / Extend License Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Süre Uzat / Yeni Lisans Kodu Gir</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Satın aldığınız 30 günlük lisans kodunu buraya girerek mağazanızı anında uzatabilirsiniz.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateTestKey}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test Kodu Üret</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleActivate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Örn: ZG-PRO-30DAYS-XXXX"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono uppercase font-bold focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer whitespace-nowrap"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Lisansı Etkinleştir (+30 Gün)</span>
              </>
            )}
          </button>
        </form>

        {generatedKey && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Oluşturulan Test Kodu: <strong className="font-mono text-white">{generatedKey}</strong>
            </span>
            <button
              onClick={handleCopyKey}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Self-Setup & Deployment Guide */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>Sıfır Kurulum & Bağımsız Çalıştırma Talimatı</span>
        </h4>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            ✅ <strong>Bana ihtiyacınız yoktur:</strong> Flexora, harici hiçbir veri tabanına ihtiyaç duymayan taşınabilir mimaridedir. Kendi sunucunuzda, VDS'inizde veya bilgisayarınızda tek tıkla çalışır.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-indigo-300 space-y-1">
            <div># 1. Projeyi başlatmak için:</div>
            <div className="text-emerald-400">npm start</div>
            <div className="text-slate-500"># Mağaza http://localhost:3001 adresinde anında hazırdır!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
