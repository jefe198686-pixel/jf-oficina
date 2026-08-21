// JF Oficina v0.15.11 — limpeza segura da busca legada
(function(){
 function cleanMaterials(){
  const pane=document.getElementById('tab-materials');if(!pane)return;
  // Nunca remover o seletor novo de três campos.
  const picker=document.getElementById('matQuickPicker');
  // O finder legado usa ctxFinder. Removemos somente esse componente e seu invólucro quando claramente for a Busca rápida.
  pane.querySelectorAll('.ctxFinder').forEach(x=>{
    if(x.closest('#matQuickPicker'))return;
    const parent=x.parentElement;
    x.remove();
    if(parent&&parent!==pane&&!parent.closest('#matQuickPicker')){
      const txt=(parent.textContent||'').replace(/\s+/g,' ').trim();
      if(/Busca rápida/i.test(txt))parent.remove();
    }
  });
  pane.querySelectorAll('select.finderSelectHidden').forEach(x=>{if(!x.closest('#matQuickPicker'))x.remove()});
  // Caso reste apenas o cabeçalho/caixa antiga, remove o menor ancestral que contenha literalmente "Busca rápida".
  [...pane.querySelectorAll('*')].forEach(el=>{
    if(el===picker||el.closest('#matQuickPicker')||el.id==='materialRows'||el.closest('#materialRows')||el.id==='scanMaterialQR'||el.closest('#scanMaterialQR'))return;
    const direct=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').replace(/\s+/g,' ').trim();
    if(/^Busca rápida$/i.test(direct)){
      let target=el;
      while(target.parentElement&&target.parentElement!==pane&&target.parentElement.children.length===1&&!target.parentElement.querySelector('#matQuickPicker,#materialRows,#scanMaterialQR'))target=target.parentElement;
      target.remove();
    }
  });
 }
 function run(){cleanMaterials()}
 addEventListener('DOMContentLoaded',()=>setTimeout(run,220));
 new MutationObserver(()=>setTimeout(run,0)).observe(document.documentElement,{childList:true,subtree:true});
})();