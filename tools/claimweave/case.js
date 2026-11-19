/* AES-256-GCM encrypted claim archive, portable between browser and Node.
   Use only a strong user-supplied passphrase. No server key, no recovery. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.ClaimWeaveCase=api;})(globalThis,function(){
'use strict';
const ITERATIONS=310000;
function assertCrypto(){if(!globalThis.crypto?.subtle||!globalThis.crypto?.getRandomValues)throw Error('Web Crypto unavailable. Open ClaimWeave over HTTPS or localhost.');}
function bytesToB64(u8){let s='';for(let i=0;i<u8.length;i+=16384)s+=String.fromCharCode(...u8.slice(i,i+16384));return btoa(s);}
function b64ToBytes(s){const binary=atob(s);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;}
async function keyFrom(pass,salt){const input=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},input,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function encrypt(data,pass){assertCrypto();if(typeof pass!=='string'||pass.length<12)throw Error('Passphrase must have at least 12 characters.');const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const key=await keyFrom(pass,salt);const bytes=new TextEncoder().encode(JSON.stringify(data));const raw=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes);return {format:'ClaimWeave-AES-GCM-v3',kdf:`PBKDF2-SHA256-${ITERATIONS}`,salt:bytesToB64(salt),iv:bytesToB64(iv),ciphertext:bytesToB64(new Uint8Array(raw))};}
async function decrypt(wrapped,pass){assertCrypto();if(!wrapped||wrapped.format!=='ClaimWeave-AES-GCM-v3'||wrapped.kdf!==`PBKDF2-SHA256-${ITERATIONS}`)throw Error('Unsupported or invalid ClaimWeave case.');const salt=b64ToBytes(wrapped.salt),iv=b64ToBytes(wrapped.iv);if(salt.length!==16||iv.length!==12)throw Error('Invalid encryption parameters.');const key=await keyFrom(pass,salt);const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,b64ToBytes(wrapped.ciphertext));return JSON.parse(new TextDecoder().decode(bytes));}
return {encrypt,decrypt,bytesToB64,b64ToBytes,ITERATIONS};
});
