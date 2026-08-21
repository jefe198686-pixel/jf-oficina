// JF Oficina v0.15.10 — limpeza definitiva da interface duplicada
(function(){
 function cleanMaterials(){
  const pane=document.getElementById('tab-materials');if(!pane)return;
  // A pesquisa válida é somente matQuickPicker (Código / Descrição / Aplicação-marca).
  // Remove qualquer finder legado gerado pelo núcleo compartilhado.
  pane.querySelectorAll('.ctxFinder').forEach(x=>{
    const parent=x.parentElement;
    x.remove();
    if(parent && parent!==pane && parent.id!=='matQuickPicker'){
      const txt=(parent.textContent||'').replace(/\s+/g,' ').trim();
      if(/Busca rápida/i.test(txt) || (!parent.querySelector('input,select,button,textarea') && parent.children.length===0)) parent.remove();
    }
  });
  pane.querySelectorAll('select.finderSelectHidden').forEach(x=>x.remove());
  // Remove qualquer bloco antigo que ainda contenha o título Busca rápida,
  // sem tocar no novo seletor, no QR ou na lista de materiais.
  [...pane.querySelectorAll('div')].forEach(x=>{
    if(x.id==='matQuickPicker'||x.closest('#matQuickPicker')||x.id==='materialRows'||x.closest('#materialRows'))return;
    const txt=(x.textContent||'').replace(/\s+/g,' ').trim();
    if(/^Busca rápida\b/i.test(txt) || (/Busca rápida/i.test(txt) && x.querySelector('input[type="search"],input[placeholder*="Digite código"]')))x.remove();
  });
  // Evita a repetição da observação Oficina/Hilux fora do cabeçalho original da seção.
  const notes=[...pane.querySelectorAll('.small.muted')].filter(x=>/A origem Oficina\/Hilux fica registrada/i.test(x.textContent||''));
  notes.slice(1).forEach(x=>x.remove());
 }
 function run(){cleanMaterials()}
 addEventListener('DOMContentLoaded',()=>setTimeout(run,220));
 new MutationObserver(()=>setTimeout(run,0)).observe(document.documentElement,{childList:true,subtree:true});
})();