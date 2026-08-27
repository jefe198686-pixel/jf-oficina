// JF Oficina v0.20.0 — usa a sessão autenticada para resolver o workspace das funções de técnicos
(function(){
 const SESSION_KEY='jf-auth-session-v1';
 const nativeFetch=window.fetch.bind(window);
 function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
 function actionFrom(init){try{return JSON.parse(init?.body||'{}')?.action||''}catch{return ''}}
 window.fetch=async function(input,init={}){
  const url=typeof input==='string'?input:(input?.url||'');
  if(!url.includes('/functions/v1/jf-technicians'))return nativeFetch(input,init);
  const action=actionFrom(init);
  const s=session();
  const authenticatedActions=new Set(['status','me','list','create','update','reset_password','sync_get','sync_post']);
  if(s?.access_token&&authenticatedActions.has(action)){
   const h=new Headers(init.headers||{});
   h.set('Authorization','Bearer '+s.access_token);
   // Quando há usuário autenticado, o backend deve identificar a empresa pelo perfil.
   // Um código local antigo não pode sobrescrever esse vínculo e causar invalid_workspace.
   h.delete('x-jf-sync-key');
   init={...init,headers:h};
  }
  return nativeFetch(input,init);
 };
})();