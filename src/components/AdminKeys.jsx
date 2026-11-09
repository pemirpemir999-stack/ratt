import React, { useState } from 'react';
import { 
  Plus, Sparkles, Copy, Check, Trash2, Download, RefreshCw, 
  Search, Shield, Key, AlertTriangle, Clock, Layers 
} from 'lucide-react';
import { api } from '../utils/api';

export default function AdminKeys({ keys, accounts, packages, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [formData, setFormData] = useState({
    targetType: 'account', // 'account' or 'package'
    targetId: accounts[0]?.id || '',
    prefix: 'ZG',
    count: 10,
    keyCode: '',
    deliveryType: 'inherit',
    burnOnView: false,
    maxUses: 5,
    cooldownSeconds: 60,
    validityDays: 30,
    notes: ''
  });

  const now = new Date();

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(code);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportTxt = () => {
    const activeKeys = keys.filter(k => {
      const isExhausted = k.maxUses > 0 && k.usedCount >= k.maxUses;
      const isExpired = k.expiresAt && new Date(k.expiresAt) < now;
      return !isExhausted && !isExpired;
    });

    const content = activeKeys.map(k => k.keyCode).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flexora-aktif-keyler-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePurge = async () => {
    if (!confirm('Süresi dolmuş veya tüm kullanım hakları tükenmiş keyleri kalıcı olarak silmek istiyor musunuz?')) return;
    try {
      const res = await api.purgeKeys();
      alert(res.message);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu keyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteKey(id);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const targetPayload = {
        deliveryType: formData.deliveryType,
        burnOnView: formData.burnOnView,
        maxUses: Number(formData.maxUses),
        cooldownSeconds: Number(formData.cooldownSeconds),
        validityDays: Number(formData.validityDays),
        notes: formData.notes
      };

      if (formData.targetType === 'account') {
        targetPayload.accountId = formData.targetId;
        targetPayload.packageId = null;
      } else {
        targetPayload.packageId = formData.targetId;
        targetPayload.accountId = null;
      }

      if (isBulk) {
        await api.createBulkKeys({
          ...targetPayload,
          count: Number(formData.count),
          prefix: formData.prefix
        });
      } else {
        await api.createKey({
          ...targetPayload,
          keyCode: formData.keyCode
        });
      }

      setModalOpen(false);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredKeys = keys.filter(k => {
    const isExhausted = k.maxUses > 0 && k.usedCount >= k.maxUses;
    const isExpired = k.expiresAt && new Date(k.expiresAt) < now;
    const isActive = !isExhausted && !isExpired;

    const matchesSearch = k.keyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (k.notes && k.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === 'active') return matchesSearch && isActive;
    if (statusFilter === 'exhausted') return matchesSearch && isExhausted;
    if (statusFilter === 'expired') return matchesSearch && isExpired;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Key (Erişim Anahtarı) Yönetimi</h2>
          <p className="text-xs text-slate-400">Müşterilerinize vereceğiniz tekil veya toplu keyleri üretin, takip edin ve temizleyin.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTxt}
            className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            title="Aktif keyleri TXT olarak indir"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>TXT İndir</span>
          </button>

          <button
            onClick={handlePurge}
            className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            title="Tükenmiş ve süresi dolmuş keyleri temizle"
          >
            <Trash2 className="w-4 h-4" />
            <span>Bitenleri Temizle</span>
          </button>

          <button
            onClick={() => {
              setIsBulk(false);
              setModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Key Üret</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Key kodu veya not ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'active', 'exhausted', 'expired'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter === 'all' && `Tümü (${keys.length})`}
              {filter === 'active' && 'Aktif Keyler'}
              {filter === 'exhausted' && 'Tükenenler'}
              {filter === 'expired' && 'Süresi Dolanlar'}
            </button>
          ))}
        </div>
      </div>

      {/* Keys Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Erişim Anahtarı (Key)</th>
                <th className="py-3.5 px-4">Bağlı Hesap / Paket</th>
                <th className="py-3.5 px-4">Kullanım Durumu</th>
                <th className="py-3.5 px-4">Bekleme Süresi</th>
                <th className="py-3.5 px-4">Durum</th>
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredKeys.map(k => {
                const isExhausted = k.maxUses > 0 && k.usedCount >= k.maxUses;
                const isExpired = k.expiresAt && new Date(k.expiresAt) < now;
                const targetAccount = accounts.find(a => a.id === k.accountId);
                const targetPackage = packages.find(p => p.id === k.packageId);

                return (
                  <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-400">{k.keyCode}</span>
                        <button
                          onClick={() => handleCopy(k.keyCode)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Keyi Kopyala"
                        >
                          {copiedKey === k.keyCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {k.notes && <span className="text-[10px] text-slate-500 font-sans block">{k.notes}</span>}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {targetAccount ? (
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-slate-800 text-indigo-400">
                            {targetAccount.platform}
                          </span>
                          <span className="truncate max-w-[160px]">{targetAccount.name}</span>
                        </div>
                      ) : targetPackage ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Layers className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[160px]">{targetPackage.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Bağlantısız</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isExhausted ? 'bg-rose-500' : 'bg-indigo-500'}`}
                            style={{
                              width: k.maxUses > 0 ? `${Math.min(100, (k.usedCount / k.maxUses) * 100)}%` : '0%'
                            }}
                          />
                        </div>
                        <span className="font-mono text-slate-300">
                          {k.usedCount} / {k.maxUses > 0 ? k.maxUses : '∞'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {k.cooldownSeconds > 0 ? `${k.cooldownSeconds} sn` : 'Yok'}
                    </td>

                    <td className="py-3.5 px-4">
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Süresi Doldu
                        </span>
                      ) : isExhausted ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          Tükendi
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Aktif
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredKeys.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            Kayıtlı key bulunamadı. "Key Üret" butonuna tıklayarak ilk keylerinizi oluşturabilirsiniz.
          </div>
        )}
      </div>

      {/* CREATE KEY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">Erişim Anahtarı (Key) Oluştur</h3>
            <p className="text-xs text-slate-400 mb-6">Tekil veya yüzlerce toplu key oluşturup satış platformlarına aktarın.</p>

            {/* Mode Switch (Single vs Bulk) */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsBulk(false)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  !isBulk ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tekil Key
              </button>
              <button
                type="button"
                onClick={() => setIsBulk(true)}
                className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                  isBulk ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Toplu Key Üretimi (1-500 Adet)
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Target Type: Account vs Package */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">Keyin Bağlanacağı Hedef</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        targetType: 'account',
                        targetId: accounts[0]?.id || ''
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      formData.targetType === 'account'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Tek Hesap (Mail/2FA)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        targetType: 'package',
                        targetId: packages[0]?.id || ''
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      formData.targetType === 'package'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Oyun Paketi (Çoklu Seçim)</span>
                  </button>
                </div>

                {/* Target Select Dropdown */}
                {formData.targetType === 'account' ? (
                  <select
                    value={formData.targetId}
                    onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.platform.toUpperCase()}] {a.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={formData.targetId}
                    onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.selectableGameCount} Oyun Seçimli)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Bulk Qty & Prefix */}
              {isBulk ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Adet (1 - 500)</label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={formData.count}
                      onChange={e => setFormData({ ...formData, count: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Key Öneki (Prefix)</label>
                    <input
                      type="text"
                      placeholder="Örn: STEAM, VIP, ZG"
                      value={formData.prefix}
                      onChange={e => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Özel Key Kodu (Boş bırakılırsa otomatik üretilir)</label>
                  <input
                    type="text"
                    placeholder="Örn: ZG-OZEL-MUSTERI-2026"
                    value={formData.keyCode}
                    onChange={e => setFormData({ ...formData, keyCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase font-mono"
                  />
                </div>
              )}

              {/* Key Usage & Restrictions */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Kullanım Hakkı</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5 (0: Sınırsız)"
                    value={formData.maxUses}
                    onChange={e => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Bekleme Süresi (Sn)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="60"
                    value={formData.cooldownSeconds}
                    onChange={e => setFormData({ ...formData, cooldownSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Geçerlilik (Gün)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="30"
                    value={formData.validityDays}
                    onChange={e => setFormData({ ...formData, validityDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              {/* Burn on view checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.burnOnView}
                  onChange={e => setFormData({ ...formData, burnOnView: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">Tek Kullanımlık Yakma (Burn on View)</span>
                  <span className="text-[11px] text-slate-400 block">Hesap bilgisi müşteri tarafından görüntülendiğinde key'i kullanılmış say.</span>
                </div>
              </label>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Not / Sipariş Bilgisi</label>
                <input
                  type="text"
                  placeholder="Örn: İtemsatış #9842 siparişi için"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  {isBulk ? `${formData.count} Adet Key Üret` : 'Keyi Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
