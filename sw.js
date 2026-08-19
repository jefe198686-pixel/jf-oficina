const VERSION='0.9.7';
const CACHE='jf-oficina-'+VERSION;
const CORE=['./','./index.html','./manifest.webmanifest','./patches.js'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith('jf-oficina-')&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

async function injectReleaseLayer(resp){
  if(!resp||!resp.ok)return resp;
  let text=await resp.text();
  if(!text.includes('src="./patches.js"')){
    text=text.replace('</body>','<script src="./patches.js?v='+VERSION+'"></script></body>');
  }
  return new Response(text,{
    status:resp.status,
    statusText:resp.statusText,
    headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate'}
  });
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);

  if(url.origin===location.origin && url.pathname.endsWith('/version.json')){
    event.respondWith(fetch(req,{cache:'no-store'}));
    return;
  }

  if(req.mode==='navigate' || (url.origin===location.origin && url.pathname.endsWith('/index.html'))){
    event.respondWith((async()=>{
      try{
        const network=await fetch(req,{cache:'no-store'});
        const released=await injectReleaseLayer(network);
        if(released&&released.ok){
          const copy=released.clone();
          caches.open(CACHE).then(c=>c.put('./index.html',copy));
        }
        return released;
      }catch(e){
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  if(url.origin===location.origin){
    event.respondWith(
      caches.match(req).then(cached=>{
        const fresh=fetch(req,{cache:url.pathname.endsWith('/patches.js')?'no-store':'default'}).then(resp=>{
          if(resp && resp.ok){
            const copy=resp.clone();
            caches.open(CACHE).then(c=>c.put(req,copy));
          }
          return resp;
        }).catch(()=>cached);
        return cached||fresh;
      })
    );
  }
});
