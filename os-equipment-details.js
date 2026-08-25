// JF Oficina v0.16.4 — exibe na OS todos os dados salvos do equipamento
(function(){
 function escv(s){return typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
 function detailLine(e){
  if(!e)return '<div class="small muted">Selecione um equipamento.</div>';
  const parts=[];
  if(e.tipo)parts.push('<b>Tipo:</b> '+escv(e.tipo));
  if(e.marca)parts.push('<b>Marca:</b> '+escv(e.marca));
  const model=e.equipamento||e.modelo||e.descricao||'';
  if(model)parts.push('<b>Modelo:</b> '+escv(model));
  const serial=e.numero_serie||e.serie||'';
  if(serial)parts.push('<b>Série/Chassi:</b> '+escv(serial));
  if(e.patrimonio)parts.push('<b>Patrimônio:</b> '+escv(e.patrimonio));
  if(e.ano)parts.push('<b>Ano:</b> '+escv(e.ano));
  if(e.horimetro)parts.push('<b>Horímetro cadastrado:</b> '+escv(e.horimetro));
  if(e.local)parts.push('<b>Local/Fazenda:</b> '+escv(e.local));
  const obs=e.observacoes||'';
  return `<div class="eqSavedData">${parts.map(x=>`<span>${x}</span>`).join('')}${obs?`<div class="eqObs"><b>Observações:</b> ${escv(obs)}</div>`:''}</div>`;
 }
 function installStyle(){if(document.getElementById('jfEqDetailsStyle'))return;const s=document.createElement('style');s.id='jfEqDetailsStyle';s.textContent=`.eqSavedData{grid-column:1/-1;display:flex;gap:6px 14px;flex-wrap:wrap;padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:#f8faf8;font-size:12px}.eqSavedData span{white-space:nowrap}.eqSavedData .eqObs{width:100%;white-space:normal;color:var(--muted)}@media(max-width:700px){.eqSavedData{gap:4px 9px;font-size:11px}.eqSavedData span{white-space:normal}}`;document.head.appendChild(s)}
 function render(){
  if(typeof work==='undefined'||!document.getElementById('equipmentRows'))return;
  equipmentRows.innerHTML=work.equipamentos.map((r,i)=>{const eq=r.equipamento_id&&typeof equipBy==='function'?equipBy(r.equipamento_id):null;return `<div class="itemrow eq" data-eq-row="${i}"><label>Equipamento<select class="eqSel">${equipmentOptions(work.cliente_id,r.equipamento_id)}</select></label><label>Horímetro nesta OS<input class="eqHour" value="${escv(r.horimetro||'')}"></label><label><input class="eqMain" type="radio" name="mainEq" ${r.principal?'checked':''}> Principal</label><button type="button" class="danger delEq">✕</button>${detailLine(eq)}</div>`}).join('');
  document.querySelectorAll('.eqSel').forEach((e,i)=>e.onchange=()=>{work.equipamentos[i].equipamento_id=e.value;render();if(typeof dirty==='function')dirty()});
  document.querySelectorAll('.eqHour').forEach((e,i)=>e.oninput=()=>{work.equipamentos[i].horimetro=e.value;if(typeof dirty==='function')dirty()});
  document.querySelectorAll('.eqMain').forEach((e,i)=>e.onchange=()=>{work.equipamentos.forEach((x,j)=>x.principal=j===i);render();if(typeof dirty==='function')dirty()});
  document.querySelectorAll('.delEq').forEach((e,i)=>e.onclick=()=>{work.equipamentos.splice(i,1);if(work.equipamentos.length&&!work.equipamentos.some(x=>x.principal))work.equipamentos[0].principal=true;render();if(typeof dirty==='function')dirty()});
 }
 function install(){installStyle();if(typeof window.renderEquipments==='function'||typeof renderEquipments==='function'){window.renderEquipments=render;try{renderEquipments=render}catch(e){}}}
 addEventListener('DOMContentLoaded',()=>setTimeout(install,1300));setTimeout(install,2300);
})();