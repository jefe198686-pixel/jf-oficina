// JF Oficina v0.15.0 — ajustes finais do núcleo compartilhado
(function(){
 function refreshBudgetList(){const q=document.getElementById('budgetSearch');if(q)q.dispatchEvent(new Event('input',{bubbles:true}));}
 function syncFinderValues(){
   document.querySelectorAll('select.finderSelectHidden').forEach(sel=>{
     const wrap=sel.previousElementSibling;if(!wrap?.classList.contains('ctxFinder'))return;
     const inp=wrap.querySelector('input');if(!inp)return;
     const o=sel.options[sel.selectedIndex];inp.value=sel.value&&o?o.textContent.trim():'';
   });
 }
 function install(){
   const old=document.getElementById('budgetDlg');if(old)old.remove();
   const nav=document.querySelector('nav [data-view="budgets"]');if(nav)nav.onclick=()=>{showView('budgets');refreshBudgetList()};
   if(window.openBudgetShared)window.openBudget=window.openBudgetShared;
   window.renderBudgets=refreshBudgetList;
   const oos=window.openOS;if(oos&&!oos.dataset?.jfWrapped){
     const w=function(){const r=oos.apply(this,arguments);setTimeout(syncFinderValues,0);return r};w.dataset={jfWrapped:true};window.openOS=w;
   }
   const ob=window.openBudgetShared;if(ob&&!ob.dataset?.jfWrapped){
     const w=function(){const r=ob.apply(this,arguments);setTimeout(syncFinderValues,0);return r};w.dataset={jfWrapped:true};window.openBudgetShared=w;window.openBudget=w;
   }
   setTimeout(()=>{refreshBudgetList();syncFinderValues()},0);
 }
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',install);else install();
})();