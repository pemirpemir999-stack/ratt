/**
 * Exnor / External Guard Bridge Client
 * Fetches live Steam Guard codes & account credentials from exnor.com.tr
 */

async function fetchExnorGuard(accessCode, host = 'https://exnor.com.tr') {
  if (!accessCode) {
    throw new Error('Exnor erişim kodu (access_code) belirtilmemiş.');
  }

  const cleanCode = accessCode.trim().toUpperCase();
  const baseUrl = host.replace(/\/+$/, '');

  try {
    // 1. Initial GET to fetch CSRF token and cookie
    const getRes = await fetch(`${baseUrl}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const rawSetCookie = getRes.headers.get('set-cookie') || '';
    const initialCookie = rawSetCookie.split(';')[0];
    const html = await getRes.text();
    const csrfMatch = html.match(/name="csrf"\s+value="([^"]+)"/);

    if (!csrfMatch) {
      throw new Error('Exnor sitesinden güvenlik (CSRF) tokeni alınamadı.');
    }

    const csrf = csrfMatch[1];

    // 2. Submit access code via POST
    const body = new URLSearchParams();
    body.append('csrf', csrf);
    body.append('access_code', cleanCode);
    body.append('action', 'enter-code');

    const postRes = await fetch(`${baseUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': initialCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: body.toString(),
      redirect: 'manual'
    });

    const postSetCookie = postRes.headers.get('set-cookie');
    const sessionCookie = postSetCookie ? postSetCookie.split(';')[0] : initialCookie;

    // 3. GET authenticated dashboard page
    const dashRes = await fetch(`${baseUrl}/`, {
      headers: {
        'Cookie': sessionCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const dashHtml = await dashRes.text();

    // Check if error message present on page
    if (dashHtml.includes('Erişim Kodunuzu girin') && dashHtml.includes('error')) {
      const errorMatch = dashHtml.match(/<div class="error">([^<]+)<\/div>/i) ||
                         dashHtml.match(/<p class="error">([^<]+)<\/p>/i);
      const errText = errorMatch ? errorMatch[1] : 'Geçersiz veya süresi dolmuş Exnor erişim kodu.';
      throw new Error(`Exnor Hatası: ${errText}`);
    }

    // Extract account credentials
    const userMatch = dashHtml.match(/id="account-username"[^>]*value="([^"]+)"/i);
    const passMatch = dashHtml.match(/id="account-password"[^>]*value="([^"]+)"/i);
    const codeMatch = dashHtml.match(/id="guard-code"[^>]*value="([^"]+)"/i);
    const titleMatch = dashHtml.match(/<h1>([^<]+)<\/h1>/i);

    const panelCsrfMatch = dashHtml.match(/name="panel-csrf"\s+content="([^"]+)"/i);
    const sessionKeyMatch = dashHtml.match(/name="guard-session-key"\s+content="([^"]+)"/i);

    let finalCode = codeMatch ? codeMatch[1].trim() : '';
    let remainingSeconds = 30;

    // If dynamic live refresh endpoint is available, query for guaranteed fresh code
    if (panelCsrfMatch && sessionKeyMatch) {
      try {
        const codeBody = new URLSearchParams();
        codeBody.append('csrf', panelCsrfMatch[1]);
        codeBody.append('action', 'code');
        codeBody.append('grant', sessionKeyMatch[1]);

        const codeRes = await fetch(`${baseUrl}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': sessionCookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body: codeBody.toString()
        });

        if (codeRes.ok) {
          const codeJson = await codeRes.json();
          if (codeJson && codeJson.code) {
            finalCode = codeJson.code;
            if (codeJson.code_valid_until && codeJson.server_time) {
              remainingSeconds = Math.max(1, Math.round(codeJson.code_valid_until - codeJson.server_time));
            }
          }
        }
      } catch (err) {
        console.warn('Exnor dynamic code refresh failed, using initial code:', err.message);
      }
    }

    if (!finalCode) {
      throw new Error('Exnor sayfasından Steam Guard kodu okunamadı.');
    }

    return {
      success: true,
      title: titleMatch ? titleMatch[1].trim() : 'Steam Hesabı',
      username: userMatch ? userMatch[1].trim() : '',
      password: passMatch ? passMatch[1].trim() : '',
      code: finalCode,
      remainingSeconds,
      platform: 'steam',
      provider: 'exnor'
    };
  } catch (err) {
    console.error('fetchExnorGuard error:', err.message);
    throw new Error('Exnor sisteminden kod çekilemedi: ' + err.message);
  }
}

module.exports = {
  fetchExnorGuard
};
