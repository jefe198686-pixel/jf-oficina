// JF Oficina v0.15.20 — resumo financeiro transparente no PDF
(function(){
 function install(){
  if(!window.JFCompanyProfile||window.__jfPdfSummaryV2)return;
  const original=window.JFCompanyProfile.printDoc;if(typeof original!=='function')return;
  window.__jfPdfSummaryV2=true;
  function wrapped(){
   if(typeof work==='undefined'||!work)return original();
   const t=calcTotals();
   const freight=num(work.frete ?? document.getElementById('globalFreight')?.value);
   const add=num(work.acrescimo ?? document.getElementById('globalAdd')?.value);
   const disc=num(work.desconto ?? document.getElementById('globalDiscount')?.value);
   const fmt=v=>num(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
   const oldOpen=window.open;
   window.open=function(){
    const w=oldOpen.apply(window,arguments);if(!w)return w;
    const ow=w.document.write.bind(w.document);
    w.document.write=function(html){
     const summary=`<div class="jfSummary"><div><span>Subtotal de serviços</span><b>${fmt(t.s)}</b></div><div><span>Subtotal de materiais</span><b>${fmt(t.m)}</b></div>${t.o?`<div><span>Deslocamentos / outros</span><b>${fmt(t.o)}</b></div>`:''}${freight?`<div><span>Frete</span><b>${fmt(freight)}</b></div>`:''}${add?`<div><span>Acréscimos gerais</span><b>${fmt(add)}</b></div>`:''}${disc?`<div><span>Descontos gerais</span><b>- ${fmt(disc)}</b></div>`:''}<div class="grand"><span>Total geral</span><b>${fmt(t.total)}</b></div></div>`;
     html=html.replace('</style>','.jfSummary{margin-top:10px;margin-left:auto;width:310px;border:1px solid #bfc8bf;background:#f7f9f7}.jfSummary>div{display:flex;justify-content:space-between;gap:18px;padding:5px 8px;border-bottom:1px solid #d8ded8}.jfSummary>div:last-child{border-bottom:0}.jfSummary span{text-align:right}.jfSummary b{min-width:105px;text-align:right}.jfSummary .grand{font-size:16px;color:#102d4b;background:#eef2ed;font-weight:700}</style>');
     // remove qualquer resumo/total antigo para não duplicar
     html=html.replace(/<div class="subtotal">[\s\S]*?<\/div>/g,'');
     html=html.replace(/<div class="total"><b>(?:Total|Total geral):[\s\S]*?<\/div>/,summary);
     return ow(html)
    };return w
   };
   try{return original()}finally{window.open=oldOpen}
  }
  window.JFCompanyProfile.printDoc=wrapped;
  const b=document.getElementById('printOS');if(b)b.onclick=wrapped;
  document.querySelectorAll('[id*="printBudget"],[id*="bPrint"]').forEach(x=>x.onclick=wrapped)
 }
 addEventListener('DOMContentLoaded',()=>setTimeout(install,900));
 new MutationObserver(()=>setTimeout(install,0)).observe(document.documentElement,{childList:true,subtree:true});
})();