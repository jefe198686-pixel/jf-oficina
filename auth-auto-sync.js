// JF Oficina v0.20.22 — sincronização autenticada única e dirigida por eventos
(function(){
 const SUPA_URL='https://vfswmnkbwtlzensycnfj.supabase.co';
 const SUPA_KEY='sb_publishable_rO1NER3IpMO8HkRWwzVqvA_jDUqnyba';
 const FN=SUPA_URL+'/functions/v1/jf-technicians';
 const SESSION_KEY='jf-auth-session-v1';
 let busy=false,lastToken='',debounce=null;
 function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
 function hasLogin(){return !!session()?.access_token}
 function itemCount(){try{return typeof jfStateItems==='function'?jfStateItems(S):0}catch{return 0}}
 function knownRev(){return Number(localStorage.getItem('jf-sync-revision')||0)}
 function dirty(){return Number(localStorage.getItem('jf-sync-dirty-at')||0)}
 function status(t,type=''){try{jfSetSyncStatus(t,type)}catch{}let b=document.getElementById('jfAutoSyncBadge');if(!b){const h=document.querySelector('header');if(h){b=document.createElement('span');b.id='jfAutoSyncBadge';b.style.cssText='font-size:12px;color:#fff;opacity:.9;margin-left:8px';h.appendChild(b)}}if(b)b.textContent=t}
 async function call(action,data={}){const s=session();if(!s?.access_token)throw new Error('login_required');const r=await fetch(FN,{method:'POST',headers:{'apikey':SUPA_KEY,'Content-Type':'application/json','Authorization':'Bearer '+s.access_token},body:JSON.stringify({action,...data})});let d={};try{d=await r.json()}catch{}if(!r.ok){if(r.status===401){localStorage.removeItem(SESSION_KEY);lastToken=''}throw new Error(d.message||d.error||('HTTP '+r.status))}return d}
 async function applyRemote(remote){if(!remote?.payload)return;status('Sincronizando dados...');if(typeof jfApplyServerState==='function')await jfApplyServerState(remote.payload,remote.revision);else{S=JSON.parse(JSON.stringify(remote.payload));normalize();await saveDB();render();localStorage.setItem('jf-sync-revision',String(remote.revision||0));localStorage.removeItem('jf-sync-dirty-at')}try{window.JFPermissions?.apply?.()}catch{}status('Sincronizado.','ok')}
 async function push(base){const r=await call('sync_post',{baseRevision:base,payload:S});localStorage.setItem('jf-sync-revision',String(r.revision||base));localStorage.removeItem('jf-sync-dirty-at');localStorage.setItem('jf-sync-last-at',new Date().toISOString());status('Sincronizado.','ok');return r}
 async function syncNow(reason='auto'){
  if(busy||!navigator.onLine||!hasLogin())return;
  busy=true;
  try{
   const remote=await call('sync_get');
   if(!remote.exists){status('Base central não encontrada.','warn');return}
   const local=itemCount(),known=knownRev(),isDirty=dirty();
   if(local===0||known===0){await applyRemote(remote);return}
   if(isDirty){
    try{await push(known)}catch(e){
     if(String(e.message).includes('revision_conflict')){const fresh=await call('sync_get');if(typeof jfMergeStatesLocalWins==='function'){S=jfMergeStatesLocalWins(fresh.payload,S);normalize();await saveDB();localStorage.setItem('jf-sync-revision',String(fresh.revision||0));await push(fresh.revision||0)}else await applyRemote(fresh)}else throw e
    }
    return
   }
   if(Number(remote.revision||0)>known)await applyRemote(remote);else status('Sincronizado.','ok')
  }catch(e){console.error('JF auth sync',e);status('Falha na sincronização: '+String(e.message||e),'error')}
  finally{busy=false}
 }
 function schedule(reason='change',delay=1800){clearTimeout(debounce);debounce=setTimeout(()=>syncNow(reason),delay)}
 function detectLogin(){const tok=session()?.access_token||'';if(tok&&tok!==lastToken){lastToken=tok;status('Entrando na base da empresa...');schedule('login',250)}if(!tok)lastToken=''}
 addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{detectLogin();if(hasLogin())syncNow('startup')},900);setInterval(()=>{detectLogin();if(hasLogin())syncNow('safety')},60000)});
 addEventListener('jf-sync-dirty',()=>schedule('change',1800));
 addEventListener('jf-permissions-changed',()=>schedule('permissions',250));
 addEventListener('online',()=>{detectLogin();schedule('online',250)});
 window.jfAuthSyncNow=syncNow;
})();