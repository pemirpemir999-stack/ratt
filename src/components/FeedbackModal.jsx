import React, { useState } from 'react';
import { X, Send, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';

export default function FeedbackModal({ isOpen, onClose, defaultKey = '' }) {
  const [type, setType] = useState('suggestion');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [keyCode, setKeyCode] = useState(defaultKey);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Lütfen bir mesaj yazınız.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.sendFeedback({
        type,
        customerContact: contact,
        message,
        key: keyCode
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Gönderim sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">İstek & Öneri Bildir</h3>
            <p className="text-xs text-slate-400">Görüşleriniz veya talep ettiğiniz oyun/hesaplar için formu doldurun.</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-semibold text-white">Mesajınız İletildi!</h4>
            <p className="text-sm text-slate-400">Mağaza yetkilisi mesajınızı en kısa sürede inceleyecektir.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Bildirim Türü</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'suggestion', label: '💡 Öneri' },
                  { id: 'request', label: '🎮 Oyun İsteği' },
                  { id: 'problem', label: '⚠️ Sorun / Destek' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      type === item.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                İletişim Bilginiz <span className="text-slate-500">(Discord, E-posta veya Telefon)</span>
              </label>
              <input
                type="text"
                placeholder="Örn: discord#1234 veya musteri@mail.com"
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Erişim Anahtarınız <span className="text-slate-500">(İsteğe bağlı)</span>
              </label>
              <input
                type="text"
                placeholder="Örn: ZG-STEAM-XXXX"
                value={keyCode}
                onChange={e => setKeyCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white uppercase focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mesajınız / Talebiniz</label>
              <textarea
                rows={3}
                required
                placeholder="Eklenmesini istediğiniz oyunu veya yaşadığınız bir durumu buraya yazın..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Talebi İlet</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
