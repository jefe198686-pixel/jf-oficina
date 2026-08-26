// JF Oficina v0.19.1 — pesquisas por campos com seleção visível e sem sobreposição
(function(){
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const match=(v,q)=>!norm(q)||norm(v).includes(norm(q));
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function rowClient(c){return {id:c.id,title:c.nome||'',sub:[c.matricula||c.codigo_cti,c.documento||c.cpf_cnpj,c.cidade,c.fazenda].filter(Boolean).join(' · ')}}
 function rowEquip(e){return {id:e.id,title:equipName(e.id),sub:[e.marca,e.modelo,e.numero_serie||e.serie,e.patrimonio].filter(Boolean).join(' · ')}}
 function rowProd(p){return {id:p.id,title:`${productCode(p)} · ${p.descricao||''}`,sub:[productMakerCode(p),p.marca,p.aplicacao,p.codigo_barras,`Saldo ${num(p.estoque_atual)}`].filter(Boolean).join(' · ')}}
 function rowSrv(s){return {id:s.id,title:s.descricao||'',sub:[s.codigo,s.categoria,s.palavras_chave,money(s.valor)].filter(Boolean).join(' · ')}}
 function defs(kind){
   if(kind==='client')return [
     {label:'Código / matrícula',ph:'Código, matrícula, CPF/CNPJ'},
     {label:'Nome / razão social',ph:'Nome ou parte do nome'},
     {label:'Local / referência',ph:'Cidade, fazenda, telefone'}];
   if(kind==='equipment')return [
     {label:'Código / patrimônio',ph:'Patrimônio ou identificação'},
     {label:'Marca / modelo',ph:'Marca, modelo ou tipo'},
     {label:'Série / chassi',ph:'Nº série, chassi, ano'}];
   if(kind==='product')return [
     {label:'Código',ph:'JF, fabricante ou GTIN'},
     {label:'Descrição',ph:'Nome ou descrição da peça'},
     {label:'Aplicação / marca',ph:'Marca, aplicação, categoria'}];
   return [
     {label:'Código',ph:'Código do serviço'},
     {label:'Descrição',ph:'Descrição do serviço'},
     {label:'Categoria / palavra-chave',ph:'Categoria ou palavra-chave'}];
 }
 function source(kind,vals){
   const [a,b,c]=vals.map(norm);
   if(kind==='client')return clients().filter(x=>match([x.matricula,x.codigo_cti,x.documento,x.cpf_cnpj,x.ie].join(' '),a)&&match(x.nome,b)&&match([x.cidade,x.fazenda,x.telefone,x.endereco].join(' '),c)).map(rowClient);
   if(kind==='equipment')return equips().filter(x=>String(equipClient(x))===String(work?.cliente_id||osClient?.value||'')&&match([x.patrimonio,x.id].join(' '),a)&&match([x.marca,x.modelo,x.tipo,equipName(x.id)].join(' '),b)&&match([x.numero_serie,x.serie,x.ano,x.local].join(' '),c)).map(rowEquip);
   if(kind==='product')return activeProducts().filter(x=>x.ativo!==false&&match([productCode(x),productMakerCode(x),x.codigo_barras,x.codigos_equivalentes].join(' '),a)&&match(x.descricao,b)&&match([x.marca,x.aplicacao,x.categoria,x.localizacao].join(' '),c)).map(rowProd);
   return (S.servicos_catalogo||[]).filter(x=>x.ativo!==false&&match(x.codigo,a)&&match(x.descricao,b)&&match([x.categoria,x.palavras_chave].join(' '),c)).map(rowSrv);
 }
 function enhance(wrap){
   if(!wrap||wrap.dataset.multi==='2')return;const sel=wrap.nextElementSibling;if(!sel||sel.tagName!=='SELECT')return;
   const kind=sel.id==='osClient'?'client':sel.classList.contains('eqSel')?'equipment':sel.classList.contains('matSel')?'product':sel.classList.contains('srvSel')?'service':'';if(!kind)return;
   wrap.dataset.multi='2';const old=wrap.querySelector('input[type="search"]');if(old)old.style.display='none';const box=wrap.querySelector('.ctxResults');
   const grid=document.createElement('div');grid.className='ctxMultiGrid'+(kind==='client'?' ctxClientGrid':'');const ds=defs(kind);
   grid.innerHTML=ds.map((d,i)=>`<label><span>${esc(d.label)}</span><input type="search" data-mf="${i}" placeholder="${esc(d.ph)}" autocomplete="off"></label>`).join('');
   const chosen=document.createElement('div');chosen.className='ctxChosen hidden';
   wrap.insertBefore(grid,box);wrap.insertBefore(chosen,box);
   const fields=[...grid.querySelectorAll('[data-mf]')];
   const isSingle=kind==='client';
   function selectedRow(){if(!sel.value)return null;if(kind==='client'){const x=clients().find(v=>String(v.id)===String(sel.value));return x?rowClient(x):null}if(kind==='equipment'){const x=equips().find(v=>String(v.id)===String(sel.value));return x?rowEquip(x):null}if(kind==='product'){const x=activeProducts().find(v=>String(v.id)===String(sel.value));return x?rowProd(x):null}const x=(S.servicos_catalogo||[]).find(v=>String(v.id)===String(sel.value));return x?rowSrv(x):null}
   function showChosen(){const r=selectedRow();if(!r){chosen.classList.add('hidden');if(isSingle)grid.classList.remove('hidden');return}chosen.innerHTML=`<div><b>${esc(r.title)}</b>${r.sub?`<div class="small muted">${esc(r.sub)}</div>`:''}</div>${isSingle?'<button type="button" class="ctxChange">Alterar</button>':''}`;chosen.classList.remove('hidden');if(isSingle){grid.classList.add('hidden');box.classList.add('hidden');chosen.querySelector('.ctxChange').onclick=()=>{grid.classList.remove('hidden');chosen.classList.add('hidden');fields[1]?.focus()}}}
   function draw(){const vals=fields.map(x=>x.value);if(vals.every(v=>!v.trim())){box.classList.add('hidden');return}const rows=source(kind,vals).slice(0,50);box.innerHTML=rows.map((r,i)=>`<div class="ctxItem" data-mfi="${i}"><b>${esc(r.title)}</b>${r.sub?`<div class="small muted">${esc(r.sub)}</div>`:''}</div>`).join('')||'<div class="ctxItem muted">Nenhum resultado com esses filtros.</div>';box.classList.remove('hidden');box.querySelectorAll('[data-mfi]').forEach(el=>el.onclick=()=>{const r=rows[Number(el.dataset.mfi)];sel.value=String(r.id);box.classList.add('hidden');fields.forEach(x=>x.value='');sel.dispatchEvent(new Event('change',{bubbles:true}));showChosen()})}
   fields.forEach(f=>{f.addEventListener('input',draw);f.addEventListener('focus',draw);f.addEventListener('keydown',e=>{if(e.key==='Escape')box.classList.add('hidden')})});
   sel.addEventListener('change',showChosen);
   showChosen();
 }
 function install(){document.querySelectorAll('.ctxFinder').forEach(enhance)}
 const mo=new MutationObserver(()=>setTimeout(install,0));addEventListener('DOMContentLoaded',()=>{install();mo.observe(document.body,{childList:true,subtree:true})});
 const style=document.createElement('style');style.textContent=`.ctxMultiGrid{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr));gap:7px;position:relative;z-index:2}.ctxClientGrid{grid-template-columns:1fr!important}.ctxMultiGrid label{display:block;font-size:11px;color:#5b6770}.ctxMultiGrid label span{display:block;margin:0 0 3px 2px;font-weight:600}.ctxMultiGrid input{width:100%;margin:0!important}.ctxFinder{min-width:min(720px,100%);position:relative}.ctxResults{top:auto!important;margin-top:6px;position:relative!important;left:auto!important;right:auto!important;max-height:280px}.ctxChosen{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#f5f7f8;border:1px solid #d9e0e6;border-radius:9px;padding:9px 11px;margin-top:6px}.ctxChosen.hidden,.ctxMultiGrid.hidden{display:none!important}.ctxChange{white-space:nowrap}.itemrow .ctxFinder{min-width:300px}.itemrow .ctxChosen{margin-top:4px}@media(max-width:850px){.ctxMultiGrid{grid-template-columns:1fr}.ctxFinder{min-width:100%}.ctxChosen{align-items:flex-start;flex-direction:column}}`;document.head.appendChild(style);
})();
