const express = require('express');
const router = express.Router();
const db = require('../db');
const { fetchLatestCode } = require('../imapClient');
const { generateTotp } = require('../totpClient');
const { fetchExnorGuard } = require('../exnorClient');

// Rate limiting in-memory map for basic DDoS/spam protection
const clientRequests = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const record = clientRequests.get(ip) || { count: 0, resetAt: now + 60000 };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + 60000;
  } else {
    record.count++;
  }
  clientRequests.set(ip, record);
  return record.count <= 60; // Max 60 requests per minute
}

/**
 * Check Key Status (Public)
 */
router.post('/check-key', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Çok fazla istek yapıldı. Lütfen biraz bekleyin.' });
  }

  const { keyCode } = req.body;
  if (!keyCode) {
    return res.status(400).json({ error: 'Key kodu zorunludur.' });
  }

  const key = db.getKeyByCode(keyCode);
  if (!key) {
    return res.status(404).json({ error: 'Geçersiz veya bulunamayan erişim anahtarı (Key).' });
  }

  const now = new Date();

  // Expiration checks
  if (key.expiresAt && new Date(key.expiresAt) < now) {
    return res.status(403).json({
      error: 'Bu keyin kullanım süresi dolmuştur.',
      isExpired: true,
      key
    });
  }

  // Validity days check from first use
  if (key.firstUsedAt && key.validityDays > 0) {
    const expiryFromFirstUse = new Date(new Date(key.firstUsedAt).getTime() + key.validityDays * 24 * 60 * 60 * 1000);
    if (expiryFromFirstUse < now) {
      return res.status(403).json({
        error: `Bu keyin ${key.validityDays} günlük geçerlilik süresi dolmuştur.`,
        isExpired: true,
        key
      });
    }
  }

  // Max uses check
  const isExhausted = key.maxUses > 0 && key.usedCount >= key.maxUses;
  if (isExhausted) {
    return res.status(403).json({
      error: 'Bu keyin kullanım hakkı tükenmiştir.',
      isExhausted: true,
      key
    });
  }

  // Cooldown check
  let cooldownRemaining = 0;
  if (key.lastUsedAt && key.cooldownSeconds > 0) {
    const elapsed = (now - new Date(key.lastUsedAt)) / 1000;
    if (elapsed < key.cooldownSeconds) {
      cooldownRemaining = Math.ceil(key.cooldownSeconds - elapsed);
    }
  }

  // Determine delivery content
  let account = null;
  let pkg = null;
  let games = [];

  if (key.packageId) {
    pkg = db.getPackageById(key.packageId);
    if (pkg && Array.isArray(pkg.gameIds)) {
      games = pkg.gameIds.map(gid => db.getGameById(gid)).filter(Boolean);
    }
  } else if (key.accountId) {
    const acc = db.getAccountById(key.accountId);
    if (acc) {
      account = {
        id: acc.id,
        name: acc.name,
        platform: acc.platform,
        deliveryType: key.deliveryType === 'inherit' ? acc.deliveryType : key.deliveryType,
        authType: acc.authType,
        extraNotes: acc.credentials?.extraNotes || ''
      };

      // Only reveal credentials if deliveryType allows it
      const effectiveDelivery = key.deliveryType === 'inherit' ? acc.deliveryType : key.deliveryType;
      if (effectiveDelivery === 'info_only' || effectiveDelivery === 'info_and_code') {
        account.username = acc.credentials?.username || '';
        account.password = acc.credentials?.password || '';
      }
    }
  }

  // Check if games already selected for package
  let selectedGamesData = [];
  if (key.selectedGames && key.selectedGames.length > 0) {
    selectedGamesData = key.selectedGames.map(gid => {
      const g = db.getGameById(gid);
      if (!g) return null;
      let accData = null;
      if (g.accountId) {
        const ga = db.getAccountById(g.accountId);
        if (ga) {
          accData = {
            name: ga.name,
            platform: ga.platform,
            username: ga.credentials?.username,
            password: ga.credentials?.password,
            authType: ga.authType,
            deliveryType: ga.deliveryType
          };
        }
      }
      return {
        ...g,
        account: accData
      };
    }).filter(Boolean);
  }

  res.json({
    success: true,
    key: {
      keyCode: key.keyCode,
      deliveryType: key.deliveryType,
      maxUses: key.maxUses,
      usedCount: key.usedCount,
      remainingUses: key.maxUses > 0 ? Math.max(0, key.maxUses - key.usedCount) : 'Sınırsız',
      cooldownSeconds: key.cooldownSeconds,
      cooldownRemaining,
      burnOnView: key.burnOnView,
      isViewed: key.isViewed,
      validityDays: key.validityDays,
      expiresAt: key.expiresAt
    },
    account,
    package: pkg ? {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      selectableGameCount: pkg.selectableGameCount,
      availableGames: games
    } : null,
    selectedGames: selectedGamesData
  });
});

/**
 * Fetch Live Code (Public)
 */
router.post('/fetch-code', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Çok fazla istek yapıldı. Lütfen biraz bekleyin.' });
  }

  const { keyCode, targetAccountId } = req.body;
  if (!keyCode) {
    return res.status(400).json({ error: 'Key kodu zorunludur.' });
  }

  const key = db.getKeyByCode(keyCode);
  if (!key) {
    return res.status(404).json({ error: 'Geçersiz key.' });
  }

  const now = new Date();

  // Expiration checks
  if (key.expiresAt && new Date(key.expiresAt) < now) {
    return res.status(403).json({ error: 'Bu keyin kullanım süresi dolmuştur.' });
  }

  if (key.maxUses > 0 && key.usedCount >= key.maxUses) {
    return res.status(403).json({ error: 'Bu keyin tüm kullanım hakları tükenmiştir.' });
  }

  // Cooldown check
  if (key.lastUsedAt && key.cooldownSeconds > 0) {
    const elapsed = (now - new Date(key.lastUsedAt)) / 1000;
    if (elapsed < key.cooldownSeconds) {
      const wait = Math.ceil(key.cooldownSeconds - elapsed);
      return res.status(429).json({
        error: `Lütfen tekrar kod istemeden önce ${wait} saniye bekleyin.`,
        cooldownRemaining: wait
      });
    }
  }

  // Determine account to fetch code from
  let accountId = key.accountId;
  if (!accountId && targetAccountId) {
    // If it's a package key, the customer might request code for one of their selected games' accounts
    accountId = targetAccountId;
  }

  if (!accountId) {
    return res.status(400).json({ error: 'Bu keye bağlı bir doğrulama hesabı bulunamadı.' });
  }

  const account = db.getAccountById(accountId);
  if (!account) {
    return res.status(404).json({ error: 'Hesap veritabanında bulunamadı.' });
  }

  try {
    let result = null;

    if (account.authType === 'exnor') {
      // Exnor / External Guard Bridge
      const accessCode = account.exnorKey || account.credentials?.password || account.totpSecret;
      const exnorResult = await fetchExnorGuard(accessCode, account.exnorHost || 'https://exnor.com.tr');
      result = {
        code: exnorResult.code,
        type: 'exnor',
        remainingSeconds: exnorResult.remainingSeconds || 30,
        step: 30,
        platform: 'steam',
        accountName: account.name,
        isDemo: false
      };
    } else if (account.authType === 'totp') {
      // 2FA Authenticator
      const totpData = generateTotp(account.totpSecret);
      result = {
        code: totpData.code,
        type: 'totp',
        remainingSeconds: totpData.remainingSeconds,
        step: totpData.step,
        platform: account.platform,
        accountName: account.name,
        isDemo: account.totpSecret === 'JBSWY3DPEHPK3PXP'
      };
    } else {
      // IMAP Email fetcher
      const imapResult = await fetchLatestCode(account);
      result = {
        code: imapResult.code,
        type: 'imap',
        subject: imapResult.subject,
        from: imapResult.from,
        receivedAt: imapResult.receivedAt,
        isDemo: imapResult.isDemo,
        platform: account.platform,
        accountName: account.name,
        note: imapResult.note
      };
    }

    // Update key usage
    const updates = {
      usedCount: key.usedCount + 1,
      lastUsedAt: now.toISOString(),
      firstUsedAt: key.firstUsedAt || now.toISOString()
    };
    db.updateKey(key.id, updates);

    // Audit log
    db.addLog({
      keyCode: key.keyCode,
      platform: account.platform,
      type: 'code_fetch',
      success: true,
      code: result.code,
      ip,
      detail: `${account.name} için kod teslim edildi (${account.authType.toUpperCase()})`
    });

    const remainingUses = key.maxUses > 0 ? Math.max(0, key.maxUses - (key.usedCount + 1)) : 'Sınırsız';

    res.json({
      success: true,
      data: result,
      remainingUses,
      cooldownSeconds: key.cooldownSeconds
    });
  } catch (err) {
    db.addLog({
      keyCode: key.keyCode,
      platform: account.platform,
      type: 'code_fetch',
      success: false,
      ip,
      detail: err.message
    });

    res.status(500).json({
      error: err.message || 'Kod çekilirken beklenmedik bir hata oluştu.'
    });
  }
});

/**
 * Mark Key Credentials as Viewed (Single-view burn)
 */
router.post('/view-credentials', (req, res) => {
  const { keyCode } = req.body;
  if (!keyCode) return res.status(400).json({ error: 'Key gereklidir.' });

  const key = db.getKeyByCode(keyCode);
  if (!key) return res.status(404).json({ error: 'Key bulunamadı.' });

  if (key.burnOnView && !key.isViewed) {
    db.updateKey(key.id, {
      isViewed: true,
      usedCount: key.maxUses > 0 ? key.maxUses : key.usedCount + 1, // Consumed!
      lastUsedAt: new Date().toISOString()
    });

    db.addLog({
      keyCode: key.keyCode,
      type: 'credentials_burn',
      success: true,
      detail: 'Tek kullanımlık hesap bilgisi görüntülendi ve key tüketildi.'
    });
  }

  res.json({ success: true, message: 'Hesap bilgileri onaylandı.' });
});

/**
 * Customer Selects Games for Package Key
 */
router.post('/select-games', (req, res) => {
  const { keyCode, gameIds } = req.body;
  if (!keyCode || !Array.isArray(gameIds)) {
    return res.status(400).json({ error: 'Geçersiz parametreler.' });
  }

  const key = db.getKeyByCode(keyCode);
  if (!key || !key.packageId) {
    return res.status(404).json({ error: 'Paket keyi bulunamadı.' });
  }

  if (key.selectedGames && key.selectedGames.length > 0) {
    return res.status(400).json({ error: 'Bu key için oyun seçimi daha önce zaten yapılmış.' });
  }

  const pkg = db.getPackageById(key.packageId);
  if (!pkg) {
    return res.status(404).json({ error: 'Paket bulunamadı.' });
  }

  if (gameIds.length !== pkg.selectableGameCount) {
    return res.status(400).json({ error: `Bu paketten tam olarak ${pkg.selectableGameCount} adet oyun seçmelisiniz.` });
  }

  // Validate that selected gameIds belong to the package
  const valid = gameIds.every(id => pkg.gameIds.includes(id));
  if (!valid) {
    return res.status(400).json({ error: 'Seçilen oyunlardan bazıları bu pakette bulunmuyor.' });
  }

  db.updateKey(key.id, {
    selectedGames: gameIds,
    firstUsedAt: key.firstUsedAt || new Date().toISOString()
  });

  db.addLog({
    keyCode: key.keyCode,
    type: 'game_selection',
    success: true,
    detail: `${gameIds.length} adet oyun seçimi yapıldı.`
  });

  res.json({
    success: true,
    message: 'Oyun seçiminiz başarıyla kaydedildi!',
    selectedGameIds: gameIds
  });
});

module.exports = router;
