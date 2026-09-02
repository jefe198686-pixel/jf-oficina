// JF Oficina v0.20.20 — sessão por navegador e login sem dependência de jf-sync-key
(function(){
 'use strict';
 const SESSION_KEY='jf-auth-session-v1', PROFILE_KEY='jf-auth-profile-v1';
 const AUTH_KEYS=new Set([SESSION_KEY,PROFILE_KEY]);
 const proto=Storage.prototype;
 const nativeGet=proto.getItem, nativeSet=proto.setItem, nativeRemove=proto.removeItem;

 // Remove somente credenciais antigas persistidas. Dados da oficina permanecem no localStorage.
 try{AUTH_KEYS.forEach(k=>nativeRemove.call(localStorage,k))}catch{}

 // Mantém autenticação durante a sessão do navegador, mas não depois de fechá-lo.
 proto.getItem=function(key){
  if(this===localStorage&&AUTH_KEYS.has(String(key)))return nativeGet.call(sessionStorage,String(key));
  return nativeGet.call(this,key);
 };
 proto.setItem=function(key,value){
  if(this===localStorage&&AUTH_KEYS.has(String(key)))return nativeSet.call(sessionStorage,String(key),String(value));
  return nativeSet.call(this,key,value);
 };
 proto.removeItem=function(key){
  if(this===localStorage&&AUTH_KEYS.has(String(key)))return nativeRemove.call(sessionStorage,String(key));
  return nativeRemove.call(this,key);
 };

 const SUPA_URL='https://vfswmnkbwtlzensycnfj.supabase.co';
 const SUPA_KEY='sb_publishable_rO1NER3IpMO8HkRWwzVqvA_jDUqnyba';
 const FN=SUPA_URL+'/functions/v1/jf-technicians';
 const nativeFetch=window.fetch.bind(window);
 const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8'}});
 function action(init){try{return JSON.parse(init?.body||'{}')?.action||''}catch{return ''}}
 function body(init){try{return JSON.parse(init?.body||'{}')}catch{return {}}}
 function syncKey(init){try{return new Headers(init?.headers||{}).get('x-jf-sync-key')?.trim()||''}catch{return ''}}
 async function rpc(name,payload){
  const r=await nativeFetch(SUPA_URL+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:SUPA_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload||{})});
  let d=null;try{d=await r.json()}catch{}
  if(!r.ok)throw new Error(d?.message||d?.error||('HTTP '+r.status));
  return d;
 }
 window.fetch=async function(input,init={}){
  const url=typeof input==='string'?input:(input?.url||'');
  if(!url.includes('/functions/v1/jf-technicians'))return nativeFetch(input,init);
  const a=action(init);
  if(a==='status'&&!syncKey(init)){
   try{return response({ok:true,auth_enabled:!!(await rpc('jf_auth_status_global',{})),workspace_hash:''})}
   catch(e){return response({ok:false,error:'status_failed',message:String(e?.message||e)},500)}
  }
  if(a==='login_hint'&&!syncKey(init)){
   const username=String(body(init).username||'').trim();
   if(!username)return response({ok:false,error:'username_required'},400);
   try{
    const rows=await rpc('jf_login_hint_global',{p_username:username});
    const list=Array.isArray(rows)?rows:[];
    if(!list.length)return response({ok:false,error:'user_not_found'},404);
    if(list.length>1)return response({ok:false,error:'username_ambiguous'},409);
    return response({ok:true,auth_email:list[0].auth_email,workspace_hash:list[0].workspace_hash});
   }catch(e){return response({ok:false,error:'login_hint_failed',message:String(e?.message||e)},500)}
  }
  return nativeFetch(input,init);
 };
})();
