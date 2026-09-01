// JF Oficina v0.20.10 — corrige contaminação por JWT antigo e pequena diferença de relógio entre Auth/Edge
(function(){
 'use strict';
 if(window.__jfJwtClockFetchFix)return;
 window.__jfJwtClockFetchFix=true;
 const nativeFetch=window.fetch.bind(window);
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 async function isFutureJwtResponse(resp){
   try{
     if(resp.ok)return false;
     const txt=await resp.clone().text();
     return /jwt issued at future/i.test(txt);
   }catch{return false}
 }
 window.fetch=async function(input,init){
   try{
     const rawUrl=typeof input==='string'?input:(input&&input.url)||'';
     const url=new URL(rawUrl,location.href);
     const isSupabase=url.hostname.endsWith('.supabase.co');
     const isAuthToken=isSupabase&&url.pathname==='/auth/v1/token';
     const isJfEdge=isSupabase&&url.pathname==='/functions/v1/jf-technicians';
     if(isAuthToken){
       const next={...(init||{})};
       const headers=new Headers(next.headers||(typeof input!=='string'&&input?.headers)||undefined);
       headers.delete('Authorization');
       next.headers=headers;
       return nativeFetch(input,next);
     }
     if(isJfEdge){
       let resp=await nativeFetch(input,init);
       for(let attempt=1;attempt<=6&&await isFutureJwtResponse(resp);attempt++){
         await sleep(1500);
         resp=await nativeFetch(input,init);
       }
       return resp;
     }
   }catch(e){console.warn('JF auth JWT clock fix',e)}
   return nativeFetch(input,init);
 };
})();