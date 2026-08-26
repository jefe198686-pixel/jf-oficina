// JF Oficina v0.18.2 — primeiro acesso sempre mostra usuário + senha
(function(){
 const SESSION_KEY='jf-auth-session-v1', PROFILE_KEY='jf-auth-profile-v1';
 function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
 function profile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch{return null}}
 function openLogin(msg='Primeiro acesso: informe o usuário e a senha inicial fornecidos pelo administrador.'){
   let gate=document.getElementById('jfAuthGate');
   if(!gate)return;
   gate.classList.remove('hidden');
   const u=document.getElementById('jfLoginUser'),p=document.getElementById('jfLoginPass'),m=document.getElementById('jfLoginMsg');
   if(u){u.placeholder='Usuário';u.autocomplete='username';setTimeout(()=>u.focus(),50)}
   if(p){p.placeholder='Senha inicial';p.autocomplete='current-password'}
   if(m)m.textContent=msg;
 }
 function fixButton(){
   const b=document.getElementById('jfUserBtn');if(!b||b.dataset.firstAccessFix)return;
   b.dataset.firstAccessFix='1';
   b.addEventListener('click',e=>{
     if(profile()&&session())return;
     e.preventDefault();e.stopImmediatePropagation();openLogin();
   },true);
 }
 function fixGate(){
   const gate=document.getElementById('jfAuthGate');if(!gate)return;
   const card=gate.querySelector('.jfLoginCard');if(card&&!card.querySelector('.jfFirstHelp')){
     const p=document.createElement('p');p.className='jfFirstHelp small muted';p.textContent='No primeiro acesso use o usuário cadastrado para você e a senha inicial definida pelo administrador. Depois de entrar, você pode trocar sua senha em Meu acesso.';card.insertBefore(p,card.querySelector('label'));
   }
 }
 function tick(){fixButton();fixGate()}
 addEventListener('DOMContentLoaded',()=>setTimeout(tick,1200));
 new MutationObserver(()=>setTimeout(tick,40)).observe(document.documentElement,{childList:true,subtree:true});
 window.JFFirstAccess={openLogin};
})();