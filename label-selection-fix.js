// JF Oficina v0.20.15 — mantém filtros da seleção de etiquetas após adicionar
(function(){
 const ids=['labelFindCode','labelFindDesc','labelFindExtra'];
 let snapshot=null;
 document.addEventListener('click',e=>{
  const btn=e.target.closest?.('[data-add-label]');
  if(!btn)return;
  snapshot=ids.map(id=>document.getElementById(id)?.value||'');
  const keep=snapshot.slice();
  setTimeout(()=>{
   ids.forEach((id,i)=>{const el=document.getElementById(id);if(el)el.value=keep[i]});
   const trigger=document.getElementById('labelFindCode')||document.getElementById('labelFindDesc')||document.getElementById('labelFindExtra');
   if(trigger)trigger.dispatchEvent(new Event('input',{bubbles:true}));
  },0);
 },true);
})();
