function showView(id){$$('.view').forEach(v=>v.classList.toggle('on',v.id===id));$$('nav [data-view]').forEach(b=>b.classList.toggle('primary',b.dataset.view===id));render()}
$$('nav [data-view]').forEach(b=>b.onclick=()=>showView(b.dataset.view));homeNewOS.onclick=newOS.onclick=()=>openOS();homeNewClient.onclick=newClient.onclick=()=>openClient();
{
 const reportBtn=document.getElementById('generateReport'),internalBtn=document.getElementById('generateInternal'),serviceBtn=document.getElementById('generateServiceDesc');
 const reportEl=document.getElementById('osReport'),internalEl=document.getElementById('osInternal'),serviceEl=document.getElementById('osServiceDesc');
 if(reportBtn&&reportEl)reportBtn.onclick=()=>previewGenerated(reportEl,technicalReportDraft(),'Prévia do Laudo Técnico');
 if(internalBtn&&internalEl)internalBtn.onclick=()=>previewGenerated(internalEl,internalDraft(),'Prévia das Observações Internas');
 if(serviceBtn&&serviceEl)serviceBtn.onclick=()=>{
   let draft=serviceDescriptionDraft();
   if(!draft){alert('Para gerar a Descrição do Serviço, registre ao menos um serviço executado, outro serviço ou uma informação técnica na OS.');return;}
   previewGenerated(serviceEl,draft,'Prévia da Descrição do Serviço');
 };
}
addEventListener('DOMContentLoaded',()=>{
 const dictDlgEl=document.getElementById('dictDlg'),reviewDlgEl=document.getElementById('reviewDlg');
 const closeDictEl=document.getElementById('closeDict'),saveDictEl=document.getElementById('saveDictTerm');
 const closeReviewEl=document.getElementById('closeReview'),cancelReviewEl=document.getElementById('cancelReview'),applyReviewEl=document.getElementById('applyReview');
 if(closeDictEl)closeDictEl.onclick=()=>dictDlgEl?.close();
 if(saveDictEl)saveDictEl.onclick=async()=>{let input=document.getElementById('dictTerm'),term=(input?.value||'').trim();if(!term)return;normalize();if(!S.custom.dictionary.some(x=>String(x.term||x).toLowerCase()===term.toLowerCase()))S.custom.dictionary.push({term});if(input)input.value='';await saveDB();renderDictionary()};
 if(closeReviewEl)closeReviewEl.onclick=()=>reviewDlgEl?.close();
 if(cancelReviewEl)cancelReviewEl.onclick=()=>reviewDlgEl?.close();
 if(applyReviewEl)applyReviewEl.onclick=()=>{let field=document.getElementById(reviewTargetId);if(field){field.value=reviewCandidate;field.dispatchEvent(new Event('input',{bubbles:true}));dirty()}reviewDlgEl?.close()};
});

if(document.getElementById('checkCategory'))checkCategory.onchange=()=>fillRuleSelect();
if(document.getElementById('checkRule'))checkRule.onchange=()=>{let r=techLibrary().find(x=>String(x.id)===String(checkRule.value));if(r)loadChecklistRule(r,'Regra selecionada manualmente.')};
if(document.getElementById('identifyChecklist'))identifyChecklist.onclick=()=>{let best=identifyBestRule();if(best){let origem=best.foundHits>0?'defeito constatado':'defeito reclamado';loadChecklistRule(best.rule,`Caminho direto definido pelo ${origem}: ${best.hits.join(', ')}.`)}else{fillRuleSelect();checkReason.textContent='Nenhuma regra específica foi identificada. Selecione uma regra manualmente ou cadastre uma nova regra técnica.'}};
if(document.getElementById('markAllChecklist'))markAllChecklist.onclick=()=>{for(const x of work.checklist?.items||[])x.done=true;renderChecklist();dirty()};
if(document.getElementById('clearChecklist'))clearChecklist.onclick=()=>{for(const x of work.checklist?.items||[]){x.done=false;x.note=''}renderChecklist();dirty()};
if(document.getElementById('applyChecklistToService'))applyChecklistToService.onclick=applyChecklistDescription;
if(document.getElementById('openLibrary'))openLibrary.onclick=()=>{renderLibraryList();libraryDlg.showModal()};
if(document.getElementById('closeLibrary'))closeLibrary.onclick=()=>libraryDlg.close();
if(document.getElementById('saveLibraryRule'))saveLibraryRule.onclick=async()=>{let name=libName.value.trim(),cat=libCategory.value,kws=libKeywords.value.split(',').map(x=>x.trim()).filter(Boolean),steps=libSteps.value.split('\n').map(x=>x.trim()).filter(Boolean);if(!name||!kws.length||!steps.length){alert('Informe nome, palavras-chave e procedimentos.');return}normalize();S.custom.techLibrary.push({id:uid('TL'),category:cat,name,keywords:kws,steps});libName.value='';libKeywords.value='';libSteps.value='';await saveDB();fillRuleSelect();renderLibraryList()};

newProduct.onclick=()=>openProduct('');
trashProducts.onclick=()=>{renderTrash();trashDlg.showModal()};
closeTrash.onclick=()=>trashDlg.close();
printLabels.onclick=()=>printLabelsFor(activeProducts());
clearProdFilters.onclick=()=>{[filterProdCode,filterInternalCode,filterGTIN,filterName,filterCategory,filterLocation].forEach(x=>x.value='');render()};
[filterProdCode,filterInternalCode,filterGTIN,filterName,filterCategory,filterLocation].forEach(x=>x.oninput=render);
scanMaterialQR.onclick=openScanner;closeScan.onclick=()=>{stopScanner();scanDlg.close()};manualAddProduct.onclick=()=>addProductByScannedCode(manualScanCode.value);
[osSearch,osStatus,clientSearch,stockFilter].forEach(e=>e.addEventListener(e.tagName==='SELECT'?'change':'input',render));

if(document.getElementById('importData')) importData.onchange=async e=>{try{let o=JSON.parse(await e.target.files[0].text());if(!o.clientes||!o.ordens_servico)throw Error('estrutura');S=o;normalize();await saveDB();render();alert('Histórico importado com sucesso.')}catch(err){alert('Arquivo inválido ou incompatível.')}finally{e.target.value=''}}
if(document.getElementById('exportData')) exportData.onclick=()=>{let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download=`JF-Oficina-backup-${dateOnly()}.json`;a.click()}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installBtn.classList.remove('hidden')});installBtn.onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.classList.add('hidden')}}

(async()=>{S=await loadDB()||S;normalize();render();firstDue.value=dateOnly();await registerUpdater();})();
