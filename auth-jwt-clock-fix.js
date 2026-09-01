// JF Oficina v0.20.9 — impede JWT antigo de contaminar login/refresh do Supabase
(function(){
 'use strict';
 if(window.__jfJwtClockFetchFix)return;
 window.__jfJwtClockFetchFix=true;
 const nativeFetch=window.fetch.bind(window);
 window.fetch=async function(input,init){
   try{
     const rawUrl=typeof input==='string'?input:(input&&input.url)||'';
     const url=new URL(rawUrl,location.href);
     const isSupabaseAuthToken=url.hostname.endsWith('.supabase.co')&&url.pathname==='/auth/v1/token';
     if(isSupabaseAuthToken){
       const next={...(init||{})};
       const headers=new Headers(next.headers||(typeof input!=='string'&&input?.headers)||undefined);
       headers.delete('Authorization');
       next.headers=headers;
       return nativeFetch(input,next);
     }
   }catch(e){console.warn('JF auth JWT header fix',e)}
   return nativeFetch(input,init);
 };
})();