// JF Oficina v0.15.24 — bloco de pagamento compacto no PDF
(function(){
 const previousOpen=window.open.bind(window);
 window.open=function(){
   const w=previousOpen.apply(window,arguments);
   if(!w||!w.document)return w;
   const previousWrite=w.document.write.bind(w.document);
   w.document.write=function(html){
     if(typeof html==='string' && html.includes('Dados para pagamento')){
       const compactCss='.pay{margin-top:8px!important;padding:4px 7px!important;gap:10px!important;line-height:1.15!important;font-size:10.5px!important;min-height:0!important}.payInfo{line-height:1.18!important}.payQR{flex:0 0 86px!important}.payQR img{width:82px!important;height:82px!important}.payQR span{font-size:8px!important;margin-top:1px!important}';
       html=html.replace('</style>',compactCss+'</style>');
     }
     return previousWrite(html);
   };
   return w;
 };
})();