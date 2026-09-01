// JF Oficina v0.20.18 — sessão autenticada resolve status sem depender de chave local de sincronização
(function(){
 const SESSION_KEY='jf-auth-session-v1', PROFILE_KEY='jf-auth-profile-v1';
 const nativeFetch=window.fetch.bind(window);
 function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
 function profile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch{return null}}
 function actionFrom(init){try{return JSON.parse(init?.body||'{}')?.action||''}catch{return ''}}
 function jsonResponse(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8'}})}
 window.fetch=async function(input,init={}){
  const url=typeof input==='string'?input:(input?.url||'');
  if(!url.includes('/functions/v1/jf-technicians'))return nativeFetch(input,init);
  const action=actionFrom(init),s=session(),p=profile();
  // Com sessão autenticada, o próprio perfil já comprova que o controle de acesso está ativo
  // e contém o workspace. Não consultar status por uma chave local que pode não existir neste aparelho.
  if(action==='status'&&s?.access_token&&p){
   return jsonResponse({ok:true,auth_enabled:true,workspace_hash:p.workspace_hash||''});
  }
  const authenticatedActions=new Set(['me','list','create','update','reset_password','sync_get','sync_post']);
  if(s?.access_token&&authenticatedActions.has(action)){
   const h=new Headers(init.headers||{});
   h.set('Authorization','Bearer '+s.access_token);
   h.delete('x-jf-sync-key');
   init={...init,headers:h};
  }
  return nativeFetch(input,init);
 };
})();