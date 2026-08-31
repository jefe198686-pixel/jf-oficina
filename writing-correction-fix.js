// JF Oficina v0.20.4 — reforço do corretor de escrita
(function(){
 'use strict';
 const replacements=[
  [/\bconfecionar\b/gi,'confeccionar'],
  [/\bconfeçionar\b/gi,'confeccionar'],
  [/\bconfeccionar\b/gi,'confeccionar'],
  [/\bcompressir\b/gi,'compressor'],
  [/\bcompresor\b/gi,'compressor'],
  [/\bcompresssor\b/gi,'compressor'],
  [/\binterupitor\b/gi,'interruptor'],
  [/\binteruptor\b/gi,'interruptor'],
  [/\bpolhia\b/gi,'polia']
 ];
 function preserveCase(source,replacement){
   if(source===source.toUpperCase())return replacement.toUpperCase();
   if(source[0]===source[0].toUpperCase())return replacement[0].toUpperCase()+replacement.slice(1);
   return replacement;
 }
 function sentenceFixes(t){
   t=String(t||'');
   for(const [rx,r] of replacements)t=t.replace(rx,m=>preserveCase(m,r));
   // Separação entre número e palavra: 16vias -> 16 vias, 24vias -> 24 vias, 7metros -> 7 metros.
   t=t.replace(/\b(\d+)\s*(vias?|metros?|mm|cm)\b/gi,'$1 $2');
   // Padronização específica de chicotes, sem alterar medidas ou conteúdo técnico.
   t=t.replace(/\bchicote\s+(\d+)\s+vias?\b/gi,'chicote $1 vias');
   t=t.replace(/\brolamento\s+(?:da\s+)?polia\s+(?:do\s+)?compressor\s+travada\b/gi,'rolamento da polia do compressor travado');
   t=t.replace(/\brolamento\s+polia\s+compressor\b/gi,'rolamento da polia do compressor');
   t=t.replace(/\bfalha\s+interruptor\s+da\s+porta\b/gi,'falha no interruptor da porta');
   t=t.replace(/\bcorrigir\s+falha\s+no\s+interruptor\s+da\s+porta\b/gi,'corrigir a falha no interruptor da porta');
   t=t.replace(/\bdanificou\s+a\s+bobina\s+e\s+cubo\b/gi,'danificando a bobina e o cubo');
   return t;
 }
 const base=window.basicPortugueseReview;
 window.basicPortugueseReview=function(text){
   let t=sentenceFixes(text);
   t=base?base(t):t;
   return sentenceFixes(t);
 };
 const tech=window.technicalLocalReview;
 window.technicalLocalReview=function(text){
   let t=sentenceFixes(text);
   t=tech?tech(t):window.basicPortugueseReview(t);
   return sentenceFixes(t);
 };
})();