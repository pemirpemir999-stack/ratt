import React, { useState } from 'react';
import { 
  Gamepad2, Plus, Layers, Trash2, Edit2, Check, Sparkles, 
  ExternalLink, Search, Image as ImageIcon 
} from 'lucide-react';
import { api } from '../utils/api';

export default function AdminPackages({ packages, games, accounts, onRefresh }) {
  const [activeTab, setActiveTab] = useState('packages'); // 'packages' | 'games'

  // Package Modal
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [pkgEditId, setPkgEditId] = useState(null);
  const [pkgForm, setPkgForm] = useState({
    name: '',
    description: '',
    selectableGameCount: 2,
    gameIds: []
  });

  // Game Modal
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [gameEditId, setGameEditId] = useState(null);
  const [gameForm, setGameForm] = useState({
    title: '',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    category: 'Aksiyon / Macera',
    platform: 'Steam',
    description: '',
    accountId: accounts[0]?.id || '',
    featured: false
  });

  // Save Package
  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      await api.savePackage({
        id: pkgEditId,
        ...pkgForm,
        selectableGameCount: Number(pkgForm.selectableGameCount)
      });
      setPkgModalOpen(false);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return;
    try {
      await api.deletePackage(id);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // Save Game
  const handleSaveGame = async (e) => {
    e.preventDefault();
    try {
      await api.saveGame({
        id: gameEditId,
        ...gameForm
      });
      setGameModalOpen(false);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteGame = async (id) => {
    if (!confirm('Bu oyunu katalogdan silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteGame(id);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleGameInPackage = (gameId) => {
    if (pkgForm.gameIds.includes(gameId)) {
      setPkgForm({ ...pkgForm, gameIds: pkgForm.gameIds.filter(id => id !== gameId) });
    } else {
      setPkgForm({ ...pkgForm, gameIds: [...pkgForm.gameIds, gameId] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Oyun Kataloğu & Paket Sistemi</h2>
          <p className="text-xs text-slate-400">
            Müşterilerinize tek key verip havuzdan istedikleri X adet oyunu seçtirin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'packages' ? (
            <button
              onClick={() => {
                setPkgEditId(null);
                setPkgForm({
                  name: '',
                  description: '',
                  selectableGameCount: 2,
                  gameIds: games.map(g => g.id)
                });
                setPkgModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Paket Oluştur</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setGameEditId(null);
                setGameForm({
                  title: '',
                  coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
                  category: 'Aksiyon',
                  platform: 'Steam',
                  description: '',
                  accountId: accounts[0]?.id || '',
                  featured: false
                });
                setGameModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Kataloğa Oyun Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('packages')}
          className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'packages'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Paketler ({packages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'games'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Oyun Kataloğu ({games.length})</span>
        </button>
      </div>

      {/* TAB 1: PACKAGES */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map(pkg => {
            const includedGames = games.filter(g => (pkg.gameIds || []).includes(g.id));
            return (
              <div key={pkg.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {pkg.selectableGameCount} Oyun Seçimli Paket
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{pkg.name}</h3>
                    {pkg.description && <p className="text-xs text-slate-400 mt-1">{pkg.description}</p>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setPkgEditId(pkg.id);
                        setPkgForm({
                          name: pkg.name,
                          description: pkg.description,
                          selectableGameCount: pkg.selectableGameCount,
                          gameIds: pkg.gameIds || []
                        });
                        setPkgModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Included games mini thumbnails */}
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-medium text-slate-400 block mb-2">
                    Havuzdaki Oyunlar ({includedGames.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {includedGames.map(g => (
                      <div
                        key={g.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      >
                        <img src={g.coverUrl} alt={g.title} className="w-4 h-4 rounded object-cover" />
                        <span className="truncate max-w-[130px]">{g.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {packages.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
              Henüz paket oluşturulmamış. "Yeni Paket Oluştur" ile ilk paketinizi hazırlayın.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GAMES CATALOG */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map(game => (
            <div
              key={game.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full bg-slate-950">
                  <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900/90 text-white">
                    {game.platform}
                  </div>
                </div>

                <div className="p-3.5">
                  <span className="text-[10px] text-indigo-400 font-medium block">{game.category}</span>
                  <h4 className="text-sm font-bold text-white truncate">{game.title}</h4>
                  {game.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{game.description}</p>
                  )}
                </div>
              </div>

              <div className="p-3.5 pt-0 flex items-center justify-between border-t border-slate-800/80 mt-2">
                <span className="text-[10px] text-slate-500">
                  {game.accountId ? 'Hesap Bağlı' : 'Ortak Havuz'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setGameEditId(game.id);
                      setGameForm({
                        title: game.title,
                        coverUrl: game.coverUrl,
                        category: game.category,
                        platform: game.platform,
                        description: game.description,
                        accountId: game.accountId || '',
                        featured: !!game.featured
                      });
                      setGameModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGame(game.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PACKAGE MODAL */}
      {pkgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">
              {pkgEditId ? 'Paketi Düzenle' : 'Yeni Oyun Paketi Oluştur'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">Pakete dahil edilecek oyunları ve müşterinin seçebileceği adet sınırını belirleyin.</p>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Paket Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Steam 3 Oyunluk Mega Paket"
                  value={pkgForm.name}
                  onChange={e => setPkgForm({ ...pkgForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Seçilebilecek Oyun Adedi</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pkgForm.selectableGameCount}
                    onChange={e => setPkgForm({ ...pkgForm, selectableGameCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Müşteri listeden kaç oyun seçebilir?</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Açıklama (İsteğe bağlı)</label>
                  <input
                    type="text"
                    placeholder="Listedeki oyunlardan istediğiniz 2 tanesini seçin."
                    value={pkgForm.description}
                    onChange={e => setPkgForm({ ...pkgForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Game checklist */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Pakete Dahil Oyunlar</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {games.map(game => {
                    const isChecked = pkgForm.gameIds.includes(game.id);
                    return (
                      <div
                        key={game.id}
                        onClick={() => toggleGameInPackage(game.id)}
                        className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-xs truncate">{game.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPkgModalOpen(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GAME MODAL */}
      {gameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              {gameEditId ? 'Oyunu Düzenle' : 'Kataloğa Yeni Oyun Ekle'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">Mağaza vitrininde sergilenecek ve paketlere eklenebilecek oyunu girin.</p>

            <form onSubmit={handleSaveGame} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Oyun Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Grand Theft Auto V"
                  value={gameForm.title}
                  onChange={e => setGameForm({ ...gameForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Platform</label>
                  <select
                    value={gameForm.platform}
                    onChange={e => setGameForm({ ...gameForm, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Steam">Steam</option>
                    <option value="Epic Games">Epic Games</option>
                    <option value="EA Origin">EA Origin</option>
                    <option value="Ubisoft">Ubisoft</option>
                    <option value="Battle.net">Battle.net</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                  <input
                    type="text"
                    placeholder="Aksiyon / Açık Dünya"
                    value={gameForm.category}
                    onChange={e => setGameForm({ ...gameForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kapak Görseli URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={gameForm.coverUrl}
                  onChange={e => setGameForm({ ...gameForm, coverUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bağlı Doğrulama Hesabı</label>
                <select
                  value={gameForm.accountId}
                  onChange={e => setGameForm({ ...gameForm, accountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="">Ortak / Manuel Hesap</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.platform.toUpperCase()}] {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGameModalOpen(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
