const crypto = require('crypto');

/**
 * Base32 RFC 4648 decoder
 */
function base32Decode(base32) {
  if (!base32) return Buffer.alloc(0);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
  let bits = '';

  for (let i = 0; i < cleaned.length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }

  return Buffer.from(bytes);
}

/**
 * Generate standard RFC 6238 TOTP (Google Authenticator, Authy, Microsoft Authenticator)
 * @param {string} secret 
 * @param {number} step (seconds, default 30)
 * @param {number} digits (default 6)
 * @returns {{ code: string, remainingSeconds: number, step: number }}
 */
function generateTotp(secret, step = 30, digits = 6) {
  if (!secret) {
    throw new Error('2FA Authenticator secret anahtarı belirtilmemiş.');
  }

  const key = base32Decode(secret);
  if (key.length === 0) {
    throw new Error('Geçersiz Base32 secret anahtarı.');
  }

  const epoch = Math.floor(Date.now() / 1000);
  const time = Math.floor(epoch / step);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(time));

  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binary % (10 ** digits)).toString().padStart(digits, '0');
  const remainingSeconds = step - (epoch % step);

  return {
    code: otp,
    remainingSeconds,
    step
  };
}

/**
 * Verify TOTP code with time drift window (-1, 0, +1)
 */
function verifyTotp(token, secret, step = 30, window = 1) {
  if (!token || !secret) return false;
  const cleanToken = token.trim();
  const epoch = Math.floor(Date.now() / 1000);
  const key = base32Decode(secret);

  for (let i = -window; i <= window; i++) {
    const time = Math.floor(epoch / step) + i;
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(BigInt(time));

    const hmac = crypto.createHmac('sha1', key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = (binary % 1000000).toString().padStart(6, '0');
    if (otp === cleanToken) {
      return true;
    }
  }

  return false;
}

module.exports = {
  generateTotp,
  verifyTotp
};
