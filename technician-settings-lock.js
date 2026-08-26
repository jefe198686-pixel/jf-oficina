// JF Oficina v0.18.5 — Configurações são exclusivas do administrador
(function(){
 function profile(){try{return window.JFAuth?.current?.()||JSON.parse(localStorage.getItem('jf-auth-profile-v1')||'null')}catch{return null}}
 function isTechnician(){const u=profile();return !!u&&u.role!=='admin'}
 function settingsButton(){return [...document.querySelectorAll('nav button')].find(b=>/configura/i.test(b.textContent||''))||null}
 function enforce(){
   if(!isTechnician())return;
   const b=settingsButton();if(b){b.style.display='none';b.dataset.jfSettingsLocked='1'}
   const s=document.getElementById('settings');
   if(s&&(s.classList.contains('on')||s.classList.contains('active'))){
     s.classList.remove('on','active');
     const home=document.getElementById('home');
     if(home){home.classList.add('on','active')}
   }
 }
 function hardenPermissionDialog(){
   if(!isTechnician())return;
   document.querySelectorAll('[data-pg="menus"][data-pk="settings"]').forEach(x=>{
     const label=x.closest('label');if(label)label.style.display='none';x.checked=false;x.disabled=true;
   });
 }
 let timer=0;
 function tick(){clearTimeout(timer);timer=setTimeout(()=>{enforce();hardenPermissionDialog()},30)}
 addEventListener('DOMContentLoaded',()=>setTimeout(tick,1000));
 new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
 document.addEventListener('click',e=>{
   if(!isTechnician())return;
   const b=e.target.closest('nav button');
   if(b&&/configura/i.test(b.textContent||'')){e.preventDefault();e.stopImmediatePropagation();enforce()}
 },true);
 window.JFTechnicianSettingsLock={apply:enforce};
})();