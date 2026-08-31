// JF Oficina v0.20.3 — reforço do corretor de escrita
(function(){
 'use strict';
 const replacements=[
  [/\bcompressir\b/gi,'compressor'],
  [/\bcompresor\b/gi,'compressor'],
  [/\bcompresssor\b/gi,'compressor'],
  [/\binterruptor\b/gi,'interruptor'],
  [/\binterupitor\b/gi,'interruptor'],
  [/\binteruptor\b/gi,'interruptor'],
  [/\bpolhia\b/gi,'polia'],
  [/\bbobina\b/gi,'bobina'],
  [/\bcubo\b/gi,'cubo']
 ];
 function sentenceFixes(t){
   t=String(t||'');
   for(const [rx,r] of replacements)t=t.replace(rx,r);
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