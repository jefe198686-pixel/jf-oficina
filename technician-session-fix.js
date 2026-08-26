// JF Oficina v0.18.4 — mantém perfil/permissões do técnico em aparelhos sem código de sincronização local
(function(){
 const PROFILE_KEY='jf-auth-profile-v1', SESSION_KEY='jf-auth-session-v1';
 function storedProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch{return null}}
 function storedSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
 function install(){
   if(!window.JFAuth||window.JFAuth.__sessionFix)return false;
   const originalCurrent=typeof window.JFAuth.current==='function'?window.JFAuth.current.bind(window.JFAuth):()=>null;
   window.JFAuth.current=()=>originalCurrent()||storedProfile();
   window.JFAuth.__sessionFix=true;
   return true;
 }
 function refreshUI(){
   if(!install())return;
   const p=window.JFAuth.current?.();
   if(p&&storedSession()){
     const b=document.getElementById('jfUserBtn');
     if(b)b.textContent='👤 '+(p.name||p.username||'Técnico');
     try{window.JFPermissions?.apply?.()}catch(e){}
   }
 }
 addEventListener('DOMContentLoaded',()=>{
   setTimeout(refreshUI,1600);
   setTimeout(refreshUI,3200);
 });
 new MutationObserver(()=>setTimeout(refreshUI,50)).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('storage',e=>{if(e.key===PROFILE_KEY||e.key===SESSION_KEY)refreshUI()});
 window.addEventListener('jf-auth-synced',refreshUI);
})();