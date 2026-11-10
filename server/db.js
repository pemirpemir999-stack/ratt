const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

function resolveDbPath() {
  if (process.env.DB_PATH) return process.env.DB_PATH;

  // Render'da kalıcı disk varsayılanı /data. Dashboard'da Disk mount path'i /data olmalı.
  const defaultDir = process.env.RENDER
    ? '/data'
    : path.join(__dirname, '..', 'data');
  const dataDir = process.env.DATA_DIR || defaultDir;
  return path.join(dataDir, 'db.json');
}

const DB_PATH = resolveDbPath();

function ensureWritableDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const probe = path.join(dir, '.write-test');
  fs.writeFileSync(probe, 'ok');
  fs.unlinkSync(probe);
}

// Default initial state
const getInitialData = () => {
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    storeSettings: {
      storeName: 'Flexora Store',
      slug: 'magazam',
      slogan: '7/24 Otomatik Doğrulama Kodu & Hesap Teslimatı',
      tabTitle: 'Flexora | Anında Doğrulama & Hesap Teslimatı',
      faviconUrl: '',
      logoUrl: '',
      bannerUrl: '',
      themeColor: 'indigo', // indigo, cyan, emerald, purple, rose, amber
      announcement: '🔥 Flexora sistemine hoş geldiniz! Keyinizi girerek anında kodunuzu veya hesap bilgilerinizi alabilirsiniz.',
      customDomain: '',
      showGameShowcase: true,
      customCss: ''
    },
    license: {
      licenseKey: 'ZG-PRO-DEMO-30DAYS-VALID',
      plan: 'Pro Mağaza Lisansı (1 Ay)',
      isActive: true,
      activatedAt: now.toISOString(),
      expiresAt: thirtyDaysLater.toISOString(),
      history: [
        {
          code: 'ZG-PRO-DEMO-30DAYS-VALID',
          activatedAt: now.toISOString(),
          addedDays: 30
        }
      ]
    },
    admin: {
      username: 'flexora999',
      passwordHash: '$2b$10$qIL9VkhtMQ2gzzEbyFC45OH9xpyiKNAdsGOLXzEqMOMwLsUkJNpOq', // 'WCU4w6bHzygLpEV'
      lastLogin: null
    },
    accounts: [
      {
        id: 'acc-steam-demo',
        name: 'Steam CS2 + Cyberpunk 2077 VIP',
        platform: 'steam',
        deliveryType: 'info_and_code', // code_only, info_only, info_and_code
        credentials: {
          username: 'flexora_steam_vip',
          password: 'SteamMasterPass2026!',
          extraNotes: 'Aile paylaşımı aktiftir. Steam Guard kodu aşağıdan tek tıkla alınabilir.'
        },
        authType: 'totp', // totp, imap, static
        imapConfig: {
          host: 'imap.gmail.com',
          port: 993,
          secure: true,
          user: 'orneksteam@gmail.com',
          pass: 'app-password-buraya',
          mailbox: 'INBOX'
        },
        totpSecret: 'JBSWY3DPEHPK3PXP', // Base32 test secret for live 2FA
        isActive: true,
        createdAt: now.toISOString()
      },
      {
        id: 'acc-netflix-demo',
        name: 'Netflix Ultra HD 4K (Mail Kodlu)',
        platform: 'netflix',
        deliveryType: 'code_only',
        credentials: {
          username: 'netflix_4k_musteri@flexora.net',
          password: 'GizliHesapSifresi',
          extraNotes: 'Sadece televizyon veya tarayıcıdan giriş yapıp gelen onay kodunu çekiniz.'
        },
        authType: 'imap',
        imapConfig: {
          host: 'outlook.office365.com',
          port: 993,
          secure: true,
          user: 'orneknetflix@outlook.com',
          pass: 'outlook-sifre-buraya',
          mailbox: 'INBOX'
        },
        totpSecret: '',
        isActive: true,
        createdAt: now.toISOString()
      },
      {
        id: 'acc-chatgpt-demo',
        name: 'ChatGPT Plus (GPT-4o) 1 Aylık',
        platform: 'chatgpt',
        deliveryType: 'info_and_code',
        credentials: {
          username: 'chatgpt_pro_user@flexora.net',
          password: 'GptSuperSecret42!',
          extraNotes: 'OpenAI mail onay kodu istendiğinde aşağıdaki butona tıklayınız.'
        },
        authType: 'imap',
        imapConfig: {
          host: 'imap.gmail.com',
          port: 993,
          secure: true,
          user: 'ornekgpt@gmail.com',
          pass: 'app-password',
          mailbox: 'INBOX'
        },
        totpSecret: '',
        isActive: true,
        createdAt: now.toISOString()
      }
    ],
    games: [
      {
        id: 'game-1',
        title: 'Grand Theft Auto V: Premium Edition',
        coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        category: 'Aksiyon / Açık Dünya',
        platform: 'Steam',
        description: 'Rockstar Games klasiği, Los Santos macerası ve online erişim.',
        accountId: 'acc-steam-demo',
        featured: true,
        createdAt: now.toISOString()
      },
      {
        id: 'game-2',
        title: 'Cyberpunk 2077: Phantom Liberty',
        coverUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
        category: 'RPG / Bilim Kurgu',
        platform: 'Steam',
        description: 'Night City sokaklarında geleceğin efsanesi olun.',
        accountId: 'acc-steam-demo',
        featured: true,
        createdAt: now.toISOString()
      },
      {
        id: 'game-3',
        title: 'Red Dead Redemption 2',
        coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
        category: 'Vahşi Batı / Macera',
        platform: 'Steam',
        description: 'Arthur Morgan ve Van der Linde çetesiyle destansı bir yolculuk.',
        accountId: 'acc-steam-demo',
        featured: true,
        createdAt: now.toISOString()
      },
      {
        id: 'game-4',
        title: 'Elden Ring - Shadow of the Erdtree',
        coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        category: 'Souls-like / RPG',
        platform: 'Steam',
        description: 'FromSoftware başyapıtı, Yılın Oyunu.',
        accountId: 'acc-steam-demo',
        featured: false,
        createdAt: now.toISOString()
      }
    ],
    packages: [
      {
        id: 'pkg-steam-triple',
        name: 'Steam Efsane Paket (İstediğin 2 Oyunu Seç)',
        description: 'Aşağıdaki 4 popüler oyundan dilediğiniz 2 tanesini seçip anında hesap ve kod erişimi kazanın.',
        selectableGameCount: 2,
        gameIds: ['game-1', 'game-2', 'game-3', 'game-4'],
        subPackageIds: [],
        createdAt: now.toISOString()
      }
    ],
    keys: [
      {
        id: 'key-demo-1',
        keyCode: 'ZG-STEAM-DEMO-2026',
        accountId: 'acc-steam-demo',
        packageId: null,
        deliveryType: 'inherit',
        burnOnView: false,
        maxUses: 10,
        usedCount: 0,
        cooldownSeconds: 30,
        lastUsedAt: null,
        expiresAt: thirtyDaysLater.toISOString(),
        validityDays: 30,
        firstUsedAt: null,
        selectedGames: [],
        isViewed: false,
        notes: 'Demo Steam Hesabı Keyi',
        createdAt: now.toISOString()
      },
      {
        id: 'key-demo-netflix',
        keyCode: 'ZG-NETFLIX-4K-PASS',
        accountId: 'acc-netflix-demo',
        packageId: null,
        deliveryType: 'code_only',
        burnOnView: false,
        maxUses: 5,
        usedCount: 0,
        cooldownSeconds: 45,
        lastUsedAt: null,
        expiresAt: thirtyDaysLater.toISOString(),
        validityDays: 30,
        firstUsedAt: null,
        selectedGames: [],
        isViewed: false,
        notes: 'Netflix 4K Kod Keyi',
        createdAt: now.toISOString()
      },
      {
        id: 'key-demo-package',
        keyCode: 'ZG-BUNDLE-SELECT-GAME',
        accountId: null,
        packageId: 'pkg-steam-triple',
        deliveryType: 'info_and_code',
        burnOnView: false,
        maxUses: 3,
        usedCount: 0,
        cooldownSeconds: 60,
        lastUsedAt: null,
        expiresAt: thirtyDaysLater.toISOString(),
        validityDays: 30,
        firstUsedAt: null,
        selectedGames: [],
        isViewed: false,
        notes: 'Steam Paket Seçimli Key',
        createdAt: now.toISOString()
      }
    ],
    feedback: [
      {
        id: 'fb-demo-1',
        type: 'suggestion',
        customerContact: 'musteri@gmail.com',
        message: 'EA Play ve Ubisoft oyunları için de paket sistemi eklerseniz çok seviniriz!',
        key: 'ZG-STEAM-DEMO-2026',
        status: 'reviewed',
        createdAt: now.toISOString()
      }
    ],
    logs: [
      {
        id: 'log-1',
        keyCode: 'ZG-STEAM-DEMO-2026',
        platform: 'steam',
        type: 'code_fetch',
        success: true,
        code: 'A9K2M',
        ip: '127.0.0.1',
        timestamp: now.toISOString(),
        detail: 'Steam Guard kodu başarıyla teslim edildi (2FA TOTP)'
      }
    ]
  };
};

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    const dir = path.dirname(DB_PATH);
    try {
      ensureWritableDir(dir);
    } catch (err) {
      const fallbackDir = path.join(__dirname, '..', 'data');
      console.error(`[DB] ${dir} yazilamiyor (${err.message}). Gecici klasore dusuluyor: ${fallbackDir}`);
      console.error('[DB] Render kullanıyorsan Persistent Disk ekle ve DATA_DIR=/data yap. Yoksa keyler restartta silinir.');
      try {
        ensureWritableDir(fallbackDir);
        // Keep using fallback path for this process
        this._fallbackPath = path.join(fallbackDir, 'db.json');
      } catch (fallbackErr) {
        console.error('[DB] Fallback klasoru de yazilamiyor:', fallbackErr);
      }
    }

    const filePath = this.getPath();
    const bundled = path.join(__dirname, '..', 'data', 'db.json');
    try {
      if (!fs.existsSync(filePath) && fs.existsSync(bundled) && path.resolve(bundled) !== path.resolve(filePath)) {
        fs.copyFileSync(bundled, filePath);
        console.log(`[DB] Mevcut db.json kalici diske kopyalandi: ${filePath}`);
      }
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        this.data = JSON.parse(raw);
        const initial = getInitialData();
        for (const key of Object.keys(initial)) {
          if (!this.data[key]) {
            this.data[key] = initial[key];
          }
        }
        console.log(`[DB] Veritabani yuklendi: ${filePath} (key sayisi: ${this.data.keys?.length || 0})`);
      } else {
        this.data = getInitialData();
        this.save();
        console.log(`[DB] Yeni veritabani olusturuldu: ${filePath}`);
      }
    } catch (err) {
      console.error('[DB] Okuma hatasi, mevcut dosya ezilmeyecek:', err.message);
      const bak = filePath + '.bak';
      if (fs.existsSync(bak)) {
        try {
          this.data = JSON.parse(fs.readFileSync(bak, 'utf-8'));
          console.log('[DB] Yedekten yuklendi:', bak);
          return;
        } catch (bakErr) {
          console.error('[DB] Yedek de okunamadi:', bakErr.message);
        }
      }
      this.data = getInitialData();
    }
  }

  getPath() {
    return this._fallbackPath || DB_PATH;
  }

  save() {
    try {
      const filePath = this.getPath();
      const dir = path.dirname(filePath);
      ensureWritableDir(dir);

      const payload = JSON.stringify(this.data, null, 2);
      const tmp = filePath + '.tmp';
      fs.writeFileSync(tmp, payload, 'utf-8');
      try {
        fs.renameSync(tmp, filePath);
      } catch {
        fs.copyFileSync(tmp, filePath);
        fs.unlinkSync(tmp);
      }
      try {
        fs.copyFileSync(filePath, filePath + '.bak');
      } catch {
        // yedek opsiyonel
      }
    } catch (err) {
      console.error('[DB] Kayit BASARISIZ — keyler restartta kaybolabilir:', err);
    }
  }

  // Store Settings
  getStoreSettings() {
    return this.data.storeSettings;
  }

  updateStoreSettings(settings) {
    this.data.storeSettings = { ...this.data.storeSettings, ...settings };
    this.save();
    return this.data.storeSettings;
  }

  // License Management
  getLicense() {
    const lic = this.data.license;
    const now = new Date();
    const expiresAt = new Date(lic.expiresAt);
    const isExpired = expiresAt < now;
    const daysRemaining = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));

    return {
      ...lic,
      isExpired,
      daysRemaining,
      isActive: lic.isActive && !isExpired
    };
  }

  activateLicense(code) {
    if (!code || typeof code !== 'string') {
      return { success: false, message: 'Geçersiz lisans kodu formatı.' };
    }

    const cleanCode = code.trim().toUpperCase();
    // Validate code pattern (e.g. ZG-PRO-..., or any 16+ char license code)
    if (cleanCode.length < 8) {
      return { success: false, message: 'Lisans kodu en az 8 karakter olmalıdır.' };
    }

    const now = new Date();
    const currentExpiry = new Date(this.data.license.expiresAt);
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

    this.data.license.licenseKey = cleanCode;
    this.data.license.isActive = true;
    this.data.license.activatedAt = now.toISOString();
    this.data.license.expiresAt = newExpiry.toISOString();
    this.data.license.history = this.data.license.history || [];
    this.data.license.history.unshift({
      code: cleanCode,
      activatedAt: now.toISOString(),
      addedDays: 30
    });

    this.save();
    return {
      success: true,
      message: 'Lisansınız başarıyla 30 gün uzatıldı!',
      license: this.getLicense()
    };
  }

  // Accounts
  getAccounts() {
    return this.data.accounts;
  }

  getAccountById(id) {
    return this.data.accounts.find(a => a.id === id);
  }

  addAccount(accData) {
    const newAccount = {
      id: 'acc-' + nanoid(8),
      name: accData.name || 'Yeni Hesap',
      platform: accData.platform || 'custom',
      deliveryType: accData.deliveryType || 'info_and_code',
      credentials: {
        username: accData.credentials?.username || '',
        password: accData.credentials?.password || '',
        extraNotes: accData.credentials?.extraNotes || ''
      },
      authType: accData.authType || 'imap',
      imapConfig: {
        host: accData.imapConfig?.host || '',
        port: Number(accData.imapConfig?.port) || 993,
        secure: accData.imapConfig?.secure !== false,
        user: accData.imapConfig?.user || '',
        pass: accData.imapConfig?.pass || '',
        mailbox: accData.imapConfig?.mailbox || 'INBOX'
      },
      totpSecret: accData.totpSecret || '',
      exnorKey: accData.exnorKey || '',
      exnorHost: accData.exnorHost || 'https://exnor.com.tr',
      isActive: accData.isActive !== false,
      createdAt: new Date().toISOString()
    };
    this.data.accounts.unshift(newAccount);
    this.save();
    return newAccount;
  }

  updateAccount(id, accData) {
    const index = this.data.accounts.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.data.accounts[index] = {
      ...this.data.accounts[index],
      ...accData,
      credentials: {
        ...this.data.accounts[index].credentials,
        ...(accData.credentials || {})
      },
      imapConfig: {
        ...this.data.accounts[index].imapConfig,
        ...(accData.imapConfig || {})
      }
    };
    this.save();
    return this.data.accounts[index];
  }

  deleteAccount(id) {
    this.data.accounts = this.data.accounts.filter(a => a.id !== id);
    this.save();
    return true;
  }

  // Keys
  getKeys() {
    return this.data.keys;
  }

  getKeyByCode(code) {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    return this.data.keys.find(k => k.keyCode.toUpperCase() === clean);
  }

  createKey(keyData) {
    const now = new Date();
    const expiry = keyData.expiresAt ? new Date(keyData.expiresAt).toISOString() : null;

    const newKey = {
      id: 'key-' + nanoid(8),
      keyCode: (keyData.keyCode || ('ZG-' + nanoid(10))).toUpperCase(),
      accountId: keyData.accountId || null,
      packageId: keyData.packageId || null,
      deliveryType: keyData.deliveryType || 'inherit',
      burnOnView: !!keyData.burnOnView,
      maxUses: Number(keyData.maxUses) || 1,
      usedCount: 0,
      cooldownSeconds: Number(keyData.cooldownSeconds) || 60,
      lastUsedAt: null,
      expiresAt: expiry,
      validityDays: Number(keyData.validityDays) || 30,
      firstUsedAt: null,
      selectedGames: [],
      isViewed: false,
      notes: keyData.notes || '',
      createdAt: now.toISOString()
    };
    this.data.keys.unshift(newKey);
    this.save();
    return newKey;
  }

  createBulkKeys({ count, prefix, accountId, packageId, maxUses, cooldownSeconds, validityDays, burnOnView, deliveryType, notes }) {
    const qty = Math.min(Math.max(1, Number(count) || 1), 500);
    const pref = (prefix || 'ZG').trim().toUpperCase();
    const created = [];
    const now = new Date();

    for (let i = 0; i < qty; i++) {
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `${pref}-${randomPart}`;
      const newKey = {
        id: 'key-' + nanoid(8),
        keyCode: code,
        accountId: accountId || null,
        packageId: packageId || null,
        deliveryType: deliveryType || 'inherit',
        burnOnView: !!burnOnView,
        maxUses: Number(maxUses) || 1,
        usedCount: 0,
        cooldownSeconds: Number(cooldownSeconds) || 60,
        lastUsedAt: null,
        expiresAt: null,
        validityDays: Number(validityDays) || 30,
        firstUsedAt: null,
        selectedGames: [],
        isViewed: false,
        notes: notes || 'Toplu Üretim',
        createdAt: now.toISOString()
      };
      this.data.keys.unshift(newKey);
      created.push(newKey);
    }
    this.save();
    return created;
  }

  updateKey(id, updates) {
    const index = this.data.keys.findIndex(k => k.id === id);
    if (index === -1) return null;
    this.data.keys[index] = { ...this.data.keys[index], ...updates };
    this.save();
    return this.data.keys[index];
  }

  deleteKey(id) {
    this.data.keys = this.data.keys.filter(k => k.id !== id);
    this.save();
    return true;
  }

  purgeKeys() {
    const now = new Date();
    const initialCount = this.data.keys.length;
    this.data.keys = this.data.keys.filter(k => {
      // Keep if not exhausted
      const isExhausted = k.maxUses > 0 && k.usedCount >= k.maxUses;
      const isExpired = k.expiresAt && new Date(k.expiresAt) < now;
      return !isExhausted && !isExpired;
    });
    const purgedCount = initialCount - this.data.keys.length;
    this.save();
    return purgedCount;
  }

  // Games
  getGames() {
    return this.data.games;
  }

  getGameById(id) {
    return this.data.games.find(g => g.id === id);
  }

  saveGame(gameData) {
    if (gameData.id) {
      const idx = this.data.games.findIndex(g => g.id === gameData.id);
      if (idx !== -1) {
        this.data.games[idx] = { ...this.data.games[idx], ...gameData };
        this.save();
        return this.data.games[idx];
      }
    }
    const newGame = {
      id: 'game-' + nanoid(8),
      title: gameData.title || 'Yeni Oyun',
      coverUrl: gameData.coverUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      category: gameData.category || 'Oyun',
      platform: gameData.platform || 'Steam',
      description: gameData.description || '',
      accountId: gameData.accountId || '',
      featured: !!gameData.featured,
      createdAt: new Date().toISOString()
    };
    this.data.games.unshift(newGame);
    this.save();
    return newGame;
  }

  deleteGame(id) {
    this.data.games = this.data.games.filter(g => g.id !== id);
    this.save();
    return true;
  }

  // Packages
  getPackages() {
    return this.data.packages;
  }

  getPackageById(id) {
    return this.data.packages.find(p => p.id === id);
  }

  savePackage(pkgData) {
    if (pkgData.id) {
      const idx = this.data.packages.findIndex(p => p.id === pkgData.id);
      if (idx !== -1) {
        this.data.packages[idx] = { ...this.data.packages[idx], ...pkgData };
        this.save();
        return this.data.packages[idx];
      }
    }
    const newPkg = {
      id: 'pkg-' + nanoid(8),
      name: pkgData.name || 'Yeni Paket',
      description: pkgData.description || '',
      selectableGameCount: Number(pkgData.selectableGameCount) || 1,
      gameIds: Array.isArray(pkgData.gameIds) ? pkgData.gameIds : [],
      subPackageIds: Array.isArray(pkgData.subPackageIds) ? pkgData.subPackageIds : [],
      createdAt: new Date().toISOString()
    };
    this.data.packages.unshift(newPkg);
    this.save();
    return newPkg;
  }

  deletePackage(id) {
    this.data.packages = this.data.packages.filter(p => p.id !== id);
    this.save();
    return true;
  }

  // Feedback
  getFeedback() {
    return this.data.feedback;
  }

  addFeedback({ type, customerContact, message, key }) {
    const item = {
      id: 'fb-' + nanoid(8),
      type: type || 'suggestion',
      customerContact: customerContact || 'Anonim',
      message: message || '',
      key: key || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.feedback.unshift(item);
    this.save();
    return item;
  }

  updateFeedbackStatus(id, status) {
    const item = this.data.feedback.find(f => f.id === id);
    if (!item) return null;
    item.status = status;
    this.save();
    return item;
  }

  deleteFeedback(id) {
    this.data.feedback = this.data.feedback.filter(f => f.id !== id);
    this.save();
    return true;
  }

  // Logs
  getLogs(limit = 100) {
    return this.data.logs.slice(0, limit);
  }

  addLog(log) {
    const entry = {
      id: 'log-' + nanoid(8),
      keyCode: log.keyCode || 'N/A',
      platform: log.platform || 'general',
      type: log.type || 'code_fetch',
      success: !!log.success,
      code: log.code || '',
      ip: log.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      detail: log.detail || ''
    };
    this.data.logs.unshift(entry);
    if (this.data.logs.length > 500) {
      this.data.logs = this.data.logs.slice(0, 500);
    }
    this.save();
    return entry;
  }

  // Stats
  getStats() {
    const now = new Date();
    const totalAccounts = this.data.accounts.length;
    const totalKeys = this.data.keys.length;
    const activeKeys = this.data.keys.filter(k => {
      const isExhausted = k.maxUses > 0 && k.usedCount >= k.maxUses;
      const isExpired = k.expiresAt && new Date(k.expiresAt) < now;
      return !isExhausted && !isExpired;
    }).length;
    const totalVerifications = this.data.logs.filter(l => l.success).length;

    // Last 7 days activity
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = d.toISOString().split('T')[0];
      const count = this.data.logs.filter(l => l.timestamp.startsWith(dayStr)).length;
      days.push({ date: dayStr, count });
    }

    return {
      totalAccounts,
      totalKeys,
      activeKeys,
      totalVerifications,
      chartData: days,
      recentLogs: this.getLogs(10)
    };
  }

  getAdmin() {
    return this.data.admin;
  }

  updateAdminPassword(hash) {
    this.data.admin.passwordHash = hash;
    this.save();
    return true;
  }
}

module.exports = new Database();
