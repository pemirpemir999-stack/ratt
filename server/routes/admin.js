const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { testImapConnection } = require('../imapClient');
const { generateTotp } = require('../totpClient');
const { fetchExnorGuard } = require('../exnorClient');

const JWT_SECRET = 'flexora-secret-jwt-key-super-safe-2026';

// Middleware to protect admin routes
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yetkilendirme başarısız. Lütfen giriş yapın.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Oturum süresi dolmuş veya geçersiz token.' });
  }
}

/**
 * Admin Login
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = db.getAdmin();

  if (!username || !password) {
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
  }

  const isUsernameMatch = username.toLowerCase() === admin.username.toLowerCase();
  let isPasswordMatch = false;

  // Check bcrypt or default fallback
  try {
    isPasswordMatch = await bcrypt.compare(password, admin.passwordHash);
  } catch {
    isPasswordMatch = (password === admin.passwordHash);
  }

  if (!isUsernameMatch || !isPasswordMatch) {
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı!' });
  }

  const token = jwt.sign(
    { username: admin.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: { username: admin.username }
  });
});

/**
 * Get Current Admin Profile
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

/**
 * Change Admin Password
 */
router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalıdır.' });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  db.updateAdminPassword(hash);

  res.json({ success: true, message: 'Şifreniz başarıyla güncellendi!' });
});

/**
 * Dashboard Stats
 */
router.get('/stats', requireAuth, (req, res) => {
  const stats = db.getStats();
  const license = db.getLicense();
  res.json({ success: true, stats, license });
});

/**
 * Accounts Management
 */
router.get('/accounts', requireAuth, (req, res) => {
  res.json({ success: true, accounts: db.getAccounts() });
});

router.post('/accounts', requireAuth, (req, res) => {
  const acc = db.addAccount(req.body);
  res.json({ success: true, account: acc });
});

router.put('/accounts/:id', requireAuth, (req, res) => {
  const updated = db.updateAccount(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Hesap bulunamadı.' });
  res.json({ success: true, account: updated });
});

router.delete('/accounts/:id', requireAuth, (req, res) => {
  db.deleteAccount(req.params.id);
  res.json({ success: true, message: 'Hesap silindi.' });
});

// Bulk Account Import
router.post('/accounts/bulk-import', requireAuth, (req, res) => {
  const { rawText, defaultPlatform, defaultDelivery, authType, imapHost, imapPort, imapSecure } = req.body;
  if (!rawText || typeof rawText !== 'string') {
    return res.status(400).json({ error: 'İçe aktarılacak metin bulunamadı.' });
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const imported = [];

  for (const line of lines) {
    // Format options:
    // 1) user:pass
    // 2) user:pass:platform
    // 3) email:pass:imapHost:imapPort
    const parts = line.split(':').map(p => p.trim());
    if (parts.length >= 2) {
      const username = parts[0];
      const password = parts[1];
      const platform = parts[2] || defaultPlatform || 'steam';
      const host = parts[3] || imapHost || (username.includes('@gmail') ? 'imap.gmail.com' : 'outlook.office365.com');
      const port = Number(parts[4]) || Number(imapPort) || 993;

      const acc = db.addAccount({
        name: `${platform.toUpperCase()} - ${username.split('@')[0]}`,
        platform: platform.toLowerCase(),
        deliveryType: defaultDelivery || 'info_and_code',
        credentials: { username, password },
        authType: authType || 'imap',
        imapConfig: {
          host,
          port,
          secure: imapSecure !== false,
          user: username,
          pass: password,
          mailbox: 'INBOX'
        }
      });
      imported.push(acc);
    }
  }

  res.json({
    success: true,
    message: `${imported.length} adet hesap başarıyla içeri aktarıldı.`,
    count: imported.length,
    accounts: imported
  });
});

// Live Test IMAP
router.post('/accounts/test-imap', requireAuth, async (req, res) => {
  const result = await testImapConnection(req.body);
  res.json(result);
});

// Live Test TOTP
router.post('/accounts/test-totp', requireAuth, (req, res) => {
  const { secret } = req.body;
  try {
    const result = generateTotp(secret);
    res.json({
      success: true,
      code: result.code,
      remainingSeconds: result.remainingSeconds,
      message: '2FA TOTP kodu başarıyla üretildi!'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Live Test Exnor Guard Bridge
router.post('/accounts/test-exnor', requireAuth, async (req, res) => {
  const { accessCode, host } = req.body;
  try {
    const result = await fetchExnorGuard(accessCode, host || 'https://exnor.com.tr');
    res.json({
      success: true,
      data: result,
      message: `Bağlantı başarılı! ${result.title} için Steam Guard kodu (${result.code}) çekildi.`
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * Key Management
 */
router.get('/keys', requireAuth, (req, res) => {
  res.json({ success: true, keys: db.getKeys() });
});

router.post('/keys', requireAuth, (req, res) => {
  const key = db.createKey(req.body);
  res.json({ success: true, key });
});

router.post('/keys/bulk', requireAuth, (req, res) => {
  const keys = db.createBulkKeys(req.body);
  res.json({
    success: true,
    message: `${keys.length} adet key başarıyla üretildi.`,
    keys
  });
});

router.delete('/keys/:id', requireAuth, (req, res) => {
  db.deleteKey(req.params.id);
  res.json({ success: true, message: 'Key silindi.' });
});

router.post('/keys/purge', requireAuth, (req, res) => {
  const count = db.purgeKeys();
  res.json({
    success: true,
    message: `${count} adet süresi dolmuş veya tükenmiş key temizlendi.`,
    purgedCount: count
  });
});

/**
 * Packages & Games
 */
router.get('/packages', requireAuth, (req, res) => {
  res.json({ success: true, packages: db.getPackages() });
});

router.post('/packages', requireAuth, (req, res) => {
  const pkg = db.savePackage(req.body);
  res.json({ success: true, package: pkg });
});

router.delete('/packages/:id', requireAuth, (req, res) => {
  db.deletePackage(req.params.id);
  res.json({ success: true, message: 'Paket silindi.' });
});

router.get('/games', requireAuth, (req, res) => {
  res.json({ success: true, games: db.getGames() });
});

router.post('/games', requireAuth, (req, res) => {
  const game = db.saveGame(req.body);
  res.json({ success: true, game });
});

router.delete('/games/:id', requireAuth, (req, res) => {
  db.deleteGame(req.params.id);
  res.json({ success: true, message: 'Oyun silindi.' });
});

/**
 * Store Customization Settings
 */
router.get('/settings', requireAuth, (req, res) => {
  res.json({ success: true, settings: db.getStoreSettings() });
});

router.put('/settings', requireAuth, (req, res) => {
  const updated = db.updateStoreSettings(req.body);
  res.json({ success: true, settings: updated, message: 'Mağaza ayarları kaydedildi.' });
});

/**
 * Customer Feedback
 */
router.get('/feedback', requireAuth, (req, res) => {
  res.json({ success: true, feedback: db.getFeedback() });
});

router.put('/feedback/:id/status', requireAuth, (req, res) => {
  const item = db.updateFeedbackStatus(req.params.id, req.body.status);
  res.json({ success: true, feedback: item });
});

router.delete('/feedback/:id', requireAuth, (req, res) => {
  db.deleteFeedback(req.params.id);
  res.json({ success: true, message: 'Talep silindi.' });
});

/**
 * License & Setup Management
 */
router.get('/license', requireAuth, (req, res) => {
  res.json({ success: true, license: db.getLicense() });
});

router.post('/license/activate', requireAuth, (req, res) => {
  const { code } = req.body;
  const result = db.activateLicense(code);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

router.post('/license/generate-test-key', requireAuth, (req, res) => {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  const testCode = `ZG-PRO-30D-${random}`;
  res.json({
    success: true,
    code: testCode,
    message: 'Yeni 30 günlük lisans kodu oluşturuldu.'
  });
});

module.exports = router;
