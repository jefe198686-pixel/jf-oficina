// JF Oficina v0.20.22 — Configurações exclusivas do administrador sem observer de atributos
(function(){
 function profile(){try{return window.JFAuth?.current?.()||null}catch{return null}}
 function isTechnician(){const u=profile();return !!u&&u.role!=='admin'}
 function settingsButton(){return [...document.querySelectorAll('nav button')].find(b=>/configura/i.test(b.textContent||''))||null}
 function enforce(){const b=settingsButton(),s=document.getElementById('settings');if(!isTechnician()){if(b?.dataset.jfSettingsLocked){b.style.display='';delete b.dataset.jfSettingsLocked}return}if(b){b.style.display='none';b.dataset.jfSettingsLocked='1'}if(s&&(s.classList.contains('on')||s.classList.contains('active'))){s.classList.remove('on','active');const home=document.getElementById('home');home?.classList.add('on','active')}}
 let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enforce()})}
 addEventListener('DOMContentLoaded',()=>setTimeout(enforce,500));addEventListener('jf-auth-synced',enforce);addEventListener('jf-permissions-changed',enforce);new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('click',e=>{if(!isTechnician())return;const b=e.target.closest('nav button');if(b&&/configura/i.test(b.textContent||'')){e.preventDefault();e.stopImmediatePropagation();enforce()}},true);window.JFTechnicianSettingsLock={apply:enforce};
})();