// JF Oficina v0.15.1 — pesquisas contextuais divididas por campos
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
     {key:'code',label:'Código / matrícula',ph:'Código, matrícula, CPF/CNPJ'},
     {key:'desc',label:'Nome / razão social',ph:'Nome ou parte do nome'},
     {key:'extra',label:'Local / referência',ph:'Cidade, fazenda, telefone'}];
   if(kind==='equipment')return [
     {key:'code',label:'Código / patrimônio',ph:'Patrimônio ou identificação'},
     {key:'desc',label:'Marca / modelo',ph:'Marca, modelo ou tipo'},
     {key:'extra',label:'Série / chassi',ph:'Nº série, chassi, ano'}];
   if(kind==='product')return [
     {key:'code',label:'Código',ph:'JF, fabricante ou GTIN'},
     {key:'desc',label:'Descrição',ph:'Nome ou descrição da peça'},
     {key:'extra',label:'Aplicação / marca',ph:'Marca, aplicação, categoria'}];
   return [
     {key:'code',label:'Código',ph:'Código do serviço'},
     {key:'desc',label:'Descrição',ph:'Descrição do serviço'},
     {key:'extra',label:'Categoria / palavra-chave',ph:'Categoria ou palavra-chave'}];
 }
 function source(kind,vals){
   const [a,b,c]=vals.map(norm);
   if(kind==='client')return clients().filter(x=>
     match([x.matricula,x.codigo_cti,x.documento,x.cpf_cnpj,x.ie].join(' '),a)&&
     match(x.nome,b)&&
     match([x.cidade,x.fazenda,x.telefone,x.endereco].join(' '),c)).map(rowClient);
   if(kind==='equipment')return equips().filter(x=>String(equipClient(x))===String(work?.cliente_id||osClient?.value||'')&&
     match([x.patrimonio,x.id].join(' '),a)&&
     match([x.marca,x.modelo,x.tipo,equipName(x.id)].join(' '),b)&&
     match([x.numero_serie,x.serie,x.ano,x.local].join(' '),c)).map(rowEquip);
   if(kind==='product')return activeProducts().filter(x=>x.ativo!==false&&
     match([productCode(x),productMakerCode(x),x.codigo_barras,x.codigos_equivalentes].join(' '),a)&&
     match(x.descricao,b)&&
     match([x.marca,x.aplicacao,x.categoria,x.localizacao].join(' '),c)).map(rowProd);
   return (S.servicos_catalogo||[]).filter(x=>x.ativo!==false&&
     match(x.codigo,a)&&match(x.descricao,b)&&match([x.categoria,x.palavras_chave].join(' '),c)).map(rowSrv);
 }
 function enhance(wrap){
   if(!wrap||wrap.dataset.multi==='1')return;const sel=wrap.nextElementSibling;if(!sel||sel.tagName!=='SELECT')return;
   const kind=sel.id==='osClient'?'client':sel.classList.contains('eqSel')?'equipment':sel.classList.contains('matSel')?'product':sel.classList.contains('srvSel')?'service':'';if(!kind)return;
   wrap.dataset.multi='1';const old=wrap.querySelector('input[type="search"]');if(old)old.style.display='none';const box=wrap.querySelector('.ctxResults');
   const grid=document.createElement('div');grid.className='ctxMultiGrid';const ds=defs(kind);
   grid.innerHTML=ds.map((d,i)=>`<label><span>${esc(d.label)}</span><input type="search" data-mf="${i}" placeholder="${esc(d.ph)}" autocomplete="off"></label>`).join('');
   wrap.insertBefore(grid,box);
   const fields=[...grid.querySelectorAll('[data-mf]')];
   function chosenLabel(){const o=sel.options[sel.selectedIndex];return sel.value&&o?o.textContent.trim():''}
   function draw(){const vals=fields.map(x=>x.value);if(vals.every(v=>!v.trim())){box.classList.add('hidden');return}const rows=source(kind,vals).slice(0,50);box.innerHTML=rows.map((r,i)=>`<div class="ctxItem" data-mfi="${i}"><b>${esc(r.title)}</b>${r.sub?`<div class="small muted">${esc(r.sub)}</div>`:''}</div>`).join('')||'<div class="ctxItem muted">Nenhum resultado com esses filtros.</div>';box.classList.remove('hidden');box.querySelectorAll('[data-mfi]').forEach(el=>el.onclick=()=>{const r=rows[Number(el.dataset.mfi)];sel.value=String(r.id);box.classList.add('hidden');fields.forEach(x=>x.value='');fields[1].value=r.title;sel.dispatchEvent(new Event('change',{bubbles:true}))})}
   fields.forEach(f=>{f.addEventListener('input',draw);f.addEventListener('focus',draw);f.addEventListener('keydown',e=>{if(e.key==='Escape')box.classList.add('hidden')})});
   sel.addEventListener('change',()=>{if(sel.value){fields.forEach(x=>x.value='');fields[1].value=chosenLabel()}});
   if(sel.value)fields[1].value=chosenLabel();
 }
 function install(){document.querySelectorAll('.ctxFinder').forEach(enhance)}
 const mo=new MutationObserver(()=>setTimeout(install,0));addEventListener('DOMContentLoaded',()=>{install();mo.observe(document.body,{childList:true,subtree:true})});
 const style=document.createElement('style');style.textContent=`.ctxMultiGrid{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr));gap:7px}.ctxMultiGrid label{display:block;font-size:11px;color:#5b6770}.ctxMultiGrid label span{display:block;margin:0 0 3px 2px;font-weight:600}.ctxMultiGrid input{width:100%;margin:0!important}.ctxFinder{min-width:min(720px,100%)}@media(max-width:850px){.ctxMultiGrid{grid-template-columns:1fr}.ctxFinder{min-width:100%}}`;document.head.appendChild(style);
})();
