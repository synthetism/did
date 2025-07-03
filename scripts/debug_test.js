const pkg = require('./dist/index.js');

const testDIDs = [
  '',
  'did:',
  'did:key:',
  'not-a-did',
  'did:web:',
  'did:invalid:method',
  'did:key:invalid-encoding',
  'DID:KEY:UPPERCASE',
  'did:key:z6Mk#fragment-without-valid-did'
];

console.log('Testing all invalid DIDs...');
testDIDs.forEach((did, i) => {
  const validation = pkg.validateDID(did);
  const isDIDResult = pkg.isDID(did);
  console.log(`${i}: ${JSON.stringify(did)}`);
  console.log(`  validateDID.isValid: ${validation.isValid}`);
  console.log(`  isDID: ${isDIDResult}`);
  // For invalid DIDs, both should return false
  if (validation.isValid === false && isDIDResult === false) {
    console.log('  ✓ CONSISTENT (both reject)');
  } else if (validation.isValid === true && isDIDResult === true) {
    console.log('  ✓ CONSISTENT (both accept)');
  } else {
    console.log('  *** MISMATCH ***');
  }
  console.log();
});
