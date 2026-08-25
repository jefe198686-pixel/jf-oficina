// JF Oficina v0.15.26 — compactação geral do PDF sem reduzir fonte
(function(){
 const previousOpen=window.open.bind(window);
 window.open=function(){
   const w=previousOpen.apply(window,arguments);
   if(!w||!w.document)return w;
   const previousWrite=w.document.write.bind(w.document);
   w.document.write=function(html){
     if(typeof html==='string' && (html.includes('ORDEM DE SERVIÇO')||html.includes('ORÇAMENTO'))){
       const css=`
       body{line-height:1.12!important}
       .head{padding-bottom:4px!important;margin-bottom:5px!important;gap:16px!important}
       .head h1{margin:0 0 1px!important;line-height:1.05!important}
       .companyInfo{line-height:1.12!important}
       .doc{padding:4px 7px!important;min-height:0!important}
       .doc h2{line-height:1.05!important}
       p{margin:4px 0!important;line-height:1.15!important}
       h3{margin:7px 0 2px!important;padding-bottom:1px!important;line-height:1.08!important}
       pre{margin:1px 0 3px!important;line-height:1.15!important}
       th,td{padding:2px 4px!important;line-height:1.12!important}
       .sectionSubtotal{padding:2px 5px!important;line-height:1.1!important}
       .summary{margin-top:4px!important}
       .moneyRow{padding:2px 5px!important;line-height:1.12!important}
       .moneyRow.grand{padding-top:3px!important;padding-bottom:3px!important}
       .foot{margin-top:7px!important;padding-top:3px!important;line-height:1.1!important}
       `;
       html=html.replace('</style>',css+'</style>');
     }
     return previousWrite(html);
   };
   return w;
 };
})();