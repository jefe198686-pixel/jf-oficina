const VERSION='0.15.1';
const CACHE='jf-oficina-'+VERSION;
const CORE=["./", "./index.html", "./manifest.webmanifest", "./styles.css", "./app.js", "./core.js", "./os.js", "./clients.js", "./products.js", "./updater-tech.js", "./library.js", "./service-intelligence.js", "./recovery.js", "./sync.js", "./sync-numbering.js", "./sync-integrity.js", "./admin.js", "./management.js", "./search-pro.js", "./budgets.js", "./shared-doc.js", "./shared-doc-fix.js", "./search-fields.js", "./release.js", "./init.js"];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('jf-oficina-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);
 if(url.origin===location.origin&&url.pathname.endsWith('/version.json')){event.respondWith(fetch(req,{cache:'no-store'}));return}
 if(req.mode==='navigate'||(url.origin===location.origin&&url.pathname.endsWith('/index.html'))){event.respondWith(fetch(req,{cache:'no-store'}).then(resp=>{if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy))}return resp}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));return}
 if(url.origin===location.origin){event.respondWith(caches.match(req).then(cached=>{const fresh=fetch(req,{cache:'no-store'}).then(resp=>{if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return resp}).catch(()=>cached);return cached||fresh}))}
});
