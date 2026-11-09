import React, { useState } from 'react';
import { MessageSquare, Trash2, CheckCircle2, Clock, Mail, Tag } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminFeedback({ feedback, onRefresh }) {
  const [filter, setFilter] = useState('all');

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateFeedbackStatus(id, status);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu bildirimi silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteFeedback(id);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = feedback.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Müşteri İstek & Öneri Formları</h2>
          <p className="text-xs text-slate-400">
            Müşterilerinizin mağaza sayfasından gönderdiği oyun istekleri, önerileri ve destek talepleri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'pending', 'reviewed', 'resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f === 'all' && `Tümü (${feedback.length})`}
              {f === 'pending' && 'Bekleyenler'}
              {f === 'reviewed' && 'İncelenenler'}
              {f === 'resolved' && 'Çözülenler'}
            </button>
          ))}
        </div>
      </div>

      {/* Feedbacks Grid */}
      <div className="space-y-3">
        {filtered.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  item.type === 'request'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : item.type === 'problem'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {item.type === 'request' ? '🎮 Oyun İsteği' : item.type === 'problem' ? '⚠️ Sorun / Destek' : '💡 Öneri'}
                </span>

                <span className="text-xs text-slate-400">
                  İletişim: <strong className="text-white">{item.customerContact}</strong>
                </span>

                {item.key && (
                  <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-300">
                    Key: {item.key}
                  </span>
                )}

                <span className="text-[10px] text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {item.message}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-start">
              <select
                value={item.status}
                onChange={e => handleUpdateStatus(item.id, e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="pending">Beklemede</option>
                <option value="reviewed">İncelendi</option>
                <option value="resolved">Çözüldü</option>
              </select>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            Henüz müşteri geri bildirimi veya oyun talebi bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}
