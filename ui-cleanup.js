// JF Oficina v0.15.9 — limpeza da interface duplicada
(function(){
 function cleanMaterials(){
  const pane=document.getElementById('tab-materials');if(!pane)return;
  // A pesquisa em três campos de materials-compact.js substitui qualquer busca contextual antiga/duplicada.
  pane.querySelectorAll('.ctxFinder').forEach(x=>x.remove());
  pane.querySelectorAll('select.finderSelectHidden').forEach(x=>x.remove());
  // Remove blocos antigos identificáveis por texto "Busca rápida", preservando o novo matQuickPicker e o QR.
  [...pane.querySelectorAll('div')].forEach(x=>{if(x.id==='matQuickPicker'||x.closest('#matQuickPicker'))return;const own=[...x.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim();if(/^Busca rápida$/i.test(own))x.remove()});
 }
 function run(){cleanMaterials()}
 addEventListener('DOMContentLoaded',()=>setTimeout(run,180));
 new MutationObserver(()=>setTimeout(run,0)).observe(document.documentElement,{childList:true,subtree:true});
})();