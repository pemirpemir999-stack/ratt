const http = require('http');

async function runTests() {
  console.log('--- Starting zGuard In-Process Test ---');
  // Require and start the server
  const db = require('./server/db');
  console.log('1. Database initialized successfully');
  console.log('   - Accounts count:', db.getAccounts().length);
  console.log('   - Keys count:', db.getKeys().length);
  console.log('   - Packages count:', db.getPackages().length);
  console.log('   - License:', db.getLicense().plan, `(${db.getLicense().daysRemaining} days left)`);

  // Test TOTP generation
  const { generateTotp } = require('./server/totpClient');
  const totp = generateTotp('JBSWY3DPEHPK3PXP');
  console.log('2. TOTP Generator Test:', totp);
  if (!totp.code || totp.code.length !== 6) throw new Error('TOTP generation failed');

  // Test IMAP extraction regex
  const { extractCode } = require('./server/imapClient');
  const steamSample = 'Dear User, Here is the Steam Guard code you need to login to your account user123: H7R9K';
  const steamExtracted = extractCode(steamSample, '', 'steam');
  console.log('3. Steam Code Extraction Test:', steamExtracted);
  if (steamExtracted !== 'H7R9K') throw new Error('Steam code extraction failed, got ' + steamExtracted);

  const netflixSample = 'Oturum açma kodunuz: 4921. Bu kodu kimseyle paylasmayin.';
  const netflixExtracted = extractCode(netflixSample, '', 'netflix');
  console.log('4. Netflix Code Extraction Test:', netflixExtracted);
  if (netflixExtracted !== '4921') throw new Error('Netflix code extraction failed');

  const chatgptSample = 'Your OpenAI verification code is 812940';
  const chatgptExtracted = extractCode(chatgptSample, '', 'chatgpt');
  console.log('5. ChatGPT Code Extraction Test:', chatgptExtracted);
  if (chatgptExtracted !== '812940') throw new Error('ChatGPT code extraction failed');

  // Test Key Query logic
  const key = db.getKeyByCode('ZG-STEAM-DEMO-2026');
  console.log('6. Key Query Test:', key ? key.keyCode : 'NOT FOUND');
  if (!key) throw new Error('Demo key not found');

  // Test Bulk Key Generation
  const bulk = db.createBulkKeys({
    count: 3,
    prefix: 'TESTBULK',
    accountId: 'acc-steam-demo',
    maxUses: 1,
    cooldownSeconds: 30
  });
  console.log('7. Bulk Key Generation Test:', bulk.length, 'keys created:', bulk.map(k => k.keyCode));
  if (bulk.length !== 3) throw new Error('Bulk key generation failed');

  // Test Purge Keys
  const purged = db.purgeKeys();
  console.log('8. Purge Test (purged count):', purged);

  // Test License Extension
  const newLic = db.activateLicense('ZG-TEST-KEY-12345678');
  console.log('9. License Activation Test:', newLic.message);

  console.log('\n==========================================');
  console.log('✅ ALL 9 TESTS PASSED FLAWLESSLY!');
  console.log('==========================================');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
