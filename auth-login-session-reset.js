// JF Oficina v0.20.12 — remove somente a sessão antiga imediatamente antes de um novo login
(function(){
  'use strict';
  const SESSION_KEY='jf-auth-session-v1';
  function clearBeforeLogin(e){
    const t=e.target;
    const isButton=t&&t.id==='jfLoginBtn';
    const isEnter=e.type==='keydown'&&e.key==='Enter'&&t&&(t.id==='jfLoginUser'||t.id==='jfLoginPass');
    if(isButton||isEnter){
      try{localStorage.removeItem(SESSION_KEY)}catch{}
    }
  }
  document.addEventListener('click',clearBeforeLogin,true);
  document.addEventListener('keydown',clearBeforeLogin,true);
})();