// JF Oficina v0.19.8 — reparo persistente de textos corrompidos por codificação
(function(){
 const BAD=/[�]|Ã.|Â.|â€|â€“|â€”|â€œ|â€|â€™|â€¦/;
 const WORDS=[
  [/MECANIZA(?:��|�{1,2})O/gi,'MECANIZAÇÃO'],[/HIDR�ULIC([AO])/gi,(m,g)=>'HIDRÁULIC'+g],
  [/CAMINH�O/gi,'CAMINHÃO'],[/CAMINH�ES/gi,'CAMINHÕES'],[/�NIBUS/gi,'ÔNIBUS'],[/MICRO-�NIBUS/gi,'MICRO-ÔNIBUS'],[/MICRO �NIBUS/gi,'MICRO ÔNIBUS'],
  [/EL�TRIC([AO])/gi,(m,g)=>'ELÉTRIC'+g],[/ELETR�NIC([AO])/gi,(m,g)=>'ELETRÔNIC'+g],[/AGR�COLAS?/gi,m=>m.toUpperCase().endsWith('S')?'AGRÍCOLAS':'AGRÍCOLA'],
  [/MANUTEN(?:��|�{1,2})O/gi,'MANUTENÇÃO'],[/MANUTEN(?:��|�{1,2})ES/gi,'MANUTENÇÕES'],[/PE�AS?/gi,m=>m.toUpperCase().endsWith('S')?'PEÇAS':'PEÇA'],
  [/DESCRI(?:��|�{1,2})O/gi,'DESCRIÇÃO'],[/DESCRI(?:��|�{1,2})ES/gi,'DESCRIÇÕES'],[/APLICA(?:��|�{1,2})O/gi,'APLICAÇÃO'],[/APLICA(?:��|�{1,2})ES/gi,'APLICAÇÕES'],[/LOCALIZA(?:��|�{1,2})O/gi,'LOCALIZAÇÃO'],
  [/INFORMA(?:��|�{1,2})O/gi,'INFORMAÇÃO'],[/INFORMA(?:��|�{1,2})ES/gi,'INFORMAÇÕES'],[/OBSERVA(?:��|�{1,2})O/gi,'OBSERVAÇÃO'],[/OBSERVA(?:��|�{1,2})ES/gi,'OBSERVAÇÕES'],
  [/CONDI(?:��|�{1,2})O/gi,'CONDIÇÃO'],[/CONDI(?:��|�{1,2})ES/gi,'CONDIÇÕES'],[/OP(?:��|�{1,2})O/gi,'OPÇÃO'],[/OP(?:��|�{1,2})ES/gi,'OPÇÕES'],[/FUN(?:��|�{1,2})O/gi,'FUNÇÃO'],[/FUN(?:��|�{1,2})ES/gi,'FUNÇÕES'],
  [/T�CNIC([OA])/gi,(m,g)=>'TÉCNIC'+g],[/T�CNICOS/gi,'TÉCNICOS'],[/SERVI�OS?/gi,m=>m.toUpperCase().endsWith('S')?'SERVIÇOS':'SERVIÇO'],[/VE�CULOS?/gi,m=>m.toUpperCase().endsWith('S')?'VEÍCULOS':'VEÍCULO'],
  [/M�QUINAS?/gi,m=>m.toUpperCase().endsWith('S')?'MÁQUINAS':'MÁQUINA'],[/S�RIE/gi,'SÉRIE'],[/N�MERO/gi,'NÚMERO'],[/C�DIGOS?/gi,m=>m.toUpperCase().endsWith('S')?'CÓDIGOS':'CÓDIGO'],[/M�NIMO/gi,'MÍNIMO'],[/M�XIMO/gi,'MÁXIMO'],
  [/F�BRICA/gi,'FÁBRICA'],[/PRESS�O/gi,'PRESSÃO'],[/TENS�O/gi,'TENSÃO'],[/ALIMENTA(?:��|�{1,2})O/gi,'ALIMENTAÇÃO'],[/VENTILA(?:��|�{1,2})O/gi,'VENTILAÇÃO'],[/REFRIGERA(?:��|�{1,2})O/gi,'REFRIGERAÇÃO'],
  [/COMPRESS�O/gi,'COMPRESSÃO'],[/TRANSMISS�O/gi,'TRANSMISSÃO'],[/ILUMINA(?:��|�{1,2})O/gi,'ILUMINAÇÃO'],[/PROTE(?:��|�{1,2})O/gi,'PROTEÇÃO'],[/CONEX�O/gi,'CONEXÃO'],[/REPARA(?:��|�{1,2})O/gi,'REPARAÇÃO'],
  [/REVIS�O/gi,'REVISÃO'],[/REVIS�ES/gi,'REVISÕES'],[/EDI(?:��|�{1,2})O/gi,'EDIÇÃO'],[/ALTERA(?:��|�{1,2})O/gi,'ALTERAÇÃO'],[/ALTERA(?:��|�{1,2})ES/gi,'ALTERAÇÕES'],[/SELE(?:��|�{1,2})O/gi,'SELEÇÃO'],
  [/ATRIBUI(?:��|�{1,2})O/gi,'ATRIBUIÇÃO'],[/COMISS�O/gi,'COMISSÃO'],[/COMISS�ES/gi,'COMISSÕES'],[/USU�RIOS?/gi,m=>m.toUpperCase().endsWith('S')?'USUÁRIOS':'USUÁRIO'],[/ENDERE�O/gi,'ENDEREÇO'],[/RAZ�O/gi,'RAZÃO'],
  [/INSCRI(?:��|�{1,2})O/gi,'INSCRIÇÃO'],[/OR�AMENTOS?/gi,m=>m.toUpperCase().endsWith('S')?'ORÇAMENTOS':'ORÇAMENTO'],[/JO�O/gi,'JOÃO'],[/JOS�/gi,'JOSÉ'],[/S�O/gi,'SÃO'],[/GON�ALVES/gi,'GONÇALVES'],[/ARA�JO/gi,'ARAÚJO'],[/CONCEI(?:��|�{1,2})O/gi,'CONCEIÇÃO']
 ];
 function latin1ToUtf8(s){if(!/[ÃÂâ]/.test(s))return s;try{const bytes=Uint8Array.from([...s].map(ch=>ch.charCodeAt(0)&255));const fixed=new TextDecoder('utf-8',{fatal:true}).decode(bytes);return BAD.test(fixed)&&!BAD.test(s)?s:fixed}catch(e){return s}}
 function repairString(value){let s=String(value??'');if(!s||s.startsWith('data:')||s.length>50000)return s;s=latin1ToUtf8(s).normalize('NFC');s=s.replace(/â€“/g,'–').replace(/â€”/g,'—').replace(/â€œ|â€/g,'"').replace(/â€™/g,"'").replace(/â€¦/g,'…').replace(/Â(?=\s|$)/g,'');for(const [re,to] of WORDS)s=s.replace(re,to);return s}
 function walk(x,seen=new WeakSet()){if(!x||typeof x!=='object'||seen.has(x))return 0;seen.add(x);let n=0;if(Array.isArray(x)){for(let i=0;i<x.length;i++){if(typeof x[i]==='string'){const v=repairString(x[i]);if(v!==x[i]){x[i]=v;n++}}else n+=walk(x[i],seen)}return n}for(const k of Object.keys(x)){const v=x[k];if(typeof v==='string'){const nv=repairString(v);if(nv!==v){x[k]=nv;n++}}else n+=walk(v,seen)}return n}
 async function run(){if(typeof S==='undefined'||!S)return;const changed=walk(S);if(changed){try{await saveDB();if(typeof render==='function')render()}catch(e){console.warn('reparo de texto',e)}try{if(typeof pushCentralSync==='function')await pushCentralSync();else if(typeof jfSyncNow==='function')await jfSyncNow('manual')}catch(e){console.warn('sincronização do reparo',e)}}window.JFRepairText=repairString;window.JFRepairAllText=run}
 addEventListener('DOMContentLoaded',()=>setTimeout(run,2200));setTimeout(run,4500);
})();