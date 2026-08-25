// JF Oficina v0.15.19 — subtotais de serviços e materiais + total geral
(function(){
 function sum(arr){return (arr||[]).reduce((n,x)=>n+num(lineTotal(x)),0)}
 function install(){
   if(!window.JFCompanyProfile||window.__jfPdfTotalsWrapped)return;
   const original=window.JFCompanyProfile.printDoc;
   if(typeof original!=='function')return;
   window.__jfPdfTotalsWrapped=true;
   function printWithTotals(){
     if(typeof work==='undefined'||!work)return original();
     const serviceSubtotal=sum(work.servicos), materialSubtotal=sum(work.materiais);
     const oldOpen=window.open;
     window.open=function(){
       const w=oldOpen.apply(window,arguments);if(!w)return w;
       const oldWrite=w.document.write.bind(w.document);
       w.document.write=function(html){
         const fmt=v=>num(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
         const subSrv=`<div class="subtotal"><span>Subtotal de serviços</span><b>${fmt(serviceSubtotal)}</b></div>`;
         const subMat=`<div class="subtotal"><span>Subtotal de materiais</span><b>${fmt(materialSubtotal)}</b></div>`;
         html=html.replace(/(<h3>Serviços<\/h3><table>[\s\S]*?<\/table>)/,'$1'+subSrv);
         html=html.replace(/(<h3>Materiais<\/h3><table>[\s\S]*?<\/table>)/,'$1'+subMat);
         html=html.replace('.total{font-size:17px;', '.subtotal{display:flex;justify-content:flex-end;gap:20px;padding:5px 7px;border:1px solid #bfc8bf;border-top:0;background:#f7f9f7;font-size:12px}.subtotal span{min-width:150px;text-align:right}.subtotal b{min-width:95px;text-align:right;color:#173d29}.total{font-size:17px;');
         html=html.replace('<div class="total"><b>Total:', '<div class="total"><b>Total geral:');
         return oldWrite(html)
       };
       return w
     };
     try{return original()}finally{window.open=oldOpen}
   }
   window.JFCompanyProfile.printDoc=printWithTotals;
   const b=document.getElementById('printOS');if(b)b.onclick=printWithTotals;
   document.querySelectorAll('[id*="printBudget"],[id*="bPrint"]').forEach(x=>x.onclick=printWithTotals)
 }
 addEventListener('DOMContentLoaded',()=>setTimeout(install,520));
 new MutationObserver(()=>setTimeout(install,0)).observe(document.documentElement,{childList:true,subtree:true});
})();