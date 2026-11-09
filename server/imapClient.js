const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

// Platform matcher rules
const PLATFORM_RULES = {
  steam: {
    name: 'Steam',
    senders: ['steampowered.com', 'steamcommunity.com'],
    subjects: ['Steam Guard', 'Steam Destek', 'Your Steam account', 'Giriş Kodu', 'Steam access from new computer'],
    regex: [
      /(?:Steam Guard code is|Steam Guard kodunuz:|kodunuz:)\s*([A-Z0-9]{5})\b/i,
      /login to your account \w+:\s*([A-Z0-9]{5})\b/i,
      /\b([A-Z0-9]{5})\b/
    ]
  },
  netflix: {
    name: 'Netflix',
    senders: ['netflix.com', 'account.netflix.com'],
    subjects: ['Netflix', 'Oturum açma kodunuz', 'Your sign-in code', 'Geçici erişim', 'Temporary access code'],
    regex: [
      /(?:kodunuz:|code is:|şifreniz:)\s*(\d{4,6})\b/i,
      /\b(\d{4})\b/,
      /\b(\d{6})\b/
    ]
  },
  chatgpt: {
    name: 'ChatGPT / OpenAI',
    senders: ['openai.com', 'tm.openai.com'],
    subjects: ['OpenAI', 'ChatGPT', 'verification code', 'Doğrulama kodunuz', 'login code'],
    regex: [
      /(?:verification code is|doğrulama kodunuz:)\s*(\d{6})\b/i,
      /\b(\d{6})\b/
    ]
  },
  epic: {
    name: 'Epic Games',
    senders: ['epicgames.com', 'help@epicgames.com'],
    subjects: ['Epic Games', 'güvenlik kodu', 'security code', 'two-factor', '2FA'],
    regex: [
      /(?:security code is|güvenlik kodunuz:)\s*(\d{6})\b/i,
      /\b(\d{6})\b/
    ]
  },
  ea: {
    name: 'EA / Electronic Arts',
    senders: ['ea.com', 'e.ea.com'],
    subjects: ['EA Güvenlik Kodu', 'EA Security Code', 'Electronic Arts'],
    regex: [
      /(?:security code is|güvenlik kodunuz:)\s*(\d{6})\b/i,
      /\b(\d{6})\b/
    ]
  },
  ubisoft: {
    name: 'Ubisoft',
    senders: ['ubisoft.com'],
    subjects: ['Ubisoft', 'Verification code', 'Doğrulama kodu'],
    regex: [
      /(?:code is|kodunuz:)\s*(\d{6})\b/i,
      /\b(\d{6})\b/
    ]
  },
  riot: {
    name: 'Riot Games',
    senders: ['riotgames.com'],
    subjects: ['Riot Games', 'Giriş Kodu', 'Login Code'],
    regex: [
      /(?:code is|kodunuz:)\s*(\d{6})\b/i,
      /\b(\d{6})\b/
    ]
  },
  rockstar: {
    name: 'Rockstar Games',
    senders: ['rockstargames.com'],
    subjects: ['Rockstar Games Social Club', 'Verification code', 'Doğrulama'],
    regex: [
      /(?:code is|kodunuz:)\s*(\d{6})\b/i,
      /\b(\d{6})\b/
    ]
  },
  microsoft: {
    name: 'Microsoft / Xbox',
    senders: ['accountprotection.microsoft.com', 'microsoft.com'],
    subjects: ['Microsoft hesabı güvenlik kodu', 'security code', 'Doğrulama'],
    regex: [
      /(?:güvenlik kodu:|security code:)\s*(\d{6,7})\b/i,
      /\b(\d{6,7})\b/
    ]
  },
  google: {
    name: 'Google',
    senders: ['google.com'],
    subjects: ['Google', 'Doğrulama kodu', 'Verification code'],
    regex: [
      /G-(\d{6})\b/,
      /(?:kodunuz:|code is:)\s*(\d{6})\b/i,
      /\b(\d{6})\b/
    ]
  },
  amazon: {
    name: 'Amazon',
    senders: ['amazon.com'],
    subjects: ['Amazon', 'OTP', 'onay kodu', 'verification'],
    regex: [
      /(?:OTP:|code is:|kodunuz:)\s*(\d{6})\b/i,
      /\b(\d{6})\b/
    ]
  },
  binance: {
    name: 'Binance',
    senders: ['binance.com'],
    subjects: ['Binance', 'Authorize New Device', 'Doğrulama'],
    regex: [
      /(?:verification code:|kodunuz:)\s*(\d{6})\b/i,
      /\b(\d{6})\b/
    ]
  }
};

/**
 * Extract verification code from email text or HTML
 */
function extractCode(text, html, platformKey) {
  const content = (text || '') + '\n' + (html || '');
  const rule = PLATFORM_RULES[platformKey] || PLATFORM_RULES.steam;

  // Try platform specific regex first
  if (rule && rule.regex) {
    for (const rx of rule.regex) {
      const match = content.match(rx);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }

  // Universal fallbacks:
  // 1. Look for labeled patterns
  const labeledRegexes = [
    /(?:kod(?:unuz)?|code|şifre(?:niz)?|pin|otp|token|password)\s*(?:is|:|;|=|\-)?\s*([A-Z0-9]{4,8})\b/i,
    /(?:doğrulama|verification|onay|güvenlik|security)\s*(?:kodu|code)?\s*(?:is|:|;|=|\-)?\s*([A-Z0-9]{4,8})\b/i,
    /\b([0-9]{6})\b/,
    /\b([A-Z0-9]{5})\b/
  ];

  for (const rx of labeledRegexes) {
    const match = content.match(rx);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Test IMAP Connection
 */
async function testImapConnection(imapConfig) {
  if (!imapConfig || !imapConfig.host || !imapConfig.user || !imapConfig.pass) {
    return { success: false, message: 'IMAP bilgileri (Host, Kullanıcı, Şifre) eksik.' };
  }

  // Check if dummy/demo config
  if (imapConfig.pass.includes('buraya') || imapConfig.user.includes('ornek') || imapConfig.host.includes('example')) {
    return {
      success: true,
      message: 'Demo IMAP konfigürasyonu algılandı (Simülasyon Aktif). Gerçek mailler için geçerli App Password / IMAP şifrenizi girin.',
      mailboxCount: 12,
      isDemo: true
    };
  }

  const client = new ImapFlow({
    host: imapConfig.host,
    port: Number(imapConfig.port) || 993,
    secure: imapConfig.secure !== false,
    auth: {
      user: imapConfig.user,
      pass: imapConfig.pass
    },
    logger: false,
    connectionTimeout: 10000,
    greetingTimeout: 5000
  });

  try {
    await client.connect();
    const mailbox = await client.mailboxOpen(imapConfig.mailbox || 'INBOX');
    const totalMessages = mailbox.exists;
    await client.logout();

    return {
      success: true,
      message: `Bağlantı başarılı! ${mailbox.path} klasöründe ${totalMessages} adet mail bulundu.`,
      mailboxCount: totalMessages,
      mailboxName: mailbox.path
    };
  } catch (err) {
    return {
      success: false,
      message: 'IMAP Bağlantı Hatası: ' + (err.message || 'Sunucuya bağlanılamadı.')
    };
  }
}

/**
 * Fetch latest verification code for an account via IMAP
 */
async function fetchLatestCode(account) {
  const { imapConfig, platform } = account;

  // Check if simulated / demo
  const isDemo = !imapConfig?.pass ||
                 imapConfig.pass.includes('buraya') || 
                 imapConfig.user?.includes('ornek') ||
                 imapConfig.host?.includes('example');

  if (isDemo) {
    // Generate realistic demo code based on platform
    let demoCode = '';
    if (platform === 'steam') {
      const chars = '23456789BCDFGHJKMNPQRTVWXYZ';
      for (let i = 0; i < 5; i++) demoCode += chars.charAt(Math.floor(Math.random() * chars.length));
    } else if (platform === 'netflix') {
      demoCode = Math.floor(1000 + Math.random() * 9000).toString();
    } else {
      demoCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    return {
      success: true,
      code: demoCode,
      subject: `${PLATFORM_RULES[platform]?.name || platform.toUpperCase()} Giriş / Doğrulama Kodu`,
      from: `noreply@${platform}.com`,
      receivedAt: new Date().toISOString(),
      isDemo: true,
      note: 'Demo hesap modu: Test için anlık simüle kod üretildi.'
    };
  }

  const client = new ImapFlow({
    host: imapConfig.host,
    port: Number(imapConfig.port) || 993,
    secure: imapConfig.secure !== false,
    auth: {
      user: imapConfig.user,
      pass: imapConfig.pass
    },
    logger: false,
    connectionTimeout: 12000,
    greetingTimeout: 7000
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock(imapConfig.mailbox || 'INBOX');

    try {
      // Look back for emails received recently (last 2 hours or last 15 messages)
      const mailbox = client.mailbox;
      if (!mailbox.exists || mailbox.exists === 0) {
        throw new Error('Gelen kutusunda hiç mail bulunamadı.');
      }

      // Fetch the last 15 messages
      const startSeq = Math.max(1, mailbox.exists - 14);
      const messages = [];

      for await (const message of client.fetch(`${startSeq}:*`, {
        envelope: true,
        source: true,
        internalDate: true
      })) {
        messages.push(message);
      }

      // Sort newest first
      messages.reverse();

      for (const msg of messages) {
        try {
          const parsed = await simpleParser(msg.source);
          const text = parsed.text || '';
          const html = parsed.html || '';
          const subject = parsed.subject || '';
          const from = parsed.from?.text || '';

          const extracted = extractCode(text, html, platform);
          if (extracted) {
            return {
              success: true,
              code: extracted,
              subject: subject,
              from: from,
              receivedAt: parsed.date ? parsed.date.toISOString() : msg.internalDate.toISOString(),
              isDemo: false
            };
          }
        } catch (parseErr) {
          console.warn('Error parsing message:', parseErr.message);
        }
      }

      throw new Error(`${PLATFORM_RULES[platform]?.name || platform} için son maillerde doğrulama kodu bulunamadı. Lütfen önce platformdan kod gönderin.`);
    } finally {
      lock.release();
    }
  } catch (err) {
    throw new Error('Mail kutusundan kod alınamadı: ' + err.message);
  } finally {
    try {
      await client.logout();
    } catch {}
  }
}

module.exports = {
  PLATFORM_RULES,
  extractCode,
  testImapConnection,
  fetchLatestCode
};
