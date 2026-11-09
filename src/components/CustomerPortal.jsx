import React, { useState, useEffect } from 'react';
import { 
  Key, Shield, ArrowRight, Copy, Check, RefreshCw, Clock, 
  Gamepad2, User, Lock, Eye, EyeOff, AlertTriangle,
  CheckCircle, Mail, AlertCircle, Info, ExternalLink, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function CustomerPortal({ storeSettings, onOpenFeedback }) {
  const [keyCode, setKeyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyData, setKeyData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Live code state
  const [codeLoading, setCodeLoading] = useState(false);
  const [liveCode, setLiveCode] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [totpRemaining, setTotpRemaining] = useState(30);

  // Package game selection state
  const [selectedGameIds, setSelectedGameIds] = useState([]);
  const [selectingGames, setSelectingGames] = useState(false);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Live TOTP countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      const epoch = Math.floor(Date.now() / 1000);
      const rem = 30 - (epoch % 30);
      setTotpRemaining(rem);

      // If keyData has TOTP active and code is showing, refresh on step change
      if (keyData?.account?.authType === 'totp' && liveCode && rem === 30) {
        handleFetchCode(true); // silent refresh
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [keyData, liveCode]);

  // Copy helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Check / Query Key
  const handleCheckKey = async (codeToQuery = keyCode) => {
    const clean = (codeToQuery || '').trim();
    if (!clean) {
      setError('Lütfen erişim anahtarınızı (Key) giriniz.');
      return;
    }

    setLoading(true);
    setError('');
    setLiveCode(null);

    try {
      const res = await api.checkKey(clean);
      setKeyData(res);
      setCooldown(res.key.cooldownRemaining || 0);

      // If it's a TOTP or Exnor account, auto-fetch code immediately
      if ((res.account?.authType === 'totp' || res.account?.authType === 'exnor') && (res.key.deliveryType === 'code_only' || res.key.deliveryType === 'info_and_code')) {
        handleFetchCodeDirect(clean, null, true);
      }
    } catch (err) {
      setKeyData(null);
      setError(err.message || 'Key sorgulanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Live Code from server (IMAP or TOTP)
  const handleFetchCodeDirect = async (codeToUse, targetAccId = null, silent = false) => {
    if (!silent) setCodeLoading(true);
    setError('');

    try {
      const res = await api.fetchLiveCode(codeToUse, targetAccId);
      setLiveCode(res.data);
      setCooldown(res.cooldownSeconds || 0);

      // Update remaining uses in keyData
      if (keyData && keyData.key) {
        setKeyData(prev => ({
          ...prev,
          key: {
            ...prev.key,
            usedCount: (prev.key.usedCount || 0) + 1,
            remainingUses: res.remainingUses
          }
        }));
      }

      // Celebrate with subtle confetti
      if (!silent) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.message || 'Kod çekilemedi.');
    } finally {
      if (!silent) setCodeLoading(false);
    }
  };

  const handleFetchCode = (silent = false) => {
    if (!keyData || cooldown > 0) return;
    handleFetchCodeDirect(keyData.key.keyCode, null, silent);
  };

  // Burn on view credentials
  const handleConfirmViewCredentials = async () => {
    if (!keyData?.key?.keyCode) return;
    try {
      await api.viewCredentials(keyData.key.keyCode);
      setKeyData(prev => ({
        ...prev,
        key: { ...prev.key, isViewed: true }
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Game selection for packages
  const toggleGameSelect = (gameId) => {
    const limit = keyData?.package?.selectableGameCount || 1;
    if (selectedGameIds.includes(gameId)) {
      setSelectedGameIds(selectedGameIds.filter(id => id !== gameId));
    } else {
      if (selectedGameIds.length < limit) {
        setSelectedGameIds([...selectedGameIds, gameId]);
      }
    }
  };

  const handleConfirmPackageSelection = async () => {
    const limit = keyData?.package?.selectableGameCount || 1;
    if (selectedGameIds.length !== limit) {
      setError(`Lütfen tam olarak ${limit} adet oyun seçiniz.`);
      return;
    }

    setSelectingGames(true);
    setError('');

    try {
      await api.selectGames(keyData.key.keyCode, selectedGameIds);
      // Re-query key to get the new assignments
      await handleCheckKey(keyData.key.keyCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setSelectingGames(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Search Input Box */}
      <div className="relative rounded-3xl p-1 bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-cyan-500/30 shadow-2xl backdrop-blur-xl">
        <div className="rounded-[22px] bg-slate-900/90 p-5 sm:p-7 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Erişim Anahtarınızı (Key) Girin</h2>
              <p className="text-xs text-slate-400">Satın aldığınız key ile anında doğrulama kodunuzu ve hesap bilgilerinizi alın.</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheckKey();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Keyinizi buraya yapıştırın"
                value={keyCode}
                onChange={(e) => setKeyCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              {keyCode && (
                <button
                  type="button"
                  onClick={() => setKeyCode('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
                >
                  Temizle
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sorgula & Kodu Al</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">İşlem Gerçekleştirilemedi</span>
            <span className="text-xs text-rose-200/90">{error}</span>
          </div>
        </div>
      )}

      {/* RESULT CARD */}
      {keyData && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl transition-all">
          {/* Card Header */}
          <div className="p-6 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {keyData.account?.name || keyData.package?.name || 'Hesap Teslimatı'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Aktif
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Key: <strong className="font-mono text-indigo-300">{keyData.key.keyCode}</strong></span>
                  <span>•</span>
                  <span>Kalan Hak: <strong className="text-white">{keyData.key.remainingUses}</strong></span>
                  {keyData.key.cooldownSeconds > 0 && (
                    <>
                      <span>•</span>
                      <span>Bekleme: <strong>{keyData.key.cooldownSeconds}sn</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCheckKey(keyData.key.keyCode)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Yenile"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yenile</span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* CASE 1: STEAM / GAME PACKAGE SELECTION */}
            {keyData.package && (!keyData.selectedGames || keyData.selectedGames.length === 0) && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm mb-1">
                    <Gamepad2 className="w-4 h-4" />
                    <span>Oyun Paketi Seçimi Gerekli</span>
                  </div>
                  <p className="text-xs text-indigo-200/80 leading-relaxed">
                    Bu paket ile aşağıdaki listeden tam olarak <strong>{keyData.package.selectableGameCount}</strong> adet oyun seçme hakkınız bulunmaktadır. Seçiminizi tamamlayıp onaylayarak hesap bilgilerinizi ve kodlarını anında alabilirsiniz.
                  </p>
                  <div className="mt-2 text-xs font-bold text-white">
                    Seçilen: {selectedGameIds.length} / {keyData.package.selectableGameCount}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {keyData.package.availableGames?.map(game => {
                    const isSelected = selectedGameIds.includes(game.id);
                    return (
                      <div
                        key={game.id}
                        onClick={() => toggleGameSelect(game.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          className="w-16 h-12 rounded-lg object-cover bg-slate-800"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-indigo-400 font-medium uppercase">{game.platform}</span>
                          <h4 className="text-xs font-bold text-white truncate">{game.title}</h4>
                          <span className="text-[10px] text-slate-400">{game.category}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleConfirmPackageSelection}
                  disabled={selectedGameIds.length !== keyData.package.selectableGameCount || selectingGames}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  {selectingGames ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Seçimi Onayla & Oyunları Teslim Al</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CASE 2: SELECTED GAMES IN PACKAGE */}
            {keyData.selectedGames && keyData.selectedGames.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" /> Seçtiğiniz Oyunlar & Hesaplar
                </h4>
                <div className="space-y-3">
                  {keyData.selectedGames.map(game => (
                    <div key={game.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={game.coverUrl} alt={game.title} className="w-12 h-10 rounded-lg object-cover" />
                        <div>
                          <h5 className="text-sm font-bold text-white">{game.title}</h5>
                          <span className="text-[10px] text-indigo-400 font-medium">{game.platform}</span>
                        </div>
                      </div>

                      {game.account && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Kullanıcı Adı</span>
                              <span className="font-mono text-white font-medium">{game.account.username}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(game.account.username, `user-${game.id}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              {copiedField === `user-${game.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Şifre</span>
                              <span className="font-mono text-white font-medium">{game.account.password}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(game.account.password, `pass-${game.id}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              {copiedField === `pass-${game.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CASE 3: CREDENTIALS DELIVERY (Account info reveal) */}
            {keyData.account && (keyData.account.deliveryType === 'info_only' || keyData.account.deliveryType === 'info_and_code') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" /> Hesap Giriş Bilgileri
                  </h4>
                  {keyData.key.burnOnView && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Tek Kullanımlık (Görüntülendiğinde Kapanır)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Username Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-slate-500 font-medium block">Kullanıcı Adı / E-Posta</span>
                      <span className="font-mono text-sm text-white font-semibold truncate block">
                        {keyData.account.username || 'Gizli'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(keyData.account.username, 'username')}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Kullanıcı Adını Kopyala"
                    >
                      {copiedField === 'username' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-slate-500 font-medium block">Hesap Şifresi</span>
                      <span className="font-mono text-sm text-white font-semibold truncate block">
                        {showPassword ? (keyData.account.password || '••••••••') : '••••••••••••'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title={showPassword ? 'Gizle' : 'Göster'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(keyData.account.password, 'password')}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Şifreyi Kopyala"
                      >
                        {copiedField === 'password' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {keyData.account.extraNotes && (
                  <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                    <span><strong>Satıcı Notu:</strong> {keyData.account.extraNotes}</span>
                  </div>
                )}
              </div>
            )}

            {/* CASE 4: VERIFICATION CODE DELIVERY (Steam Guard, Netflix, ChatGPT, 2FA TOTP, etc.) */}
            {(keyData.account?.deliveryType === 'code_only' || keyData.account?.deliveryType === 'info_and_code') && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" /> 
                    {keyData.account.platform.toUpperCase()} Doğrulama Kodu (2FA)
                  </h4>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    {keyData.account.authType === 'totp' ? '⚡ Anlık 2FA Authenticator' : keyData.account.authType === 'exnor' ? '🌐 Canlı Guard Köprüsü (Exnor)' : '📧 Otomatik Mail Ayrıştırıcı'}
                  </span>
                </div>

                {/* Big Code Card */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-8 text-center space-y-4 shadow-xl">
                  {/* Glowing background blob */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                  {/* If code is available */}
                  {liveCode ? (
                    <div className="space-y-4 relative z-10">
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Kod Başarıyla Teslim Edildi
                      </span>

                      {/* Code Big Display */}
                      <div className="py-2">
                        <div
                          onClick={() => handleCopy(liveCode.code, 'code')}
                          className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 hover:border-indigo-400 cursor-pointer shadow-lg shadow-indigo-500/10 transition-all"
                        >
                          <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-widest selection:bg-none">
                            {liveCode.code}
                          </span>
                          <div className="p-2 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white transition-colors">
                            {copiedField === 'code' ? <Check className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">Koda tıklayarak tek dokunuşla kopyalayabilirsiniz.</p>
                      </div>

                      {/* TOTP 30s live circle indicator */}
                      {liveCode.type === 'totp' && (
                        <div className="inline-flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                          <span>Yeni kod için: <strong className="text-indigo-400">{totpRemaining}sn</strong></span>
                        </div>
                      )}

                      {/* IMAP Mail details if available */}
                      {liveCode.subject && (
                        <div className="text-xs text-slate-400 max-w-md mx-auto p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left space-y-1">
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Gelen Mail Bilgisi</div>
                          <div className="text-white truncate font-medium">{liveCode.subject}</div>
                          {liveCode.from && <div className="text-slate-400 text-[11px]">Kimden: {liveCode.from}</div>}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Initial prompt to fetch code */
                    <div className="py-4 space-y-3 relative z-10">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                        <Mail className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-white">Doğrulama Kodunuz Hazır</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Oturum açarken platform sizden kod istediğinde aşağıdaki butona tıklayarak en güncel kodu anında çekin.
                      </p>
                    </div>
                  )}

                  {/* Fetch Button / Cooldown Button */}
                  <div className="relative z-10 pt-2">
                    {cooldown > 0 ? (
                      <div className="py-3 px-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-sm font-medium inline-flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>Tekrar kod istemek için bekleyin: <strong className="text-white font-mono">{cooldown} sn</strong></span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleFetchCode(false)}
                        disabled={codeLoading}
                        className="py-3.5 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm inline-flex items-center gap-2.5 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {codeLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Mail Kutusundan Kod Taranıyor...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            <span>{liveCode ? 'Yeni Kod Çek / Yenile' : 'Doğrulama Kodunu Getir'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer Help & Actions */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Sistem 7/24 otomatik çalışır, satıcı onayı beklemenize gerek yoktur.
            </span>
            <button
              onClick={onOpenFeedback}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Bir sorun mu yaşıyorsunuz? Bildirin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
