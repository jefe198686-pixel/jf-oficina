// JF Oficina v0.20.23 — edição dos campos técnicos do orçamento com observer temporário
(function(){
 'use strict';
 const fields=[
  ['bComplaint','Defeito reclamado'],
  ['bFinding','Defeito constatado'],
  ['bServiceDesc','Descrição do serviço proposto'],
  ['bReport','Laudo / justificativa técnica'],
  ['bRecommendation','Recomendação'],
  ['bInternal','Observações internas']
 ];
 function unlock(el){
   if(!el)return;
   el.disabled=false;
   el.readOnly=false;
   el.removeAttribute('disabled');
   el.removeAttribute('readonly');
   el.style.pointerEvents='auto';
   el.style.userSelect='text';
   el.style.webkitUserSelect='text';
 }
 function addTools(id){
   const el=document.getElementById(id);if(!el)return;
   const label=el.closest('label');if(!label||label.querySelector('[data-budget-tools="'+id+'"]'))return;
   const bar=document.createElement('div');bar.dataset.budgetTools=id;bar.className='toolbar';bar.style.margin='5px 0 8px';
   bar.innerHTML=`<button type="button" class="voiceBtn" data-target="${id}">🎙 Ditado</button><button type="button" data-bwrite="${id}">✓ Corrigir escrita</button><button type="button" data-btech="${id}">⚙ Revisar tecnicamente</button>`;
   el.insertAdjacentElement('beforebegin',bar);
   bar.querySelector('[data-bwrite]').onclick=()=>window.openReview?openReview(id,false):alert('Revisor indisponível. Recarregue o aplicativo.');
   bar.querySelector('[data-btech]').onclick=()=>window.openReview?openReview(id,true):alert('Revisor indisponível. Recarregue o aplicativo.');
 }
 function install(){
   const dlg=document.getElementById('budgetDlg');
   if(!dlg)return false;
   fields.forEach(([id])=>{const el=document.getElementById(id);unlock(el);addTools(id)});
   if(!dlg.dataset.budgetEditFix){
     dlg.dataset.budgetEditFix='1';
     dlg.addEventListener('focusin',e=>{if(fields.some(([id])=>e.target?.id===id))unlock(e.target)});
     dlg.addEventListener('input',e=>{if(fields.some(([id])=>e.target?.id===id))unlock(e.target)});
   }
   return true;
 }
 function boot(){
   if(install())return;
   const root=document.body||document.documentElement;
   const observer=new MutationObserver((mutations,obs)=>{
     if(install())obs.disconnect();
   });
   observer.observe(root,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
 window.JFBudgetEditFix={apply:install};
})();