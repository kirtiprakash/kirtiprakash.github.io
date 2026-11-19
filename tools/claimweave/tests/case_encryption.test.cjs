const {test}=require('node:test');const assert=require('node:assert/strict');const {webcrypto}=require('node:crypto');globalThis.crypto=webcrypto;
const cv=require('../case.js');
test('AES-256-GCM case is confidential and restored exactly',async()=>{
 const original={schema:'claimweave-encrypted-case-v3',claim:{claimant:'Synthetic Person',amount:'CNY 3205'},files:[{name:'taxi.pdf',bytes:'AABBCC'}]};
 const wrapped=await cv.encrypt(original,'very-long-and-private-demo-passphrase');
 assert.equal(wrapped.format,'ClaimWeave-AES-GCM-v3');assert(!JSON.stringify(wrapped).includes('Synthetic Person'));assert(!JSON.stringify(wrapped).includes('taxi.pdf'));
 const restored=await cv.decrypt(wrapped,'very-long-and-private-demo-passphrase');assert.deepEqual(restored,original);
});
test('wrong passphrase does not decrypt',async()=>{const wrapped=await cv.encrypt({foo:'bar'},'the-strong-demo-passphrase-1234');await assert.rejects(cv.decrypt(wrapped,'not-the-passphrase-56789'));});
test('short passphrase is rejected',async()=>await assert.rejects(cv.encrypt({test:true},'short')));
test('tampered ciphertext cannot be decrypted',async()=>{const wrapped=await cv.encrypt({important:'original'},'strong-passphrase-23456');wrapped.ciphertext=wrapped.ciphertext.slice(0,-4)+'AAAA';await assert.rejects(cv.decrypt(wrapped,'strong-passphrase-23456'));});
