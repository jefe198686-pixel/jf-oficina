// JF Oficina v0.15.0 — núcleo compartilhado OS/Orçamento + pesquisa contextual
(function(){
 const V='0.15.0';
 let MODE='os', BUDGET_ID='';
 const osSituationOptions=['Em andamento','Aguardando peças','Concluída','Finalizada','Cancelada'];
 const budgetSituationOptions=['Em elaboração','Enviado','Aprovado','Recusado','Expirado','Cancelado'];
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const escx=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const hit=(text,q)=>norm(q).trim().split(/\s+/).filter(Boolean).every(t=>norm(text).includes(t));
 function ensureBudgets(){S.custom=S.custom||{};if(!Array.isArray(S.custom.orcamentos))S.custom.orcamentos=[];}
 function budgets(){ensureBudgets();return S.custom.orcamentos;}
 function budgetBy(id){return budgets().find(x=>String(x.id)===String(id));}
 function nextBudgetNo(){return String(Math.max(0,...budgets().map(x=>num(x.numero_orcamento)))+1);}
 function auditNow(message,details=''){return {at:new Date().toISOString(),message,details};}
 function blankBudget(){
   const x=blankOS();
   return Object.assign(x,{id:'',numero_orcamento:'',numero_os:'',situacao:'Em elaboração',validade:15,pagamento:'Nenhum',parcelas:[],criado_em:new Date().toISOString(),atualizado_em:new Date().toISOString(),origem:'Orçamento'});
 }
 function budgetModel(x){
   if(!x)return blankBudget();
   const b=blankBudget();
   for(const k of Object.keys(b))if(Object.prototype.hasOwnProperty.call(x,k))b[k]=deep(x[k]);
   for(const k of ['servicos','outros','materiais','equipamentos','fotos','parcelas','audit'])b[k]=deep(x[k]||[]);
   b.checklist=deep(x.checklist||{rule_id:'',category:'',items:[]});
   b.numero_orcamento=String(x.numero_orcamento||'');
   return b;
 }
 function setSituationOptions(values,current){
   osSituation.innerHTML=values.map(v=>`<option ${v===current?'selected':''}>${escx(v)}</option>`).join('');
   osSituation.value=current||values[0];
 }
 function setDocChrome(){
   const financeTab=document.querySelector('[data-tab="finance"]');
   if(MODE==='budget'){
     document.body.dataset.docMode='budget';
     setSituationOptions(budgetSituationOptions,work?.situacao||'Em elaboração');
     if(financeTab)financeTab.textContent='Valores / Condições';
     const matNote=document.querySelector('#tab-materials .small.muted');if(matNote)matNote.textContent='Materiais previstos no orçamento. Não reserva e não movimenta estoque.';
     const eqTitle=document.querySelector('#tab-equipments h3');if(eqTitle)eqTitle.textContent='Equipamentos vinculados ao orçamento';
     const hist=document.querySelector('#tab-history h3');if(hist)hist.textContent='Histórico do orçamento';
     finalizeOS.classList.remove('hidden');finalizeOS.disabled=false;finalizeOS.textContent='Transformar em OS';
     reopenOS.classList.add('hidden');saveOS.disabled=false;saveOS.textContent='Salvar orçamento';
     dirtyNote.textContent='Orçamento sem movimentação de estoque/financeiro';
     let n=document.getElementById('budgetNoMovementNote');if(!n){n=document.createElement('div');n.id='budgetNoMovementNote';n.className='budgetWarn';n.textContent='ORÇAMENTO: valores e materiais são somente proposta. Salvar este documento não movimenta estoque nem financeiro.';document.querySelector('#tab-finance .grid2')?.prepend(n)}
   }else{
     document.body.dataset.docMode='os';
     setSituationOptions(osSituationOptions,work?.situacao||'Em andamento');
     if(financeTab)financeTab.textContent='Financeiro';
     const matNote=document.querySelector('#tab-materials .small.muted');if(matNote)matNote.textContent='A origem Oficina/Hilux fica registrada. Alterações na OS recalculam a movimentação de estoque.';
     const eqTitle=document.querySelector('#tab-equipments h3');if(eqTitle)eqTitle.textContent='Equipamentos vinculados à OS';
     const hist=document.querySelector('#tab-history h3');if(hist)hist.textContent='Histórico de alterações';
     const n=document.getElementById('budgetNoMovementNote');if(n)n.remove();
     finalizeOS.textContent='Finalizar';saveOS.textContent='Salvar';
   }
 }
 function fillWorkFields(){
   fillClientSelects();
   osId.value=work.id||'';osClient.value=work.cliente_id||'';osRequester.value=work.solicitante||'';osEntry.value=work.entrada||nowLocal();osExit.value=work.saida||'';osLocation.value=work.local||'';osTechnician.value=work.tecnico||'JEFERSON';osHourmeter.value=work.horimetro||'';osControl.value=work.controle||'';osComplaint.value=work.defeito_reclamado||'';osFinding.value=work.defeito_constatado||'';osReport.value=work.laudo||'';osServiceDesc.value=work.descricao_servico||'';osRecommendation.value=work.recomendacao||'';osInternal.value=work.observacoes_internas||'';globalDiscount.value=num(work.desconto);globalAdd.value=num(work.acrescimo);globalFreight.value=num(work.frete);paymentType.value=work.pagamento||'Nenhum';
   setDocChrome();renderWork();installContextSearch();
 }
 function openBudgetShared(id=''){
   ensureBudgets();MODE='budget';BUDGET_ID=id||'';
   work=budgetModel(id?budgetBy(id):null);
   fillWorkFields();
   osTitle.textContent=id?`Orçamento ${work.numero_orcamento}`:'Novo orçamento';
   osSubtitle.textContent=id?`${clientName(work.cliente_id)} · ${work.situacao}`:'Proposta técnica/comercial';
   setTab('general');osDlg.showModal();markClean();
 }
 window.openBudgetShared=openBudgetShared;
 const originalOpenOS=window.openOS;
 window.openOS=function(id=''){MODE='os';BUDGET_ID='';const r=originalOpenOS(id);setDocChrome();setTimeout(installContextSearch,0);return r};
 function readBudgetForm(){
   readForm();
   work.numero_os='';work.numero_orcamento=work.numero_orcamento||'';work.atualizado_em=new Date().toISOString();
 }
 async function saveBudget(){
   ensureBudgets();readBudgetForm();
   if(!work.cliente_id){alert('Selecione o cliente.');setTab('general');return false}
   let existing=BUDGET_ID?budgetBy(BUDGET_ID):null;
   if(!work.id){work.id=uid('ORC');work.numero_orcamento=nextBudgetNo();work.criado_em=new Date().toISOString();work.audit=[];work.audit.unshift(auditNow('Orçamento criado'));BUDGET_ID=work.id}
   else work.audit=Array.isArray(work.audit)?work.audit:[];
   if(existing)work.audit.unshift(auditNow('Orçamento salvo/alterado'));
   work.pagamento=paymentType.value||'Nenhum';work.parcelas=deep(work.parcelas||[]);
   const clean=deep(work);delete clean.numero_os;clean.origem='Orçamento';clean.atualizado_em=new Date().toISOString();
   if(existing)Object.assign(existing,clean);else budgets().unshift(clean);
   await saveDB();render();work=budgetModel(budgetBy(work.id));fillWorkFields();osTitle.textContent=`Orçamento ${work.numero_orcamento}`;osSubtitle.textContent=`${clientName(work.cliente_id)} · ${work.situacao}`;markClean();return true;
 }
 async function convertBudget(){
   if(!(await saveBudget()))return;
   const b=budgetBy(BUDGET_ID);if(!b)return;
   if(!confirm(`Transformar o orçamento ${b.numero_orcamento} em uma nova OS?\n\nO orçamento será preservado. A nova OS terá numeração própria e passará a seguir as regras normais de estoque.`))return;
   MODE='os';
   const source=budgetModel(b),newWork=blankOS();
   for(const k of Object.keys(newWork))if(Object.prototype.hasOwnProperty.call(source,k))newWork[k]=deep(source[k]);
   newWork.id='';newWork.numero_os='';newWork.situacao='Em andamento';newWork.saida='';newWork.pagamento='Nenhum';newWork.parcelas=[];newWork.audit=[auditNow('OS criada a partir de orçamento',`Orçamento ${source.numero_orcamento}`)];newWork.orcamento_id=source.id;newWork.numero_orcamento_origem=source.numero_orcamento;
   work=newWork;setDocChrome();
   const ok=await persistOS('save');
   if(ok){b.situacao='Aprovado';b.os_id=work.id;b.numero_os_gerada=work.numero_os;b.audit=b.audit||[];b.audit.unshift(auditNow('Transformado em OS',`OS ${work.numero_os}`));await saveDB();render();osTitle.textContent=`OS ${work.numero_os}`;osSubtitle.textContent=`${clientName(work.cliente_id)} · criada do orçamento ${source.numero_orcamento}`;alert(`Orçamento ${source.numero_orcamento} transformado na OS ${work.numero_os}.`)}
 }
 const originalSave=saveOS.onclick, originalFinalize=finalizeOS.onclick, originalReopen=reopenOS.onclick, originalPrint=printOS.onclick, originalShare=shareOS.onclick;
 saveOS.onclick=()=>MODE==='budget'?saveBudget():originalSave?.call(saveOS);
 finalizeOS.onclick=()=>MODE==='budget'?convertBudget():originalFinalize?.call(finalizeOS);
 reopenOS.onclick=()=>MODE==='budget'?null:originalReopen?.call(reopenOS);
 function budgetPrint(){
   readBudgetForm();const t=calcTotals(),eq=work.equipamentos.map(x=>equipName(x.equipamento_id)).filter(Boolean).join(', ');const p=open('','_blank');
   const mats=work.materiais.map(x=>{const z=prodBy(x.produto_id);return `<tr><td>${escx(z?productCode(z):'')}</td><td>${escx(z?.descricao||'')}</td><td>${num(x.quantidade)}</td><td>${money(x.valor)}</td><td>${money(lineTotal(x))}</td></tr>`}).join('');
   const srvs=work.servicos.map(x=>{const z=serviceBy(x.servico_id);return `<tr><td>${escx(z?.descricao||x.descricao||'')}</td><td>${num(x.quantidade)}</td><td>${money(x.valor)}</td><td>${money(lineTotal(x))}</td></tr>`}).join('');
   p.document.write(`<!doctype html><meta charset="utf-8"><title>Orçamento ${escx(work.numero_orcamento||'novo')}</title><style>body{font-family:Arial;margin:28px;color:#111}h1{font-size:22px}h2{font-size:16px;margin-top:24px}table{width:100%;border-collapse:collapse}th,td{padding:7px;border-bottom:1px solid #ddd;text-align:left}.total{font-size:18px;text-align:right;margin-top:18px}.muted{color:#666}</style><h1>JF Oficina — ORÇAMENTO ${escx(work.numero_orcamento||'')}</h1><p><b>Cliente:</b> ${escx(clientName(work.cliente_id))}<br><b>Equipamento:</b> ${escx(eq)}<br><b>Data:</b> ${escx(String(work.entrada||'').slice(0,10))}<br><b>Situação:</b> ${escx(work.situacao)}</p><h2>Defeito reclamado</h2><p>${escx(work.defeito_reclamado||'').replace(/\n/g,'<br>')}</p><h2>Defeito constatado</h2><p>${escx(work.defeito_constatado||'').replace(/\n/g,'<br>')}</p><h2>Descrição / proposta</h2><p>${escx(work.descricao_servico||'').replace(/\n/g,'<br>')}</p><h2>Serviços</h2><table><tr><th>Serviço</th><th>Qtd/H</th><th>Valor</th><th>Total</th></tr>${srvs}</table><h2>Materiais previstos</h2><table><tr><th>Código</th><th>Material</th><th>Qtd</th><th>Valor</th><th>Total</th></tr>${mats}</table><div class="total"><b>Total do orçamento: ${money(t.total)}</b></div><p class="muted">Documento de orçamento. Não representa baixa de estoque nem lançamento financeiro.</p>`);p.document.close();p.print();
 }
 printOS.onclick=()=>MODE==='budget'?budgetPrint():originalPrint?.call(printOS);
 shareOS.onclick=async()=>{if(MODE!=='budget')return originalShare?.call(shareOS);readBudgetForm();const txt=`JF Oficina — Orçamento ${work.numero_orcamento||''}\nCliente: ${clientName(work.cliente_id)}\nTotal: ${money(calcTotals().total)}\n${work.descricao_servico||work.defeito_reclamado||''}`;if(navigator.share){try{await navigator.share({title:`Orçamento ${work.numero_orcamento||''}`,text:txt});return}catch(e){}}try{await navigator.clipboard.writeText(txt);alert('Resumo do orçamento copiado.')}catch(e){alert(txt)}};
 function renderBudgetList(){
   ensureBudgets();const tb=document.getElementById('budgetTable');if(!tb)return;const q=document.getElementById('budgetSearch')?.value||'',st=document.getElementById('budgetStatus')?.value||'';
   const rows=budgets().filter(b=>{const eq=(b.equipamentos||[]).map(x=>{const e=equipBy(x.equipamento_id);return [equipName(x.equipamento_id),e?.marca,e?.modelo,e?.numero_serie,e?.serie,e?.patrimonio].join(' ')}).join(' ');const mats=(b.materiais||[]).map(m=>{const p=prodBy(m.produto_id);return [p&&productCode(p),p&&productMakerCode(p),p?.descricao,p?.marca,p?.aplicacao].join(' ')}).join(' ');const srvs=(b.servicos||[]).map(s=>serviceBy(s.servico_id)?.descricao||s.descricao||'').join(' ');return (!st||b.situacao===st)&&hit([b.numero_orcamento,clientName(b.cliente_id),b.solicitante,b.tecnico,b.local,b.defeito_reclamado,b.defeito_constatado,b.descricao_servico,b.laudo,b.recomendacao,eq,mats,srvs].join(' '),q)}).sort((a,b)=>num(b.numero_orcamento)-num(a.numero_orcamento));
   tb.innerHTML=rows.map(b=>{const eq=(b.equipamentos||[]).map(x=>equipName(x.equipamento_id)).filter(Boolean).join(', ');return `<tr class="click" onclick="openBudgetShared('${escx(b.id)}')"><td><b>${escx(b.numero_orcamento)}</b></td><td>${escx(String(b.entrada||'').slice(0,10))}</td><td><b>${escx(clientName(b.cliente_id))}</b><br><span class="muted">${escx(eq)}</span></td><td>${escx(b.situacao||'')}</td><td>${escx(String(b.validade||15))} dias</td><td>${money(b.total)}</td></tr>`}).join('')||'<tr><td colspan="6" class="muted">Nenhum orçamento encontrado.</td></tr>';
 }
 function setupBudgetView(){
   const old=document.getElementById('budgetDlg');if(old)old.remove();
   const nb=document.getElementById('newBudget');if(nb)nb.onclick=()=>openBudgetShared('');
   const bs=document.getElementById('budgetSearch');if(bs)bs.oninput=renderBudgetList;
   const st=document.getElementById('budgetStatus');if(st)st.onchange=renderBudgetList;
   renderBudgetList();
 }
 function makeFinder(select,kind,placeholder,rowsFn,onPick){
   if(!select||select.dataset.finder==='1')return;select.dataset.finder='1';select.classList.add('finderSelectHidden');
   const wrap=document.createElement('div');wrap.className='ctxFinder';const inp=document.createElement('input');inp.type='search';inp.placeholder=placeholder;inp.autocomplete='off';const box=document.createElement('div');box.className='ctxResults hidden';wrap.append(inp,box);select.parentNode.insertBefore(wrap,select);
   function selectedLabel(){const o=select.options[select.selectedIndex];return select.value&&o?o.textContent.trim():''}inp.value=selectedLabel();
   function draw(){const q=inp.value.trim();if(q.length<1){box.classList.add('hidden');return}const rows=rowsFn(q).slice(0,30);box.innerHTML=rows.map((r,i)=>`<div class="ctxItem" data-i="${i}"><b>${escx(r.title)}</b>${r.sub?`<div class="small muted">${escx(r.sub)}</div>`:''}</div>`).join('')||'<div class="ctxItem muted">Nenhum resultado.</div>';box.classList.remove('hidden');box.querySelectorAll('[data-i]').forEach(el=>el.onclick=()=>{const r=rows[Number(el.dataset.i)];select.value=String(r.id);inp.value=r.title;box.classList.add('hidden');select.dispatchEvent(new Event('change',{bubbles:true}));onPick?.(r)})}
   inp.oninput=draw;inp.onfocus=draw;inp.onkeydown=e=>{if(e.key==='Escape')box.classList.add('hidden')};
   select.addEventListener('change',()=>{inp.value=selectedLabel()});
 }
 function clientRows(q){return clients().filter(c=>hit([c.nome,c.matricula,c.codigo_cti,c.documento,c.cpf_cnpj,c.telefone,c.cidade,c.fazenda,c.endereco].join(' '),q)).map(c=>({id:c.id,title:c.nome,sub:[c.matricula||c.codigo_cti,c.cidade,c.fazenda].filter(Boolean).join(' · ')}));}
 function serviceRowsFn(q){return (S.servicos_catalogo||[]).filter(s=>s.ativo!==false&&hit([s.codigo,s.descricao,s.categoria,s.palavras_chave].join(' '),q)).map(s=>({id:s.id,title:s.descricao,sub:[s.codigo,s.categoria,money(s.valor)].filter(Boolean).join(' · ')}));}
 function productRowsFn(q){return activeProducts().filter(p=>p.ativo!==false&&hit([productCode(p),productMakerCode(p),p.codigo_barras,p.descricao,p.marca,p.categoria,p.aplicacao,p.codigos_equivalentes,p.localizacao].join(' '),q)).map(p=>({id:p.id,title:`${productCode(p)} · ${p.descricao}`,sub:[productMakerCode(p),p.marca,`Saldo ${num(p.estoque_atual)}`].filter(Boolean).join(' · ')}));}
 function equipRowsFn(q){return equips().filter(e=>String(equipClient(e))===String(work?.cliente_id||osClient.value)&&hit([equipName(e.id),e.marca,e.modelo,e.tipo,e.numero_serie,e.serie,e.patrimonio,e.ano,e.local,e.observacoes].join(' '),q)).map(e=>({id:e.id,title:equipName(e.id),sub:[e.marca,e.numero_serie||e.serie,e.patrimonio].filter(Boolean).join(' · ')}));}
 function installContextSearch(){
   makeFinder(osClient,'cliente','Pesquisar cliente por nome, código, documento, cidade ou fazenda…',clientRows,()=>{work.cliente_id=osClient.value;renderEquipments();setTimeout(installContextSearch,0)});
   document.querySelectorAll('.srvSel').forEach(s=>makeFinder(s,'service','Pesquisar serviço por nome, código, categoria ou palavra-chave…',serviceRowsFn));
   document.querySelectorAll('.matSel').forEach(s=>makeFinder(s,'product','Pesquisar peça por código JF, fabricante, GTIN, descrição, marca ou aplicação…',productRowsFn));
   document.querySelectorAll('.eqSel').forEach(s=>makeFinder(s,'equipment','Pesquisar equipamento por modelo, marca, série, chassi ou patrimônio…',equipRowsFn));
 }
 const originalRenderWork=renderWork;renderWork=function(){const r=originalRenderWork.apply(this,arguments);setTimeout(installContextSearch,0);return r};
 const originalRender=window.render;window.render=function(){const r=originalRender.apply(this,arguments);setTimeout(()=>{setupBudgetView();installContextSearch()},0);return r};
 const style=document.createElement('style');style.textContent=`.finderSelectHidden{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0!important}.ctxFinder{position:relative;min-width:220px;flex:1}.ctxFinder input{width:100%;margin:0}.ctxResults{position:absolute;left:0;right:0;top:calc(100% + 3px);z-index:350;background:#fff;border:1px solid #d9e0e6;border-radius:9px;box-shadow:0 12px 28px #0002;max-height:300px;overflow:auto;color:#17202a}.ctxItem{padding:9px 10px;border-bottom:1px solid #edf0f2;cursor:pointer}.ctxItem:hover{background:#f4f7f9}.budgetWarn{grid-column:1/-1;background:#fff3cd;border:1px solid #f2d27a;border-radius:9px;padding:10px;margin-bottom:10px;font-weight:600}body[data-doc-mode="budget"] #osDlg{border-top:4px solid #f6a609}body[data-doc-mode="budget"] #osTitle{color:#9a5b00}@media(max-width:800px){.ctxFinder{min-width:100%}}`;
 document.head.appendChild(style);
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',()=>{setupBudgetView();installContextSearch()});else{setupBudgetView();installContextSearch()}
})();