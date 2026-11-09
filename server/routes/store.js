const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Get Public Store Settings & Showcase
 */
router.get('/info', handleStoreInfo);
router.get('/info/:slug', handleStoreInfo);

function handleStoreInfo(req, res) {
  const storeSettings = db.getStoreSettings();
  const license = db.getLicense();

  // If requested slug doesn't match and not empty, check
  const requestedSlug = req.params.slug;
  if (requestedSlug && storeSettings.slug && storeSettings.slug.toLowerCase() !== requestedSlug.toLowerCase()) {
    // In demo / multi-store mode, we still return the current store settings
  }

  // Games for public showcase
  let games = [];
  if (storeSettings.showGameShowcase) {
    games = db.getGames().map(g => ({
      id: g.id,
      title: g.title,
      coverUrl: g.coverUrl,
      category: g.category,
      platform: g.platform,
      description: g.description,
      featured: g.featured
    }));
  }

  res.json({
    success: true,
    store: {
      storeName: storeSettings.storeName,
      slug: storeSettings.slug,
      slogan: storeSettings.slogan,
      tabTitle: storeSettings.tabTitle,
      faviconUrl: storeSettings.faviconUrl,
      logoUrl: storeSettings.logoUrl,
      bannerUrl: storeSettings.bannerUrl,
      themeColor: storeSettings.themeColor || 'indigo',
      announcement: storeSettings.announcement,
      customDomain: storeSettings.customDomain,
      customCss: storeSettings.customCss,
      isStoreActive: license.isActive
    },
    games
  });
}

/**
 * Submit Customer Feedback / Suggestion
 */
router.post('/feedback', (req, res) => {
  const { type, customerContact, message, key } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Mesaj alanı zorunludur.' });
  }

  const item = db.addFeedback({
    type,
    customerContact,
    message: message.trim(),
    key: key ? key.trim() : ''
  });

  res.json({
    success: true,
    message: 'Talebiniz / öneriniz mağaza yönetimine başarıyla iletildi. Teşekkür ederiz!',
    feedback: item
  });
});

module.exports = router;
