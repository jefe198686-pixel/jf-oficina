let APP_SW_REG=null,APP_RELOADING=false;

function versionParts(v){
 return String(v||'0').split('.').map(x=>parseInt(x,10)||0);
}
function isNewerVersion(remote,local){
 let a=versionParts(remote),b=versionParts(local),n=Math.max(a.length,b.length);
 for(let i=0;i<n;i++){let x=a[i]||0,y=b[i]||0;if(x>y)return true;if(x<y)return false}
 return false;
}
function refreshInstalledVersionLabel(){
  const status=document.getElementById('updateStatus');
  if(!status)return;
  if(location.protocol==='https:'){
    status.textContent='Versão instalada: '+VERSION+' — atualização automática ativa.';
  }else{
    status.textContent='Versão instalada: '+VERSION+' — modo local; atualização automática indisponível.';
  }
}

function setUpdateStatus(msg){
 let el=document.getElementById('updateStatus');
 if(el)el.textContent=msg;
}
async function readRemoteVersion(){
 try{
   let r=await fetch('./version.json?ts='+Date.now(),{cache:'no-store',headers:{'cache-control':'no-cache'}});
   if(!r.ok)return null;
   return await r.json();
 }catch(e){return null}
}
async function checkAppUpdate(showMessage=false){
 let info=await readRemoteVersion();
 if(!info){
   if(showMessage)setUpdateStatus('Sem conexão para verificar. Versão instalada: '+VERSION);
   return false;
 }
 if(isNewerVersion(info.version,VERSION) || String(info.version)!==String(VERSION)){
   setUpdateStatus('Nova versão '+info.version+' encontrada. Atualizando...');
   if(APP_SW_REG){
     try{await APP_SW_REG.update()}catch(e){}
     if(APP_SW_REG.waiting)APP_SW_REG.waiting.postMessage({type:'SKIP_WAITING'});
   }
   setTimeout(()=>{if(!APP_RELOADING){APP_RELOADING=true;location.replace(location.pathname+'?v='+encodeURIComponent(info.version))}},1800);
   return true;
 }
 if(showMessage)setUpdateStatus('Versão instalada: '+VERSION+' — aplicativo atualizado. Atualização automática ativa.');
 return false;
}
async function registerUpdater(){
 if(location.protocol!=='https:' && location.hostname!=='localhost'){refreshInstalledVersionLabel();return}
 if(!('serviceWorker' in navigator)){
   setUpdateStatus('Atualização automática indisponível neste navegador. Versão: '+VERSION);
   return;
 }
 try{
   APP_SW_REG=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
   navigator.serviceWorker.addEventListener('controllerchange',()=>{
     if(APP_RELOADING)return;
     APP_RELOADING=true;
     location.reload();
   });
   if(APP_SW_REG.waiting)APP_SW_REG.waiting.postMessage({type:'SKIP_WAITING'});
   APP_SW_REG.addEventListener('updatefound',()=>{
     let worker=APP_SW_REG.installing;
     if(!worker)return;
     worker.addEventListener('statechange',()=>{
       if(worker.state==='installed' && navigator.serviceWorker.controller){
         setUpdateStatus('Nova versão instalada. Reiniciando...');
         worker.postMessage({type:'SKIP_WAITING'});
       }
     });
   });
   setTimeout(()=>checkAppUpdate(false),1200);
   setInterval(()=>checkAppUpdate(false),300000);
   document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkAppUpdate(false)});
 }catch(e){
   setUpdateStatus('Falha ao ativar atualização automática. Versão: '+VERSION);
 }
}
addEventListener('DOMContentLoaded',()=>{refreshInstalledVersionLabel();
 let b=document.getElementById('forceUpdateCheck'),r=document.getElementById('reloadApp');
 if(b)b.onclick=()=>checkAppUpdate(true);
 if(r)r.onclick=()=>location.reload();
});

let activeRecognition=null;
function speechText(t){return String(t||'').replace(/\bnovo parágrafo\b/gi,'\n\n').replace(/\bnova linha\b/gi,'\n').replace(/\bponto\b/gi,'.').replace(/\bvírgula\b/gi,',')}
function startVoice(targetId){
 let SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('Reconhecimento de voz indisponível neste navegador.');return}
 if(activeRecognition){try{activeRecognition.stop()}catch(e){}}
 let el=document.getElementById(targetId),r=new SR();activeRecognition=r;r.lang='pt-BR';r.continuous=true;r.interimResults=false;
 r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal){let t=speechText(e.results[i][0].transcript),a=el.selectionStart??el.value.length,b=el.selectionEnd??a,prefix=(a&&el.value[a-1]&&!/\s/.test(el.value[a-1]))?' ':'';el.value=el.value.slice(0,a)+prefix+t+el.value.slice(b);let pos=a+prefix.length+t.length;el.focus();el.selectionStart=el.selectionEnd=pos;el.dispatchEvent(new Event('input',{bubbles:true}))}};
 r.onerror=e=>{if(e.error!=='no-speech')console.warn(e.error)};r.onend=()=>activeRecognition=null;r.start()
}
document.addEventListener('click',e=>{let b=e.target.closest('.voiceBtn');if(b)startVoice(b.dataset.target)});
function technicalReportDraft(){
 let complaintEl=document.getElementById('osComplaint'),findingEl=document.getElementById('osFinding');
 let a=(complaintEl?.value||'').trim(),b=(findingEl?.value||'').trim(),x=[];
 if(a)x.push('Conforme relato apresentado, o equipamento apresentou: '+a.replace(/\.$/,'')+'.');
 if(b)x.push('Durante a avaliação técnica, foi constatado: '+b.replace(/\.$/,'')+'.');
 if(!x.length)return '';
 x.push('Este laudo foi elaborado exclusivamente com base nas informações registradas nesta ordem de serviço, sem presumir medições, causas ou procedimentos não documentados.');
 return x.join('\n\n')
}
function serviceDescriptionDraft(){
 if(work?.checklist?.items?.length){
   let fromChecklist=checklistDescription();
   if(fromChecklist)return fromChecklist;
   return '';
 }

 let items=[];
 for(const s of (work?.servicos||[])){
   let name=serviceBy(s.servico_id)?.descricao||s.descricao||'';
   if(name)items.push(name.trim());
 }
 for(const o of (work?.outros||[])){if(o.nome)items.push(String(o.nome).trim())}
 if(items.length)return technicalLocalReview('Foram executados os seguintes procedimentos: '+items.join('; ')+'.');

 let report=(document.getElementById('osReport')?.value||'').trim();
 let finding=(document.getElementById('osFinding')?.value||'').trim();
 if(report)return technicalLocalReview(report);
 if(finding)return technicalLocalReview('Realizada avaliação técnica do equipamento. Durante a inspeção, foi constatado: '+finding+'.');
 return '';
}

function internalDraft(){
 let complaintEl=document.getElementById('osComplaint'),findingEl=document.getElementById('osFinding');
 let a=(complaintEl?.value||'').trim(),b=(findingEl?.value||'').trim(),x=[];
 if(a)x.push('Referência do cliente: '+a);
 if(b)x.push('Constatação técnica registrada: '+b);
 if(!x.length)return '';
 x.push('Complementar neste campo eventuais pendências, recomendações, testes posteriores ou peças necessárias conforme evolução do atendimento.');
 return x.join('\n')
}
function previewGenerated(target,text,title){
 if(!text){alert('Preencha Defeito reclamado e/ou Defeito constatado antes de gerar.');return}
 if(confirm(title+'\n\n'+text+'\n\nInserir no campo?')){let old=target.value.trim();target.value=old?old+'\n\n'+text:text;target.dispatchEvent(new Event('input',{bubbles:true}));dirty()}
}

let reviewTargetId='',reviewCandidate='';
const JF_TECH_REPLACEMENTS=[
 [/\b(ar|ar condicionado)\b/gi,'sistema de ar-condicionado'],
 [/\bgás\b/gi,'fluido refrigerante'],
 [/\bpouco fluido refrigerante\b/gi,'indício de baixa carga de fluido refrigerante'],
 [/\bnão gela\b/gi,'apresenta baixa eficiência de refrigeração'],
 [/\bnão funciona\b/gi,'não apresenta funcionamento'],
 [/\bqueimado\b/gi,'danificado'],
 [/\bfio\b/gi,'condutor'],
 [/\bemenda\b/gi,'reparo no condutor'],
 [/\bplug\b/gi,'conector'],
 [/\bpeça\b/gi,'componente']
];
function protectedTerms(){normalize();return new Set((S.custom.dictionary||[]).map(x=>String(x.term||x).toLowerCase()))}
function preserveTechnicalTokens(text){
 let map=[],rx=/\b(?:[A-Z]{2,}[A-Z0-9.-]*|[A-Za-z]+\d+[A-Za-z0-9.-]*|\d+(?:[.,]\d+)?\s?(?:V|A|mA|mm²|mm|bar|psi|°C|kg|g|Hz|kPa|MPa))\b/g;
 let out=String(text).replace(rx,m=>{let k=`§§${map.length}§§`;map.push(m);return k});
 return [out,map]
}
function restoreTokens(text,map){return text.replace(/§§(\d+)§§/g,(_,i)=>map[+i]||'')}

const JF_ACCENT_MAP=new Map([
['nao','não'],['nâo','não'],['esta','está'],['estao','estão'],['ja','já'],['tambem','também'],
['apos','após'],['atraves','através'],['ate','até'],['so','só'],['porem','porém'],['alem','além'],
['possivel','possível'],['necessario','necessário'],['necessaria','necessária'],['tecnico','técnico'],
['tecnica','técnica'],['diagnostico','diagnóstico'],['eletrica','elétrica'],['eletrico','elétrico'],
['eletronica','eletrônica'],['eletronico','eletrônico'],['mecanica','mecânica'],['mecanico','mecânico'],
['hidraulica','hidráulica'],['hidraulico','hidráulico'],['pressao','pressão'],['tensao','tensão'],
['alimentacao','alimentação'],['comunicacao','comunicação'],['conexao','conexão'],['conexoes','conexões'],
['protecao','proteção'],['fusivel','fusível'],['rele','relé'],['modulo','módulo'],['modulos','módulos'],
['oxidacao','oxidação'],['oxidaçao','oxidação'],['inspecao','inspeção'],['verificacao','verificação'],
['avaliacao','avaliação'],['condicao','condição'],['condicoes','condições'],['operacao','operação'],
['operacoes','operações'],['funcao','função'],['funcoes','funções'],['solucao','solução'],
['substituicao','substituição'],['instalacao','instalação'],['configuracao','configuração'],
['calibracao','calibração'],['refrigeracao','refrigeração'],['compressao','compressão'],
['evaporacao','evaporação'],['expansao','expansão'],['obstrucao','obstrução'],['circulacao','circulação'],
['ventilacao','ventilação'],['iluminacao','iluminação'],['sinalizacao','sinalização'],
['resistencia','resistência'],['medicao','medição'],['medicoes','medições'],['nitrogenio','nitrogênio'],
['vacuo','vácuo'],['oleo','óleo'],['provisorio','provisório'],['provisoria','provisória'],
['recomendacao','recomendação'],['recomendacoes','recomendações'],['observacao','observação'],
['observacoes','observações'],['relatorio','relatório'],['historico','histórico'],['maquina','máquina'],
['maquinas','máquinas'],['agricola','agrícola'],['agricolas','agrícolas'],['proprietario','proprietário'],
['situacao','situação'],['concluida','concluída'],['pecas','peças'],['peca','peça'],['vazao','vazão'],
['rotacao','rotação'],['pressurizacao','pressurização'],['desconexao','desconexão'],['gas','gás'],['auta','alta'],['conecçao','conexão'],['conecção','conexão'],
['conecao','conexão'],['conexao','conexão'],['saida','saída'],['entrada','entrada'],['mangueira','mangueira'],
['alta','alta'],['baixa','baixa'],['compressor','compressor'],['vazamento','vazamento'],['pressao','pressão']
]);
function applyAccentCorrections(text){
 const protectedSet=protectedTerms();
 return String(text).replace(/\b[\p{L}\p{N}_-]+\b/gu,word=>{
   const lower=word.toLowerCase();
   if(protectedSet.has(lower))return word;
   const repl=JF_ACCENT_MAP.get(lower);if(!repl)return word;
   if(word===word.toUpperCase())return repl.toUpperCase();
   if(word[0]===word[0]?.toUpperCase()&&word.slice(1)===word.slice(1).toLowerCase())return repl[0].toUpperCase()+repl.slice(1);
   return repl;
 });
}
function applyCommonWritingFixes(text){
 let t=String(text);
 const fixes=[
[/\batravez\b/gi,'através'],[/\bconcerteza\b/gi,'com certeza'],[/\bderrepente\b/gi,'de repente'],
[/\bconecção\b/gi,'conexão'],[/\bconecçao\b/gi,'conexão'],[/\bconecao\b/gi,'conexão'],
[/\bauta\b/gi,'alta'],[/\bgas\b/gi,'gás'],[/\bsaida\b/gi,'saída']
];
 for(const [rx,repl] of fixes)t=t.replace(rx,repl);
 return t;
}

function basicPortugueseReview(text){
 let [t,map]=preserveTechnicalTokens(text);
 t=applyCommonWritingFixes(applyAccentCorrections(t));
 t=t.replace(/[ \t]+/g,' ').replace(/\s+([,.;:!?])/g,'$1').replace(/([,.;:!?])(?=\S)/g,'$1 ')
    .replace(/,{2,}/g,',').replace(/\.{2,}/g,'.').replace(/\s*\n\s*/g,'\n').trim();
 t=t.replace(/(^|[.!?]\s+|\n+)([a-záàâãéêíóôõúç])/g,(m,p,c)=>p+c.toUpperCase());
 if(t && !/[.!?]$/.test(t))t+='.';
 return restoreTokens(t,map)
}

function normalizeTechnicalPhrases(text){
 let t=String(text);
 const phraseFixes=[
   [/\bvazamento\s+(?:de\s+)?gás\b/gi,'vazamento de fluido refrigerante'],
   [/\bmangueira\s+de\s+alta\b/gi,'mangueira de alta pressão'],
   [/\bmangueira\s+de\s+baixa\b/gi,'mangueira de baixa pressão'],
   [/\bconexão\s+saída\s+do\s+compressor\b/gi,'conexão de saída do compressor'],
   [/\bconexão\s+entrada\s+do\s+compressor\b/gi,'conexão de entrada do compressor'],
   [/\bsaída\s+compressor\b/gi,'saída do compressor'],
   [/\bentrada\s+compressor\b/gi,'entrada do compressor'],
   [/\bsem\s+pressão\b/gi,'ausência de pressão'],
   [/\bbaixa\s+pressão\b/gi,'pressão abaixo do especificado'],
   [/\bnão\s+arma\b/gi,'não apresenta acionamento'],
   [/\bnão\s+aciona\b/gi,'não apresenta acionamento'],
   [/\bqueimou\b/gi,'apresentou falha por dano elétrico']
 ];
 for(const [rx,repl] of phraseFixes)t=t.replace(rx,repl);
 t=t.replace(/^\s*vazamento de fluido refrigerante\s+mangueira de alta pressão\s*,?\s*conexão de saída do compressor\s*\.?\s*$/i,'Vazamento de fluido refrigerante na mangueira de alta pressão, na conexão de saída do compressor.');
 t=t.replace(/^\s*vazamento de fluido refrigerante\s+(?:na\s+)?mangueira de alta pressão\s*,?\s*(?:na\s+)?conexão de saída do compressor\s*\.?\s*$/i,'Vazamento de fluido refrigerante na mangueira de alta pressão, na conexão de saída do compressor.');
 t=t.replace(/\bvazamento de fluido refrigerante mangueira\b/gi,'vazamento de fluido refrigerante na mangueira');
 t=t.replace(/\bmangueira de alta pressão,\s*conexão\b/gi,'mangueira de alta pressão, na conexão');
 return t;
}

function technicalLocalReview(text){
 let t=basicPortugueseReview(text),dict=protectedTerms();
 for(let [rx,repl] of JF_TECH_REPLACEMENTS){t=t.replace(rx,m=>dict.has(m.toLowerCase())?m:repl)}
 t=normalizeTechnicalPhrases(t);
 return basicPortugueseReview(t)
}
function openReview(targetId,technical){
 let el=document.getElementById(targetId),src=(el?.value||'').trim();
 if(!src){alert('O campo está vazio.');return}
 reviewTargetId=targetId;reviewCandidate=technical?technicalLocalReview(src):basicPortugueseReview(src);
 const title=document.getElementById('reviewTitle'),preview=document.getElementById('reviewPreview'),dlg=document.getElementById('reviewDlg');
 if(!title||!preview||!dlg){alert('Falha interna ao abrir o revisor. Recarregue o aplicativo.');return}
 title.textContent=technical?'Revisão técnica — prévia':'Correção de escrita — prévia';
 preview.innerHTML=`<div><b>Original</b><div style="margin:6px 0 14px;white-space:pre-wrap">${esc(src)}</div><b>Corrigido</b><div style="margin-top:6px;white-space:pre-wrap">${esc(reviewCandidate)}</div></div>`;
 if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','open')
}
function renderDictionary(){
 normalize();let list=document.getElementById('dictList');if(!list)return;list.innerHTML=(S.custom.dictionary||[]).length?(S.custom.dictionary||[]).map((x,i)=>`<div class="toolbar"><b>${esc(x.term||x)}</b><button type="button" onclick="removeDictTerm(${i})">Excluir</button></div>`).join(''):'<p class="muted">Nenhum termo personalizado.</p>'
}
window.removeDictTerm=async i=>{S.custom.dictionary.splice(i,1);await saveDB();renderDictionary()}
document.addEventListener('click',e=>{
 let a=e.target.closest('.spellReview');if(a){openReview(a.dataset.review,false);return}
 let b=e.target.closest('.techReview');if(b){openReview(b.dataset.review,true);return}
 let c=e.target.closest('.dictAdd');if(c){e.preventDefault();let field=document.getElementById(c.dataset.review),sel=field?.value?.slice(field.selectionStart||0,field.selectionEnd||0).trim(),term=document.getElementById('dictTerm'),dlg=document.getElementById('dictDlg');if(!term||!dlg)return;term.value=sel||'';renderDictionary();if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','open')}
});
