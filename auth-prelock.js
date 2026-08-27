// JF Oficina v0.19.9 — bloqueio imediato da interface antes da autenticação
(function(){
 function lock(){
  document.documentElement.classList.remove('jf-auth-ready');
  document.documentElement.classList.add('jf-auth-pending');
 }
 function unlock(){
  document.documentElement.classList.remove('jf-auth-pending');
  document.documentElement.classList.add('jf-auth-ready');
 }
 lock();
 window.JFAuthPrelock={lock,unlock};
})();