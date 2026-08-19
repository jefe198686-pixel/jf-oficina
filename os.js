function blankOS(){return {id:'',numero_os:'',cliente_id:'',situacao:'Em andamento',solicitante:'',entrada:nowLocal(),saida:'',local:'',tecnico:'JEFERSON',horimetro:'',controle:'',defeito_reclamado:'',defeito_constatado:'',laudo:'',descricao_servico:'',recomendacao:'',observacoes_internas:'',servicos:[],outros:[],materiais:[],equipamentos:[],fotos:[],desconto:0,acrescimo:0,frete:0,pagamento:'Nenhum',parcelas:[],checklist:{rule_id:'',category:'',items:[]},audit:[]}}
function modelOS(o){
 if(!o)return blankOS();
 return {id:o.id,numero_os:o.numero_os||o.id,cliente_id:o.cliente_id||'',situacao:situation(o),solicitante:o.solicitante||'',entrada:o.entrada||[o.data_entrada,o.hora_entrada].filter(Boolean).join('T').slice(0,16),saida:o.saida||[o.data_saida,o.hora_saida].filter(Boolean).join('T').slice(0,16),local:o.local||'',tecnico:o.tecnico||'JEFERSON',horimetro:o.horimetro||'',controle:o.controle||'',defeito_reclamado:o.defeito_reclamado||'',defeito_constatado:o.defeito_constatado||'',laudo:o.laudo||o.observacoes||'',descricao_servico:o.descricao_servico||'',recomendacao:o.recomendacao||'',observacoes_internas:o.observacoes_internas||'',servicos:deep(o.servicos||legacyServices(o.id)),outros:deep(o.outros||legacyOthers(o.id)),materiais:deep(o.materiais||legacyMaterials(o.id)),equipamentos:deep(o.equipamentos||legacyEquipLinks(o.id)),fotos:deep(o.fotos||[]),desconto:num(o.desconto),acrescimo:num(o.acrescimo),frete:num(o.frete),pagamento:o.pagamento||'Nenhum',parcelas:deep(o.parcelas||[]),checklist:deep(o.checklist||{rule_id:'',category:'',items:[]}),audit:deep(o.audit||auditFor(o))};
}
function fillClientSelects(){
 let opts='<option value="">Selecione...</option>'+clients().map(c=>`<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join('');
 osClient.innerHTML=opts;equipClient.innerHTML=opts;
}
function serviceOptions(selected=''){return '<option value="">Selecione...</option>'+S.servicos_catalogo.filter(s=>s.ativo!==false).map(s=>`<option value="${esc(s.id)}" ${String(s.id)===String(selected)?'selected':''}>${esc(s.descricao)}</option>`).join('')}
function productOptions(selected=''){return '<option value="">Selecione...</option>'+activeProducts().filter(p=>p.ativo!==false).map(p=>`<option value="${esc(p.id)}" ${String(p.id)===String(selected)?'selected':''}>[${esc(productCode(p))}] ${esc(p.descricao||'')}</option>`).join('')}
function equipmentOptions(client,selected=''){return '<option value="">Selecione...</option>'+equips().filter(e=>String(equipClient(e))===String(client)).map(e=>`<option value="${esc(e.id)}" ${String(e.id)===String(selected)?'selected':''}>${esc(equipName(e.id))} ${esc(e.numero_serie||'')}</option>`).join('')}

function openOS(id=''){
 let o=id?osBy(id):null;work=modelOS(o); fillClientSelects(); osId.value=work.id;osClient.value=work.cliente_id;osSituation.value=work.situacao;osRequester.value=work.solicitante;osEntry.value=work.entrada||nowLocal();osExit.value=work.saida||'';osLocation.value=work.local;osTechnician.value=work.tecnico;osHourmeter.value=work.horimetro;osControl.value=work.controle;osComplaint.value=work.defeito_reclamado;osFinding.value=work.defeito_constatado;osReport.value=work.laudo;osServiceDesc.value=work.descricao_servico||'';osRecommendation.value=work.recomendacao;osInternal.value=work.observacoes_internas;globalDiscount.value=work.desconto;globalAdd.value=work.acrescimo;globalFreight.value=work.frete;paymentType.value=work.pagamento||'Nenhum';
 osTitle.textContent=id?`OS ${work.numero_os}`:'Nova OS';osSubtitle.textContent=id?`${clientName(work.cliente_id)} · ${work.situacao}`:'Atendimento novo';
 renderWork(); setTab('general'); osDlg.showModal(); markClean();
}
window.openOS=openOS;
function setTab(name){$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===name));$$('.tabpane').forEach(x=>x.classList.toggle('on',x.id==='tab-'+name))}
$$('.tab').forEach(x=>x.onclick=()=>setTab(x.dataset.tab));

function renderWork(){
 renderServices();renderOthers();renderMaterials();renderEquipments();renderPhotos();renderFinance();renderAudit();fillRuleSelect(work.checklist?.rule_id||'');renderChecklist();
 let final=work.situacao==='Finalizada',cancel=work.situacao==='Cancelada';
 reopenOS.classList.toggle('hidden',!final);finalizeOS.classList.toggle('hidden',final||cancel);saveOS.disabled=final;
}
function rowInput(label,value,attrs=''){return `<label>${label}<input ${attrs} value="${esc(value)}"></label>`}
function renderServices(){
 serviceRows.innerHTML=work.servicos.map((r,i)=>`<div class="itemrow" data-i="${i}">
 <label>Serviço<select class="srvSel">${serviceOptions(r.servico_id)}</select></label><label>Qtd/Horas<input class="srvQty" type="number" step=".25" value="${num(r.quantidade)||1}"></label><label>Valor<input class="srvVal" type="number" step=".01" value="${num(r.valor)}"></label><label>Desconto<input class="srvDisc" type="number" step=".01" value="${num(r.desconto)}"></label><label>Acréscimo<input class="srvAdd" type="number" step=".01" value="${num(r.acrescimo)}"></label><label>Técnico<input class="srvTech" value="${esc(r.tecnico||work.tecnico)}"></label><button type="button" class="danger delSrv">✕</button></div>`).join('');
 $$('.srvSel').forEach((e,i)=>e.onchange=()=>{let s=serviceBy(e.value);work.servicos[i].servico_id=e.value;work.servicos[i].descricao=s?.descricao||'';if(!work.servicos[i].valor)work.servicos[i].valor=num(s?.valor);renderServices();renderFinance();dirty()});
 bindRows('.srvQty','quantidade',work.servicos);bindRows('.srvVal','valor',work.servicos);bindRows('.srvDisc','desconto',work.servicos);bindRows('.srvAdd','acrescimo',work.servicos);bindRows('.srvTech','tecnico',work.servicos,false);
 $$('.delSrv').forEach((e,i)=>e.onclick=()=>{work.servicos.splice(i,1);renderWork();dirty()});
}
function bindRows(sel,key,arr,numeric=true){$$(sel).forEach((e,i)=>e.oninput=()=>{arr[i][key]=numeric?num(e.value):e.value;renderFinance();dirty()})}
function renderOthers(){
 otherRows.innerHTML=work.outros.map((r,i)=>`<div class="itemrow other"><label>Descrição<input class="othName" value="${esc(r.nome)}" placeholder="Ex.: Deslocamento Rio Brilhante → Maracaju"></label><label>Qtd/Km<input class="othQty" type="number" step=".01" value="${num(r.quantidade)||1}"></label><label>Valor un.<input class="othVal" type="number" step=".01" value="${num(r.valor)}"></label><label>Origem<input class="othFrom" value="${esc(r.origem||'')}"></label><label>Destino<input class="othTo" value="${esc(r.destino||'')}"></label><button type="button" class="danger delOth">✕</button></div>`).join('');
 bindRows('.othName','nome',work.outros,false);bindRows('.othQty','quantidade',work.outros);bindRows('.othVal','valor',work.outros);bindRows('.othFrom','origem',work.outros,false);bindRows('.othTo','destino',work.outros,false);$$('.delOth').forEach((e,i)=>e.onclick=()=>{work.outros.splice(i,1);renderWork();dirty()})
}
function renderMaterials(){
 materialRows.innerHTML=work.materiais.map((r,i)=>`<div class="itemrow" data-i="${i}">
 <label>Produto / Código<select class="matSel">${productOptions(r.produto_id)}</select></label><label>Qtd<input class="matQty" type="number" step=".01" value="${num(r.quantidade)||1}"></label><label>Valor<input class="matVal" type="number" step=".01" value="${num(r.valor)}"></label><label>Desconto<input class="matDisc" type="number" step=".01" value="${num(r.desconto)}"></label><label>Acréscimo<input class="matAdd" type="number" step=".01" value="${num(r.acrescimo)}"></label><label>Origem<select class="matOrigin"><option ${r.origem==='Oficina'?'selected':''}>Oficina</option><option ${r.origem==='Hilux'?'selected':''}>Hilux</option></select></label><button type="button" class="danger delMat">✕</button></div>`).join('');
 $$('.matSel').forEach((e,i)=>e.onchange=()=>{let p=prodBy(e.value);work.materiais[i].produto_id=e.value;if(!work.materiais[i].valor)work.materiais[i].valor=num(p?.valor_venda);renderMaterials();renderFinance();dirty()});
 bindRows('.matQty','quantidade',work.materiais);bindRows('.matVal','valor',work.materiais);bindRows('.matDisc','desconto',work.materiais);bindRows('.matAdd','acrescimo',work.materiais);bindRows('.matOrigin','origem',work.materiais,false);$$('.delMat').forEach((e,i)=>e.onclick=()=>{work.materiais.splice(i,1);renderWork();dirty()})
}
function renderEquipments(){
 equipmentRows.innerHTML=work.equipamentos.map((r,i)=>`<div class="itemrow eq"><label>Equipamento<select class="eqSel">${equipmentOptions(work.cliente_id,r.equipamento_id)}</select></label><label>Horímetro nesta OS<input class="eqHour" value="${esc(r.horimetro||'')}"></label><label><input class="eqMain" type="radio" name="mainEq" ${r.principal?'checked':''}> Principal</label><button type="button" class="danger delEq">✕</button></div>`).join('');
 $$('.eqSel').forEach((e,i)=>e.onchange=()=>{work.equipamentos[i].equipamento_id=e.value;dirty()});$$('.eqHour').forEach((e,i)=>e.oninput=()=>{work.equipamentos[i].horimetro=e.value;dirty()});$$('.eqMain').forEach((e,i)=>e.onchange=()=>{work.equipamentos.forEach((x,j)=>x.principal=j===i);renderEquipments();dirty()});$$('.delEq').forEach((e,i)=>e.onclick=()=>{work.equipamentos.splice(i,1);if(work.equipamentos.length&&!work.equipamentos.some(x=>x.principal))work.equipamentos[0].principal=true;renderEquipments();dirty()})
}
function renderPhotos(){
 photoGrid.innerHTML=work.fotos.map((p,i)=>`<div class="photo"><img src="${p.data}"><div class="small">${esc(p.tipo||'Foto')}<br>${esc(p.nome||'')}</div><button type="button" class="danger" onclick="removePhoto(${i})">Remover</button></div>`).join('')
}
window.removePhoto=i=>{work.fotos.splice(i,1);renderPhotos();dirty()}
function lineTotal(r){return Math.max(0,num(r.quantidade)*num(r.valor)-num(r.desconto)+num(r.acrescimo))}
function calcTotals(){
 let s=work.servicos.reduce((a,r)=>a+lineTotal(r),0),o=work.outros.reduce((a,r)=>a+lineTotal(r),0),m=work.materiais.reduce((a,r)=>a+lineTotal(r),0);
 let total=Math.max(0,s+o+m+num(globalFreight.value)+num(globalAdd.value)-num(globalDiscount.value));return {s,o,m,total}
}
function renderFinance(){
 let t=calcTotals(); totals.innerHTML=`<div class="sumline"><span>Serviços</span><b>${money(t.s)}</b></div><div class="sumline"><span>Desloc./Outros</span><b>${money(t.o)}</b></div><div class="sumline"><span>Materiais</span><b>${money(t.m)}</b></div><div class="sumline"><span>Frete</span><b>${money(globalFreight.value)}</b></div><div class="sumline"><span>Acréscimos</span><b>${money(globalAdd.value)}</b></div><div class="sumline"><span>Descontos</span><b>-${money(globalDiscount.value)}</b></div><div class="sumline total"><span>TOTAL</span><b>${money(t.total)}</b></div>`;
 installmentBox.classList.toggle('hidden',paymentType.value!=='À prazo');renderInstallments()
}
function renderInstallments(){installmentRows.innerHTML=work.parcelas.map((p,i)=>`<div class="grid2"><label>Vencimento<input type="date" class="parDue" value="${esc(p.vencimento)}"></label><label>Valor<input type="number" step=".01" class="parVal" value="${num(p.valor)}"></label></div>`).join('');bindRows('.parDue','vencimento',work.parcelas,false);bindRows('.parVal','valor',work.parcelas)}
function renderAudit(){let rows=work.audit||[];auditRows.innerHTML=rows.length?rows.map(a=>`<div class="audit"><b>${esc(a.message||'Alteração')}</b><br><span class="small muted">${new Date(a.at).toLocaleString('pt-BR')} ${a.details?'· '+esc(a.details):''}</span></div>`).join(''):'<p class="muted">Nenhuma alteração registrada.</p>'}
function dirty(){dirtyNote.textContent='Alterações não salvas';dirtyNote.style.background='#fff0c7'}
function markClean(){dirtyNote.textContent='Sem alterações pendentes';dirtyNote.style.background='#f5f7f8'}

function readForm(){
 work.cliente_id=osClient.value;work.situacao=osSituation.value;work.solicitante=osRequester.value;work.entrada=osEntry.value;work.saida=osExit.value;work.local=osLocation.value;work.tecnico=osTechnician.value;work.horimetro=osHourmeter.value;work.controle=osControl.value;work.defeito_reclamado=osComplaint.value;work.defeito_constatado=osFinding.value;work.laudo=osReport.value;work.descricao_servico=osServiceDesc.value;work.recomendacao=osRecommendation.value;work.observacoes_internas=osInternal.value;work.desconto=num(globalDiscount.value);work.acrescimo=num(globalAdd.value);work.frete=num(globalFreight.value);work.pagamento=paymentType.value;
 let t=calcTotals();work.total_servicos=t.s;work.total_outros=t.o;work.total_materiais=t.m;work.total=t.total
}
function diffSummary(oldw,neww){
 let d=[];for(const [k,label] of [['situacao','Situação'],['cliente_id','Cliente'],['defeito_reclamado','Defeito reclamado'],['defeito_constatado','Defeito constatado'],['total','Total']]){if(String(oldw?.[k]??'')!==String(neww?.[k]??''))d.push(`${label}: ${oldw?.[k]??''} → ${neww?.[k]??''}`)}
 return d.slice(0,4).join(' | ')
}
function applyStock(oldM,newM,osid){
 let agg=(arr)=>{let m=new Map();for(const x of arr||[]){if(!x.produto_id)continue;let k=String(x.produto_id),v=m.get(k)||0;m.set(k,v+num(x.quantidade))}return m},a=agg(oldM),b=agg(newM),ids=new Set([...a.keys(),...b.keys()]);
 for(const id of ids){let delta=(b.get(id)||0)-(a.get(id)||0),p=prodBy(id);if(p&&delta){p.estoque_atual=num(p.estoque_atual)-delta;S.custom.stockMoves.unshift({id:uid('M'),at:new Date().toISOString(),os_id:osid,produto_id:id,delta:-delta,origem:'OS'})}}
}
async function persistOS(action='save'){
 readForm();if(!work.cliente_id){alert('Selecione o cliente.');setTab('general');return false}
 let existing=work.id?osBy(work.id):null,old=existing?modelOS(existing):null;
 if(!work.id){work.id=uid('OS');work.numero_os=Math.max(0,...orders().map(o=>num(o.numero_os)))+1;work.audit=[];work.audit.unshift({at:new Date().toISOString(),message:'OS criada'})}
 if(action==='finalize'){work.situacao='Finalizada';work.saida=work.saida||nowLocal();work.audit.unshift({at:new Date().toISOString(),message:'OS finalizada',details:`Pagamento: ${work.pagamento}`})}
 else if(action==='reopen'){work.situacao='Em andamento';work.audit.unshift({at:new Date().toISOString(),message:'OS reaberta'})}
 else work.audit.unshift({at:new Date().toISOString(),message:existing?'OS salva/alterada':'OS criada',details:diffSummary(old,work)})
 applyStock(old?.materiais||[],work.materiais,work.id);
 if(existing){Object.assign(existing,deep(work),{data_entrada:(work.entrada||'').slice(0,10),hora_entrada:(work.entrada||'').slice(11),data_saida:(work.saida||'').slice(0,10),hora_saida:(work.saida||'').slice(11),observacoes:work.laudo,descricao_servico:work.descricao_servico})}
 else S.custom.os.unshift(Object.assign(deep(work),{data_entrada:(work.entrada||'').slice(0,10),hora_entrada:(work.entrada||'').slice(11),data_saida:(work.saida||'').slice(0,10),hora_saida:(work.saida||'').slice(11),observacoes:work.laudo,descricao_servico:work.descricao_servico}));
 await saveDB();render();work=modelOS(osBy(work.id));renderWork();osTitle.textContent=`OS ${work.numero_os}`;osSubtitle.textContent=`${clientName(work.cliente_id)} · ${work.situacao}`;markClean();return true
}

addService.onclick=()=>{work.servicos.push({id:uid('S'),servico_id:'',descricao:'',quantidade:1,valor:0,desconto:0,acrescimo:0,tecnico:work.tecnico});renderWork();dirty()}
addOther.onclick=()=>{work.outros.push({id:uid('O'),nome:'Deslocamento',quantidade:1,valor:3.5,desconto:0,acrescimo:0,origem:'',destino:''});renderWork();dirty()}
addMaterial.onclick=()=>{work.materiais.push({id:uid('P'),produto_id:'',quantidade:1,valor:0,desconto:0,acrescimo:0,origem:'Oficina'});renderWork();dirty()}
addEquipment.onclick=()=>{if(!work.cliente_id){alert('Selecione o cliente primeiro.');return}work.equipamentos.push({equipamento_id:'',principal:work.equipamentos.length===0,horimetro:''});renderEquipments();dirty()}
newEquipment.onclick=()=>{if(!work.cliente_id){alert('Selecione o cliente primeiro.');return}openEquip('',work.cliente_id)}
osClient.onchange=()=>{work.cliente_id=osClient.value;work.equipamentos=[];renderEquipments();dirty()}
[osSituation,osRequester,osEntry,osExit,osLocation,osTechnician,osHourmeter,osControl,osComplaint,osFinding,osReport,osServiceDesc,osRecommendation,osInternal,globalDiscount,globalAdd,globalFreight,paymentType].forEach(e=>e.addEventListener(e.tagName==='SELECT'?'change':'input',()=>{if(e===paymentType)work.pagamento=e.value;renderFinance();dirty()}))
generateInstallments.onclick=()=>{let n=Math.max(1,num(installmentCount.value)),tot=calcTotals().total,base=Math.floor((tot/n)*100)/100,d=new Date((firstDue.value||dateOnly())+'T12:00:00'),arr=[];for(let i=0;i<n;i++){let dd=new Date(d);dd.setMonth(dd.getMonth()+i);arr.push({vencimento:dd.toISOString().slice(0,10),valor:i===n-1?Math.round((tot-base*(n-1))*100)/100:base})}work.parcelas=arr;renderInstallments();dirty()}
photoInput.onchange=async e=>{for(const file of e.target.files){let data=await compressImage(file);work.fotos.push({id:uid('F'),nome:file.name,tipo:'Atendimento',data})}renderPhotos();dirty();photoInput.value=''}
function compressImage(file){return new Promise(ok=>{let im=new Image(),r=new FileReader();r.onload=()=>im.src=r.result;im.onload=()=>{let max=1280,s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.72))};r.readAsDataURL(file)})}

saveOS.onclick=()=>persistOS('save');finalizeOS.onclick=async()=>{if(paymentType.value==='Nenhum'&&!confirm('Finalizar sem registrar forma de pagamento?'))return;if(await persistOS('finalize'))alert('OS finalizada.')}
reopenOS.onclick=()=>persistOS('reopen');closeOS.onclick=cancelOS.onclick=()=>osDlg.close();
printOS.onclick=()=>printCurrentOS();shareOS.onclick=()=>shareCurrentOS();

function printCurrentOS(){
 readForm();let eq=work.equipamentos.map(x=>equipName(x.equipamento_id)).filter(Boolean).join(', '),t=calcTotals(),w=open('','_blank');
 w.document.write(`<html><head><title>OS ${esc(work.numero_os||'Nova')}</title><style>body{font:13px Arial;margin:30px;color:#111}h1{font-size:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #aaa;padding:6px;text-align:left}.r{text-align:right}pre{white-space:pre-wrap;font:13px Arial}</style></head><body><h1>JF MANUTENÇÕES AGRÍCOLAS — ORDEM DE SERVIÇO ${esc(work.numero_os||'')}</h1><p><b>Cliente:</b> ${esc(clientName(work.cliente_id))}<br><b>Equipamento(s):</b> ${esc(eq)}<br><b>Situação:</b> ${esc(work.situacao)}</p><h3>Defeito reclamado</h3><pre>${esc(work.defeito_reclamado)}</pre><h3>Defeito constatado</h3><pre>${esc(work.defeito_constatado)}</pre><h3>Descrição do Serviço</h3><pre>${esc(work.descricao_servico||'')}</pre><h3>Laudo técnico</h3><pre>${esc(work.laudo)}</pre><h3>Serviços</h3><table>${work.servicos.map(x=>`<tr><td>${esc(serviceBy(x.servico_id)?.descricao||x.descricao)}</td><td>${num(x.quantidade)}</td><td class=r>${money(lineTotal(x))}</td></tr>`).join('')}</table><h3>Materiais</h3><table><tr><th>Código</th><th>Produto</th><th>Quantidade</th><th>Valor unitário</th><th>Total</th></tr>${work.materiais.map(x=>{let p=prodBy(x.produto_id);return `<tr><td>${esc(productCode(p))}</td><td>${esc(p?.descricao||'')}</td><td>${num(x.quantidade)}</td><td class=r>${money(x.valor)}</td><td class=r>${money(lineTotal(x))}</td></tr>`}).join('')}</table><h2 class=r>Total: ${money(t.total)}</h2><h3>Recomendação</h3><pre>${esc(work.recomendacao)}</pre><script>print()<\/script>
</body></html>`);w.document.close()
}
async function shareCurrentOS(){readForm();let text=`JF Oficina — OS ${work.numero_os||'Nova'}\nCliente: ${clientName(work.cliente_id)}\nSituação: ${work.situacao}\nDefeito: ${work.defeito_reclamado}\nTotal: ${money(calcTotals().total)}`;if(navigator.share)try{await navigator.share({title:`OS ${work.numero_os||''}`,text})}catch{}else{await navigator.clipboard.writeText(text);alert('Resumo copiado.')}}
