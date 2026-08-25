// JF Oficina v0.15.25 — bloco de pagamento ainda mais compacto no PDF
(function(){
 const previousOpen=window.open.bind(window);
 window.open=function(){
   const w=previousOpen.apply(window,arguments);
   if(!w||!w.document)return w;
   const previousWrite=w.document.write.bind(w.document);
   w.document.write=function(html){
     if(typeof html==='string' && html.includes('Dados para pagamento')){
       // Reorganiza os dados em duas colunas para reduzir a altura sem diminuir a fonte.
       html=html.replace(/<div class="payInfo"><b>Dados para pagamento<\/b><br>([\s\S]*?)<\/div>(?=<div class="payQR"|<\/div>)/,function(all,inner){
         const lines=inner.split('<br>').filter(Boolean);
         return '<div class="payInfo"><b>Dados para pagamento</b><div class="payGrid">'+lines.map(x=>'<div class="payLine">'+x+'</div>').join('')+'</div></div>';
       });
       const compactCss='.pay{margin-top:6px!important;padding:3px 6px!important;gap:8px!important;line-height:1.05!important;font-size:10.5px!important;min-height:0!important}.payInfo{line-height:1.02!important;align-self:center}.payInfo>b{display:block;margin:0 0 2px!important}.payGrid{display:grid!important;grid-template-columns:1fr 1fr!important;column-gap:16px!important;row-gap:0!important;line-height:1.02!important}.payLine{margin:0!important;padding:0!important;line-height:1.02!important;min-height:0!important}.payQR{flex:0 0 76px!important}.payQR img{width:72px!important;height:72px!important}.payQR span{font-size:8px!important;margin-top:0!important;line-height:1!important}';
       html=html.replace('</style>',compactCss+'</style>');
     }
     return previousWrite(html);
   };
   return w;
 };
})();