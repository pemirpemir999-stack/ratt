import React, { useState } from 'react';
import { Gamepad2, Search, Sparkles, Tag, ShieldCheck } from 'lucide-react';

export default function GameShowcase({ games = [], onSelectGameForSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!games || games.length === 0) return null;

  const categories = ['all', ...new Set(games.map(g => g.category || 'Oyun'))];

  const filteredGames = games.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (g.platform && g.platform.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || g.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Mağaza Oyun Havuzu</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Mevcut Oyun Kataloğumuz</h2>
          <p className="text-xs text-slate-400">Satın aldığınız paket keyleri ile seçebileceğiniz ve teslim alabileceğiniz güncel oyunlar.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Oyun veya platform ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'Tüm Oyunlar' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredGames.map(game => (
          <div
            key={game.id}
            className="group relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col"
          >
            {/* Cover Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
              <img
                src={game.coverUrl}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-600/90 text-white backdrop-blur-sm">
                  {game.platform || 'Steam'}
                </span>
                {game.featured && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/90 text-slate-950 flex items-center gap-1 backdrop-blur-sm">
                    <Sparkles className="w-2.5 h-2.5" /> Popüler
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-medium text-indigo-400 block mb-1">{game.category}</span>
                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {game.title}
                </h3>
                {game.description && (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> 7/24 Otomatik
                </span>
                <span className="text-slate-500">Stokta</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          Arama kriterine uygun oyun bulunamadı.
        </div>
      )}
    </div>
  );
}
