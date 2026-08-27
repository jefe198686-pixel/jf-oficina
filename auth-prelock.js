// JF Oficina v0.19.9 — bloqueio imediato da interface antes da autenticação
(function(){
 const SESSION_KEY='jf-auth-session-v1';
 const PROFILE_KEY='jf-auth-profile-v1';
 const ENABLED_KEY='jf-auth-enabled-v1';
 function hasSession(){try{return !!JSON.parse(localStorage.getItem(SESSION_KEY)||'null')?.access_token}catch{return false}}
 function hasProfile(){try{return !!JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')?.name}catch{return false}}
 function lock(){
  document.documentElement.classList.add('jf-auth-pending');
  let st=document.getElementById('jfPreAuthStyle');if(!st){st=document.createElement('style');st.id='jfPreAuthStyle';st.textContent=`html.jf-auth-pending body>*:not(#jfAuthGate){visibility:hidden!important;pointer-events:none!important}html.jf-auth-pending #jfAuthGate{visibility:visible!important;pointer-events:auto!important}html.jf-auth-pending body{overflow:hidden!important;background:linear-gradient(135deg,#102d4b,#0b5d34)!important}`;document.head.appendChild(st)}
 }
 function unlock(){document.documentElement.classList.remove('jf-auth-pending')}
 // Se o controle já foi ativado neste aparelho, nunca exponha a aplicação antes de validar a sessão.
 if(localStorage.getItem(ENABLED_KEY)==='1'||hasSession()||hasProfile())lock();
 // Em instalação/aparelho novo, mantenha bloqueado até o módulo de autenticação consultar o servidor.
 else lock();
 window.JFAuthPrelock={lock,unlock};
})();