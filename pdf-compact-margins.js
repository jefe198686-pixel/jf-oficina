// JF Oficina v0.15.23 — margens mínimas dos documentos impressos
(function(){
 const nativeOpen=window.open.bind(window);
 window.open=function(){
   const w=nativeOpen.apply(window,arguments);
   if(!w||!w.document)return w;
   const nativeWrite=w.document.write.bind(w.document);
   w.document.write=function(html){
     if(typeof html==='string' && (html.includes('ORDEM DE SERVIÇO')||html.includes('ORÇAMENTO'))){
       html=html.replace('@page{margin:14mm}','@page{margin:5mm}');
     }
     return nativeWrite(html);
   };
   return w;
 };
})();