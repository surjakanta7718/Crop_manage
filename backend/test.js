const bcrypt = require('bcryptjs');

async function demo() {
  console.log('═══════════════════════════════════════════');
  console.log('  SIGNUP — HASHING');
  console.log('═══════════════════════════════════════════');

  const password = "mySecret123";

  // Step 1: Generate salt with cost 10
  const salt = await bcrypt.genSalt(10);
  console.log('Salt (includes algo+cost):', salt);
  // e.g. $2b$10$N9qo8uLOickgx2ZMRZoMye

  // Step 2: Hash the password with the salt
  const hash = await bcrypt.hash(password, salt);
  console.log('Stored hash (60 chars)   :', hash);
  console.log('Length                   :', hash.length);
  // $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

  // Step 3: Break it down
  const parts = hash.split('$');
  console.log('\nBreakdown:');
  console.log('  Algorithm :', parts[1]);                     // 2b
  console.log('  Cost      :', parts[2]);                     // 10
  console.log('  Salt      :', parts[3].slice(0, 22));        // N9qo8uLOickgx2ZMRZoMye
  console.log('  Digest    :', parts[3].slice(22));           // IjZAgcfl7p92ldGxad68LJZdL17lhWy

  console.log('\n═══════════════════════════════════════════');
  console.log('  LOGIN — COMPARING');
  console.log('═══════════════════════════════════════════');

  const correct = "mySecret123";
  const wrong   = "mySecret124";

  const match1 = await bcrypt.compare(correct, hash);
  const match2 = await bcrypt.compare(wrong, hash);

  console.log(`compare("${correct}", hash) → ${match1}`);
  console.log(`compare("${wrong}",   hash) → ${match2}`);

  console.log('\n═══════════════════════════════════════════');
  console.log('  SALTS ARE UNIQUE PER USER');
  console.log('═══════════════════════════════════════════');

  const hash2 = await bcrypt.hash(password, 10);  // same password
  console.log('Hash 1:', hash);
  console.log('Hash 2:', hash2);
  console.log('Same password, different hash?', hash !== hash2);
  console.log('Hash 1 length:', hash.length);
  console.log('Hash 2 length:', hash2.length);
}

demo();