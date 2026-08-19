// JF Oficina v0.9.9 — recuperação não destrutiva de dados legados
const JF_RECOVERY_VERSION='0.9.9';

function jfStateCount(x){
  if(!x||typeof x!=='object')return 0;
  const c=x.custom||{};
  return ['clientes','equipamentos_clientes','produtos','ordens_servico','os_equipamentos','os_servicos','os_outros_servicos','os_produtos']
    .reduce((n,k)=>n+(Array.isArray(x[k])?x[k].length:0),0)
    + ['clientes','equipamentos','os','log','stockMoves','deletedProducts','dictionary','techLibrary']
      .reduce((n,k)=>n+(Array.isArray(c[k])?c[k].length:0),0);
}
function jfLooksLikeState(x){
  if(!x||typeof x!=='object'||Array.isArray(x))return false;
  return ['clientes','produtos','ordens_servico','equipamentos_clientes','os_servicos'].some(k=>Array.isArray(x[k])) ||
         (x.custom&&typeof x.custom==='object'&&['clientes','os','equipamentos'].some(k=>Array.isArray(x.custom[k])));
}
function jfMergeRecord(dst,src){
  if(!dst||!src)return dst;
  for(const [k,v] of Object.entries(src)){
    const empty=dst[k]===undefined||dst[k]===null||dst[k]===''||(Array.isArray(dst[k])&&dst[k].length===0);
    if(empty)dst[k]=deep(v);
  }
  return dst;
}
function jfMergeArray(dst=[],src=[]){
  const out=dst;
  const keyOf=x=>String(x?.id??x?.codigo_jf??x?.codigo_cti??x?.matricula??x?.numero_os??'');
  for(const item of src||[]){
    if(!item||typeof item!=='object')continue;
    const k=keyOf(item);
    let cur=k?out.find(x=>keyOf(x)===k):null;
    if(cur)jfMergeRecord(cur,item); else out.push(deep(item));
  }
  return out;
}
function jfMergeState(base,incoming){
  if(!jfLooksLikeState(incoming))return 0;
  const before=jfStateCount(base);
  const top=['clientes','equipamentos_clientes','produtos','servicos_catalogo','ordens_servico','os_equipamentos','os_servicos','os_outros_servicos','os_produtos','situacoes'];
  for(const k of top){base[k]=jfMergeArray(base[k]||[],incoming[k]||[])}
  base.custom=base.custom||{};const ic=incoming.custom||{};
  for(const k of ['clientes','equipamentos','os','log','stockMoves','deletedProducts','dictionary','techLibrary'])base.custom[k]=jfMergeArray(base.custom[k]||[],ic[k]||[]);
  if(!base.custom.productSeq&&ic.productSeq)base.custom.productSeq=ic.productSeq;
  return Math.max(0,jfStateCount(base)-before);
}
async function jfSnapshotCurrent(){
  try{
    const d=await openDB();
    await new Promise(ok=>{const t=d.transaction('s','readwrite');t.objectStore('s').put(deep(S),'pre-migration-0.9.9-'+Date.now());t.oncomplete=ok;t.onerror=ok});
  }catch(e){console.warn('Snapshot de migração não criado',e)}
}
async function jfReadDbCandidates(name){
  const found=[];
  try{
    const db=await new Promise((ok,err)=>{const r=indexedDB.open(name);r.onsuccess=()=>ok(r.result);r.onerror=()=>err(r.error);r.onupgradeneeded=()=>{r.transaction.abort();err(new Error('Banco inexistente'))}});
    for(const storeName of Array.from(db.objectStoreNames)){
      try{
        const values=await new Promise(ok=>{const t=db.transaction(storeName,'readonly');const r=t.objectStore(storeName).getAll();r.onsuccess=()=>ok(r.result||[]);r.onerror=()=>ok([])});
        for(const v of values)if(jfLooksLikeState(v))found.push(v);
      }catch(e){}
    }
    db.close();
  }catch(e){}
  return found;
}
async function jfFindLegacyStates(){
  const candidates=[];
  const names=new Set(['jf-oficina','jf_oficina','jfoficina','JF Oficina','jf-oficina-db','jfOficina']);
  try{if(indexedDB.databases){for(const d of await indexedDB.databases())if(d?.name)names.add(d.name)}}catch(e){}
  for(const name of names){for(const v of await jfReadDbCandidates(name))candidates.push({source:'IndexedDB: '+name,state:v})}
  try{
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i),raw=localStorage.getItem(key);if(!raw)continue;
      try{const v=JSON.parse(raw);if(jfLooksLikeState(v))candidates.push({source:'Armazenamento local: '+key,state:v})}catch(e){}
    }
  }catch(e){}
  return candidates;
}
async function recoverLegacyData(showMessage=true){
  const status=document.getElementById('recoveryStatus');
  if(status)status.textContent='Procurando dados antigos neste endereço...';
  await jfSnapshotCurrent();
  const before=jfStateCount(S);let added=0,sources=[];
  for(const c of await jfFindLegacyStates()){
    const n=jfMergeState(S,c.state);if(n){added+=n;sources.push(c.source)}
  }
  normalize();
  if(added>0){await saveDB();render();}
  const after=jfStateCount(S);
  const msg=added>0
    ? `Recuperação concluída: ${added} registros recuperados. Total atual: ${after}. Origem: ${[...new Set(sources)].join(', ')}.`
    : `Nenhum registro antigo adicional foi encontrado neste endereço. Registros atuais: ${before}. Se o backup veio de outro endereço/navegador, use “Importar backup JSON”.`;
  if(status)status.textContent=msg;if(showMessage)alert(msg);return added;
}
async function jfImportBackupFile(file){
  if(!file)return;
  const status=document.getElementById('recoveryStatus');
  try{
    const obj=JSON.parse(await file.text());if(!jfLooksLikeState(obj))throw new Error('estrutura');
    await jfSnapshotCurrent();const added=jfMergeState(S,obj);normalize();await saveDB();render();
    const msg=`Backup importado sem apagar os dados atuais. ${added} registros novos/recuperados foram incorporados.`;
    if(status)status.textContent=msg;alert(msg);
  }catch(e){const msg='O arquivo selecionado não é um backup compatível do JF Oficina.';if(status)status.textContent=msg;alert(msg)}
}
function jfExportCurrentBackup(){
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download=`JF-Oficina-backup-v${JF_RECOVERY_VERSION}-${dateOnly()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
}
function jfInstallRecoveryUI(){
  const settings=document.getElementById('settings');if(!settings||document.getElementById('recoveryBox'))return;
  const box=document.createElement('div');box.className='section';box.id='recoveryBox';
  box.innerHTML=`<h3>Recuperação de dados</h3><p id="recoveryStatus" class="muted">A v0.9.9 pode procurar OS, clientes, equipamentos e produtos de versões anteriores sem apagar os dados atuais.</p><div class="toolbar"><button type="button" id="recoverLegacy" class="primary">Recuperar dados antigos</button><label class="btn">Importar backup JSON<input id="recoveryFile" type="file" accept="application/json,.json" hidden></label><button type="button" id="exportRecoveryBackup">Exportar backup atual</button></div><p class="small muted">A recuperação automática só alcança dados armazenados no mesmo endereço HTTPS e navegador. Backups de outro endereço ou do modo arquivo devem ser importados pelo botão acima.</p>`;
  settings.appendChild(box);
  document.getElementById('recoverLegacy').onclick=()=>recoverLegacyData(true);
  document.getElementById('recoveryFile').onchange=e=>{jfImportBackupFile(e.target.files?.[0]);e.target.value=''};
  document.getElementById('exportRecoveryBackup').onclick=jfExportCurrentBackup;
}
addEventListener('DOMContentLoaded',jfInstallRecoveryUI);

function jfApplyReleaseIdentity(){
  document.title='JF Oficina v'+JF_RECOVERY_VERSION;
  const ver=document.querySelector('.ver');if(ver)ver.textContent='v'+JF_RECOVERY_VERSION+' • Agrícola • Elétrica • Ar-condicionado';
  const st=document.getElementById('updateStatus');if(st)st.textContent='Versão instalada: '+JF_RECOVERY_VERSION+' — atualização automática ativa.';
}
refreshInstalledVersionLabel=jfApplyReleaseIdentity;
checkAppUpdate=async function(showMessage=false){
  const info=await readRemoteVersion();
  if(!info){if(showMessage)setUpdateStatus('Sem conexão para verificar. Versão instalada: '+JF_RECOVERY_VERSION);return false}
  if(isNewerVersion(info.version,JF_RECOVERY_VERSION)){
    setUpdateStatus('Nova versão '+info.version+' encontrada. Atualizando...');
    if(APP_SW_REG){try{await APP_SW_REG.update()}catch(e){}if(APP_SW_REG.waiting)APP_SW_REG.waiting.postMessage({type:'SKIP_WAITING'})}
    setTimeout(()=>{if(!APP_RELOADING){APP_RELOADING=true;location.replace(location.pathname+'?v='+encodeURIComponent(info.version))}},1600);return true;
  }
  if(showMessage)setUpdateStatus('Versão instalada: '+JF_RECOVERY_VERSION+' — aplicativo atualizado. Atualização automática ativa.');
  return false;
};
addEventListener('DOMContentLoaded',()=>{
  jfApplyReleaseIdentity();
  setTimeout(async()=>{try{if(jfStateCount(S)===0)await recoverLegacyData(false)}catch(e){console.warn('Recuperação automática',e)}},700);
});
