const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  if (!req.url.startsWith('/dist') && !req.url.startsWith('/assets')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api/store', require('./routes/store'));
app.use('/api/verify', require('./routes/verify'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const license = db.getLicense();
  res.json({
    status: 'online',
    version: '1.0.0 - Flexora Enterprise',
    timestamp: new Date().toISOString(),
    license: {
      isActive: license.isActive,
      daysRemaining: license.daysRemaining
    }
  });
});

// Serve frontend client build in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// SPA catch-all fallback
app.use((req, res) => {
  const indexHtml = path.join(clientDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Flexora Server</title></head>
        <body style="background:#090d16;color:#e2e8f0;font-family:sans-serif;padding:40px;text-align:center;">
          <h1 style="color:#6366f1;">🛡️ Flexora API & Sunucu Aktif</h1>
          <p>Client build henüz tamamlanmadıysa lütfen <code>npm run build</code> çalıştırınız.</p>
        </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🛡️  FLEXORA OTO-TESLİMAT VE DOĞRULAMA SİSTEMİ  🛡️`);
  console.log(`===============================================`);
  console.log(`🚀 Sunucu Çalışıyor: http://localhost:${PORT}`);
  console.log(`🛒 Mağaza Portalı:   http://localhost:${PORT}/store/magazam`);
  console.log(`🔐 Yönetici Paneli:  http://localhost:${PORT}/admin`);
  console.log(`===============================================`);
});
