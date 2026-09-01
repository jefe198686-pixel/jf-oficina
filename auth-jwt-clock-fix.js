// JF Oficina v0.20.11 — trata diferença de relógio tanto no login Auth quanto na Edge Function
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
 async function retryFutureJwt(input,init,maxAttempts,delayMs){
   let resp=await nativeFetch(input,init);
   for(let attempt=1;attempt<maxAttempts&&await isFutureJwtResponse(resp);attempt++){
     await sleep(delayMs);
     resp=await nativeFetch(input,init);
   }
   return resp;
 }
 window.fetch=async function(input,init){
   try{
     const rawUrl=typeof input==='string'?input:(input&&input.url)||'';
     const url=new URL(rawUrl,location.href);
     const isSupabase=url.hostname.endsWith('.supabase.co');
     const isAuthToken=isSupabase&&url.pathname==='/auth/v1/token';
     const isJfEdge=isSupabase&&url.pathname==='/functions/v1/jf-technicians';
     if(isAuthToken){
       const next={...(init||{}),cache:'no-store',credentials:'omit'};
       const headers=new Headers(next.headers||(typeof input!=='string'&&input?.headers)||undefined);
       headers.delete('Authorization');
       next.headers=headers;
       return retryFutureJwt(input,next,12,2000);
     }
     if(isJfEdge)return retryFutureJwt(input,init,12,2000);
   }catch(e){console.warn('JF auth JWT clock fix',e)}
   return nativeFetch(input,init);
 };
})();