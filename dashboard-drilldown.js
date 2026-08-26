// JF Oficina v0.18.6 — indicadores clicáveis com drill-down
(function(){
 const $=id=>document.getElementById(id);
 function activate(view){
  const btn=[...document.querySelectorAll('nav button[data-view]')].find(b=>b.dataset.view===view);
  if(btn){btn.click();return}
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
  $(view)?.classList.add('on');
 }
 function card(id){return $(id)?.closest('.card')}
 function makeCard(id,title,fn){const c=card(id);if(!c||c.dataset.jfDrill)return;c.dataset.jfDrill='1';c.tabIndex=0;c.setAttribute('role','button');c.title=title;c.style.cursor='pointer';c.onclick=fn;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}}}
 function goOS(status=''){
  activate('os');
  setTimeout(()=>{const s=$('osStatus');if(s){s.value=status;s.dispatchEvent(new Event('change',{bubbles:true}))}const q=$('osSearch');if(q&&status==='')q.value='';if(typeof renderOS==='function')renderOS()},30)
 }
 function goClients(){activate('clients');setTimeout(()=>{const q=$('clientSearch');if(q)q.value='';if(typeof renderClients==='function')renderClients()},30)}
 function goLow(){
  activate('stock');
  setTimeout(()=>{const f=$('stockFilter');if(f){f.value='low';f.dispatchEvent(new Event('change',{bubbles:true}))}if(typeof renderStock==='function')renderStock();const sec=$('stock')?.querySelector('.tablewrap');sec?.scrollIntoView({behavior:'smooth',block:'start'})},40)
 }
 function wireAttention(){
  const a=$('attention');if(!a||a.dataset.jfDrill)return;a.dataset.jfDrill='1';a.addEventListener('click',e=>{
   const el=e.target.closest('[data-id],[data-os],button,tr,.item');if(!el)return;
   const id=el.dataset.id||el.dataset.os||el.querySelector?.('[data-id]')?.dataset.id;
   if(id&&typeof openOS==='function'){openOS(id);return}
   const txt=(el.textContent||'').toLowerCase();if(txt.includes('aguardando'))goOS('Aguardando peças');
  })
 }
 function install(){
  makeCard('kOs','Abrir todas as ordens de serviço',()=>goOS(''));
  makeCard('kAnd','Abrir OS em andamento',()=>goOS('Em andamento'));
  makeCard('kWait','Abrir OS aguardando peças',()=>goOS('Aguardando peças'));
  makeCard('kCli','Abrir lista de clientes',goClients);
  makeCard('kLow','Abrir lista detalhada dos itens abaixo do estoque mínimo',goLow);
  wireAttention();
 }
 addEventListener('DOMContentLoaded',()=>setTimeout(install,1200));
 setTimeout(install,2200);
 window.JFDashboardDrilldown={install,goOS,goLow,goClients};
})();