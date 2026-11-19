/* Local-only application shell and pinned library cache. No application data is
   cached or transmitted. ClaimWeave never attempts to cache user documents. */
const VER='claimweave-v3-20261119';
const SHELL=['./','./index.html','./styles.css','./core.js','./pdf.js','./case.js','./app.js'];
const LIBS=[
  'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js'
];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(VER);
    await cache.addAll(SHELL);
    await Promise.all(LIBS.map(async url=>{try{const res=await fetch(url,{mode:'cors',cache:'reload'});if(res.ok)await cache.put(url,res);}catch(e){/* This library may remain online-only until requested successfully. */}}));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('claimweave-')&&key!==VER)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url),app=new URL(self.registration.scope);
  const local=url.origin===app.origin&&url.pathname.startsWith(app.pathname);
  const dependency=/^(?:cdn\.jsdelivr\.net|esm\.sh)$/.test(url.hostname);
  if(!local&&!dependency)return;
  event.respondWith((async()=>{
    const cache=await caches.open(VER);
    const cached=await cache.match(req);
    if(cached)return cached;
    const response=await fetch(req);
    // Only cache application code and recognized library resources; never
    // cache submitted documents or opaque responses from unknown hosts.
    if(response.ok&&(local||dependency))await cache.put(req,response.clone());
    return response;
  })());
});
