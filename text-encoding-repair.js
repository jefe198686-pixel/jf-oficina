// JF Oficina v0.19.7 — reparo global de textos corrompidos por codificação
(function(){
 const BAD=/[�]|Ã.|Â.|â€|â€“|â€”|â€œ|â€|â€™|â€¦/;
 const WORDS=[
  [/CAMINH�O/gi,'CAMINHÃO'],[/CAMINH�ES/gi,'CAMINHÕES'],[/�NIBUS/gi,'ÔNIBUS'],[/MICRO-�NIBUS/gi,'MICRO-ÔNIBUS'],[/MICRO �NIBUS/gi,'MICRO ÔNIBUS'],
  [/EL�TRIC[AO]/gi,m=>m.toUpperCase().endsWith('A')?'ELÉTRICA':'ELÉTRICO'],[/ELETR�NIC[AO]/gi,m=>m.toUpperCase().endsWith('A')?'ELETRÔNICA':'ELETRÔNICO'],
  [/AGR�COLA/gi,'AGRÍCOLA'],[/AGR�COLAS/gi,'AGRÍCOLAS'],[/MANUTEN��O/gi,'MANUTENÇÃO'],[/MANUTEN��ES/gi,'MANUTENÇÕES'],[/PE�A/gi,'PEÇA'],[/PE�AS/gi,'PEÇAS'],
  [/DESCRI��O/gi,'DESCRIÇÃO'],[/DESCRI��ES/gi,'DESCRIÇÕES'],[/APLICA��O/gi,'APLICAÇÃO'],[/APLICA��ES/gi,'APLICAÇÕES'],[/LOCALIZA��O/gi,'LOCALIZAÇÃO'],
  [/INFORMA��O/gi,'INFORMAÇÃO'],[/INFORMA��ES/gi,'INFORMAÇÕES'],[/OBSERVA��O/gi,'OBSERVAÇÃO'],[/OBSERVA��ES/gi,'OBSERVAÇÕES'],
  [/CONDI��O/gi,'CONDIÇÃO'],[/CONDI��ES/gi,'CONDIÇÕES'],[/OP��O/gi,'OPÇÃO'],[/OP��ES/gi,'OPÇÕES'],[/FUN��O/gi,'FUNÇÃO'],[/FUN��ES/gi,'FUNÇÕES'],
  [/T�CNIC[OA]/gi,m=>m.toUpperCase().endsWith('A')?'TÉCNICA':'TÉCNICO'],[/T�CNICOS/gi,'TÉCNICOS'],[/SERVI�O/gi,'SERVIÇO'],[/SERVI�OS/gi,'SERVIÇOS'],
  [/VE�CULO/gi,'VEÍCULO'],[/VE�CULOS/gi,'VEÍCULOS'],[/M�QUINA/gi,'MÁQUINA'],[/M�QUINAS/gi,'MÁQUINAS'],[/S�RIE/gi,'SÉRIE'],[/N�MERO/gi,'NÚMERO'],
  [/C�DIGO/gi,'CÓDIGO'],[/C�DIGOS/gi,'CÓDIGOS'],[/M�NIMO/gi,'MÍNIMO'],[/M�XIMO/gi,'MÁXIMO'],[/F�BRICA/gi,'FÁBRICA'],[/F�BRICANTE/gi,'FABRICANTE'],
  [/PRESS�O/gi,'PRESSÃO'],[/TENS�O/gi,'TENSÃO'],[/ALIMENTA��O/gi,'ALIMENTAÇÃO'],[/VENTILA��O/gi,'VENTILAÇÃO'],[/REFRIGERA��O/gi,'REFRIGERAÇÃO'],
  [/COMPRESS�O/gi,'COMPRESSÃO'],[/TRANSMISS�O/gi,'TRANSMISSÃO'],[/ILUMINA��O/gi,'ILUMINAÇÃO'],[/PROTE��O/gi,'PROTEÇÃO'],[/CONEX�O/gi,'CONEXÃO'],
  [/REPARA��O/gi,'REPARAÇÃO'],[/REVIS�O/gi,'REVISÃO'],[/REVIS�ES/gi,'REVISÕES'],[/EDI��O/gi,'EDIÇÃO'],[/ALTERA��O/gi,'ALTERAÇÃO'],[/ALTERA��ES/gi,'ALTERAÇÕES'],
  [/SELE��O/gi,'SELEÇÃO'],[/ATRIBUI��O/gi,'ATRIBUIÇÃO'],[/COMISS�O/gi,'COMISSÃO'],[/COMISS�ES/gi,'COMISSÕES'],[/USU�RIO/gi,'USUÁRIO'],[/USU�RIOS/gi,'USUÁRIOS'],
  [/ENDERE�O/gi,'ENDEREÇO'],[/RAZ�O/gi,'RAZÃO'],[/SOCIAL/gi,'SOCIAL'],[/INSCRI��O/gi,'INSCRIÇÃO'],[/PAGAMENTO/gi,'PAGAMENTO'],[/OR�AMENTO/gi,'ORÇAMENTO'],[/OR�AMENTOS/gi,'ORÇAMENTOS'],
  [/JO�O/gi,'JOÃO'],[/JOS�/gi,'JOSÉ'],[/S�O/gi,'SÃO'],[/GON�ALVES/gi,'GONÇALVES'],[/ARA�JO/gi,'ARAÚJO'],[/CONCEI��O/gi,'CONCEIÇÃO']
 ];
 function latin1ToUtf8(s){
  if(!/[ÃÂâ]/.test(s))return s;
  try{const bytes=Uint8Array.from([...s].map(ch=>ch.charCodeAt(0)));const fixed=new TextDecoder('utf-8',{fatal:true}).decode(bytes);return BAD.test(fixed)&&!BAD.test(s)?s:fixed}catch(e){return s}
 }
 function repairString(value){
  let s=String(value??'');if(!s||s.startsWith('data:')||s.length>50000)return s;
  s=latin1ToUtf8(s).normalize('NFC');
  s=s.replace(/â€“/g,'–').replace(/â€”/g,'—').replace(/â€œ|â€/g,'"').replace(/â€™/g,"'").replace(/â€¦/g,'…').replace(/Â(?=\s|$)/g,'');
  for(const [re,to] of WORDS)s=s.replace(re,to);
  return s;
 }
 function walk(x,seen=new WeakSet()){
  if(!x||typeof x!=='object'||seen.has(x))return 0;seen.add(x);let n=0;
  if(Array.isArray(x)){for(let i=0;i<x.length;i++){if(typeof x[i]==='string'){const v=repairString(x[i]);if(v!==x[i]){x[i]=v;n++}}else n+=walk(x[i],seen)}return n}
  for(const k of Object.keys(x)){const v=x[k];if(typeof v==='string'){const nv=repairString(v);if(nv!==v){x[k]=nv;n++}}else n+=walk(v,seen)}return n
 }
 async function run(){
  if(typeof S==='undefined'||!S)return;const changed=walk(S);if(changed){try{await saveDB();if(typeof render==='function')render()}catch(e){console.warn('reparo de texto',e)}
   if(typeof jfSyncNow==='function')setTimeout(()=>jfSyncNow('auto'),100);if(typeof pushCentralSync==='function')pushCentralSync().catch(()=>{})}
  window.JFRepairText=repairString;window.JFRepairAllText=run;
 }
 addEventListener('DOMContentLoaded',()=>setTimeout(run,1700));setTimeout(run,3000);
})();