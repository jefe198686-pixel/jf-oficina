// JF Oficina v0.20.2 — drill-down em todos os relatórios gerenciais
(function(){
  'use strict';
  const txt=v=>String(v??'').trim();
  const low=v=>txt(v).toLocaleLowerCase('pt-BR');
  const esc2=v=>txt(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const n=v=>Number(String(v??0).replace(/\./g,'').replace(',','.'))||0;
  const fmt=v=>n(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const osEq=o=>o?.equipamentos||legacyEquipLinks(o?.id);
  const osMat=o=>o?.materiais||legacyMaterials(o?.id);
  const osSrv=o=>o?.servicos||legacyServices(o?.id);
  const reportTitle=()=>low(document.getElementById('jrTitle')?.textContent||'');
  const allOrders=()=>orders();
  const byNum=v=>allOrders().find(o=>txt(o.numero_os||o.id)===txt(v));
  const findClient=name=>clients().find(c=>low(c.nome)===low(name))||clients().find(c=>low(c.nome).includes(low(name))||low(name).includes(low(c.nome)));
  const findEquipByLabel=(clientNameValue,label)=>{
    const c=findClient(clientNameValue);let list=equips();if(c)list=list.filter(e=>String(equipClient(e))===String(c.id));
    return list.find(e=>low(equipName(e.id))===low(label))||list.find(e=>low(label).includes(low(equipName(e.id)))||low(equipName(e.id)).includes(low(label)));
  };
  const findProduct=(code,desc)=>activeProducts().find(p=>txt(productCode(p))===txt(code))||activeProducts().find(p=>low(p.descricao)===low(desc));

  function ensureDlg(){
    if(document.getElementById('jfDrillDlg'))return;
    const d=document.createElement('dialog');d.id='jfDrillDlg';d.className='osmodal';
    d.innerHTML=`<div class="dhead"><div><b id="jfDrillTitle">Detalhes</b><div id="jfDrillSub" class="small">Navegação do relatório</div></div><button type="button" id="jfDrillClose">✕</button></div><div class="dbody"><div id="jfDrillBody"></div></div>`;
    document.body.appendChild(d);document.getElementById('jfDrillClose').onclick=()=>d.close();
  }
  function show(title,sub,html){ensureDlg();jfDrillTitle.textContent=title;jfDrillSub.textContent=sub||'Navegação do relatório';jfDrillBody.innerHTML=html;jfDrillDlg.showModal();}
  function btn(label,action,cls=''){return `<button type="button" class="${cls}" data-drill-action="${esc2(action)}">${esc2(label)}</button>`}
  function orderCard(o){
    const eq=osEq(o).map(x=>equipName(x.equipamento_id)).filter(Boolean).join(', ');
    return `<div class="audit" style="margin-bottom:8px"><div class="toolbar"><div><b>OS ${esc2(o.numero_os||o.id)}</b> · ${esc2(String(o.entrada||o.data_entrada||'').slice(0,10))}<br><span class="muted">${esc2(clientName(o.cliente_id))}${eq?' · '+esc2(eq):''}</span></div>${btn('Abrir OS','os:'+txt(o.id),'primary')}</div><div class="small" style="margin-top:6px">${esc2(o.defeito_constatado||o.defeito_reclamado||'')}</div><div><b>${fmt(o.total)}</b></div></div>`;
  }
  function orderList(title,list,sub=''){
    show(title,sub||`${list.length} OS encontrada(s)`,list.length?list.sort((a,b)=>n(b.numero_os)-n(a.numero_os)).map(orderCard).join(''):'<p class="muted">Nenhuma OS relacionada.</p>');
  }
  function clientDrill(c){
    const eqs=equips().filter(e=>String(equipClient(e))===String(c.id));
    const os=allOrders().filter(o=>String(o.cliente_id)===String(c.id));
    const eqhtml=eqs.length?eqs.map(e=>`<div class="audit"><div class="toolbar"><div><b>${esc2(equipName(e.id))}</b><br><span class="muted">${esc2(e.numero_serie||e.serie||'')} ${e.patrimonio?'· '+esc2(e.patrimonio):''}</span></div>${btn('Ver histórico','equip:'+txt(e.id))}</div></div>`).join(''):'<p class="muted">Nenhum equipamento cadastrado.</p>';
    show(c.nome||'Cliente',`${os.length} OS · ${eqs.length} equipamento(s)`,`<div class="toolbar">${btn('Abrir cadastro do cliente','client:'+txt(c.id),'primary')}${btn('Todas as OS','clientos:'+txt(c.id))}</div><div class="section"><h3>Equipamentos</h3>${eqhtml}</div><div class="section"><h3>Últimas OS</h3>${os.sort((a,b)=>n(b.numero_os)-n(a.numero_os)).slice(0,10).map(orderCard).join('')||'<p class="muted">Sem OS.</p>'}</div>`);
  }
  function equipDrill(e){
    const os=allOrders().filter(o=>osEq(o).some(x=>String(x.equipamento_id)===String(e.id)));
    orderList(equipName(e.id)||'Equipamento',os,`${clientName(equipClient(e))} · ${e.numero_serie||e.serie||'Sem série'}`);
  }
  function productDrill(p){
    const related=[];for(const o of allOrders())if(osMat(o).some(m=>String(m.produto_id)===String(p.id)))related.push(o);
    show(`${productCode(p)} · ${p.descricao||'Produto'}`,`${related.length} OS relacionada(s)`,`<div class="toolbar">${btn('Abrir produto','product:'+txt(p.id),'primary')}</div><div class="section"><div class="grid3"><div><b>Saldo</b><br>${n(p.estoque_atual)}</div><div><b>Locação</b><br>${esc2(p.localizacao||'')}</div><div><b>Venda</b><br>${fmt(p.valor_venda)}</div></div></div><div class="section"><h3>OS que utilizaram este produto</h3>${related.map(orderCard).join('')||'<p class="muted">Nenhuma OS relacionada.</p>'}</div>`);
  }
  function technicianDrill(name){
    const list=allOrders().filter(o=>low(o.tecnico)===low(name)||osSrv(o).some(s=>low(s.tecnico)===low(name)));
    orderList(`Técnico: ${name}`,list,'Produção e OS relacionadas');
  }
  function serviceDrill(name){
    const list=allOrders().filter(o=>osSrv(o).some(s=>low(serviceBy(s.servico_id)?.descricao||s.descricao||'').includes(low(name))));
    orderList(`Serviço: ${name}`,list,'OS em que o serviço foi lançado');
  }
  function failureDrill(term){
    const list=allOrders().filter(o=>low(o.defeito_constatado||o.defeito_reclamado||'').includes(low(term))||low(term).includes(low(o.defeito_constatado||'')));
    orderList(`Falha: ${term}`,list,'Ocorrências relacionadas');
  }
  function supplierDrill(name){
    const s=(S.custom?.fornecedores||[]).find(x=>low(x.nome)===low(name));if(!s){show(name,'Fornecedor','<p class="muted">Cadastro não localizado.</p>');return}
    const products=activeProducts().filter(p=>low(p.fornecedor).includes(low(s.nome))||low(p.marca).split(/[,;/]/).some(x=>low(s.marcas).includes(x.trim())&&x.trim()));
    show(s.nome,'Fornecedor',`<div class="section"><div class="grid2"><div><b>Contato</b><br>${esc2(s.contato||'')}</div><div><b>Telefone</b><br>${esc2(s.telefone||'')}</div><div><b>Cidade</b><br>${esc2(s.cidade||'')}</div><div><b>Condição</b><br>${esc2(s.pagamento||'')}</div></div></div><div class="section"><h3>Produtos relacionados</h3>${products.slice(0,50).map(p=>`<div class="audit"><div class="toolbar"><div><b>${esc2(productCode(p))} · ${esc2(p.descricao||'')}</b></div>${btn('Abrir','product:'+txt(p.id))}</div></div>`).join('')||'<p class="muted">Nenhum produto relacionado pelo cadastro atual.</p>'}</div>`);
  }
  function movementDrill(cells){
    const code=cells[2],p=findProduct(code,cells[1]),o=cells[5]?byNum(cells[5]):null;
    show('Movimentação de estoque',`${cells[0]||''} · ${cells[3]||''}`,`<div class="section"><div class="grid3"><div><b>Produto</b><br>${esc2(cells[1]||'')}</div><div><b>Código</b><br>${esc2(code||'')}</div><div><b>Movimento</b><br>${esc2(cells[3]||'')}</div><div><b>Origem</b><br>${esc2(cells[4]||'')}</div><div><b>OS</b><br>${esc2(cells[5]||'')}</div></div><div class="toolbar" style="margin-top:10px">${p?btn('Abrir produto','product:'+txt(p.id),'primary'):''}${o?btn('Abrir OS','os:'+txt(o.id)):''}</div></div>`);
  }

  function drillRow(tr){
    const cells=[...tr.querySelectorAll('td')].map(td=>txt(td.textContent));if(!cells.length)return;
    const title=reportTitle();
    if(title.includes('os detalhadas')||title.includes('resumo financeiro')){const o=byNum(cells[0]);if(o)openOS(o.id);return}
    if(title.includes('histórico por cliente')){const c=findClient(cells[0]);if(c)clientDrill(c);return}
    if(title.includes('histórico por equipamento')){const e=findEquipByLabel(cells[0],cells[1]);if(e)equipDrill(e);return}
    if(title.includes('consumo de peças')){const p=findProduct(cells[0],cells[1]);if(p)productDrill(p);return}
    if(title.includes('inventário financeiro')||title.includes('estoque baixo')){const p=findProduct(cells[0],cells[1]);if(p)openProduct(p.id);return}
    if(title.includes('movimentações')){movementDrill(cells);return}
    if(title.includes('produção por técnico')){technicianDrill(cells[0]);return}
    if(title.includes('serviços executados')){serviceDrill(cells[0]);return}
    if(title.includes('fornecedores')){supplierDrill(cells[0]);return}
    if(title.includes('falhas recorrentes')){failureDrill(cells[0]);return}
  }
  function bindRows(){
    const out=document.getElementById('jrOut');if(!out)return;
    out.querySelectorAll('tbody tr').forEach(tr=>{if(tr.dataset.jfDrill)return;tr.dataset.jfDrill='1';tr.classList.add('click');tr.title='Clique para abrir os detalhes';tr.addEventListener('click',()=>drillRow(tr));});
  }
  function install(){ensureDlg();const out=document.getElementById('jrOut');if(out){new MutationObserver(bindRows).observe(out,{childList:true,subtree:true});bindRows()}}
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-drill-action]');if(!b)return;e.preventDefault();e.stopPropagation();const [kind,...rest]=b.dataset.drillAction.split(':'),id=rest.join(':');
    if(kind==='os'){jfDrillDlg.close();openOS(id)}
    else if(kind==='client'){jfDrillDlg.close();openClient(id)}
    else if(kind==='clientos'){const c=clientBy(id);orderList(c?.nome||'Cliente',allOrders().filter(o=>String(o.cliente_id)===String(id)),'Todas as OS do cliente')}
    else if(kind==='equip'){const e=equipBy(id);if(e)equipDrill(e)}
    else if(kind==='product'){jfDrillDlg.close();openProduct(id)}
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  new MutationObserver(()=>{if(document.getElementById('jrOut'))install()}).observe(document.documentElement,{childList:true,subtree:true});
})();
