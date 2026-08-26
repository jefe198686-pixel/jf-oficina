// JF Oficina v0.19.3 — filtros e ordenação avançada do estoque
(function(){
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const n=v=>Number(String(v??'').replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',','.'))||0;
 let applying=false, observer=null;
 function uniq(arr){return [...new Set(arr.map(x=>String(x||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR',{sensitivity:'base'}))}
 function addOption(sel,val,label=val){const o=document.createElement('option');o.value=val;o.textContent=label;sel.appendChild(o)}
 function build(){
  const stock=document.getElementById('stock'), base=document.querySelector('#stock .section');
  if(!stock||!base||document.getElementById('stockAdvancedFilters'))return;
  const wrap=document.createElement('div');wrap.id='stockAdvancedFilters';wrap.className='stockAdvancedFilters';
  wrap.innerHTML=`<div class="stockFilterGrid">
   <label>Ordem<select id="stockSort"><option value="name_az">Descrição A → Z</option><option value="name_za">Descrição Z → A</option><option value="code_asc">Código menor → maior</option><option value="code_desc">Código maior → menor</option><option value="qty_asc">Saldo menor → maior</option><option value="qty_desc">Saldo maior → menor</option><option value="price_asc">Venda menor → maior</option><option value="price_desc">Venda maior → menor</option><option value="category">Categoria A → Z</option><option value="location">Locação A → Z</option></select></label>
   <label>Inicial<select id="stockInitial"><option value="">Todas as letras</option></select></label>
   <label>Categoria<select id="stockCategorySelect"><option value="">Todas as categorias</option></select></label>
   <label>Locação<select id="stockLocationSelect"><option value="">Todas as locações</option></select></label>
   <label>Situação do estoque<select id="stockSituation"><option value="">Todos</option><option value="low">Abaixo do mínimo</option><option value="zero">Saldo zero</option><option value="negative">Saldo negativo</option><option value="positive">Com saldo</option><option value="above">Acima do máximo</option></select></label>
  </div>`;
  const oldToolbar=base.querySelector('.toolbar:last-child');base.insertBefore(wrap,oldToolbar||null);
  const initial=document.getElementById('stockInitial');'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(x=>addOption(initial,x,x));
  refreshLists();
  ['stockSort','stockInitial','stockCategorySelect','stockLocationSelect','stockSituation'].forEach(id=>document.getElementById(id).addEventListener('change',()=>{
    if(id==='stockCategorySelect'){const f=document.getElementById('filterCategory');if(f)f.value=document.getElementById(id).value}
    if(id==='stockLocationSelect'){const f=document.getElementById('filterLocation');if(f)f.value=document.getElementById(id).value}
    if(id==='stockSituation'){const sf=document.getElementById('stockFilter');if(sf)sf.value=document.getElementById(id).value==='low'?'low':''}
    if(typeof render==='function')render();setTimeout(apply,0);
  }));
  const clear=document.getElementById('clearProdFilters');if(clear)clear.addEventListener('click',()=>setTimeout(()=>{document.getElementById('stockInitial').value='';document.getElementById('stockCategorySelect').value='';document.getElementById('stockLocationSelect').value='';document.getElementById('stockSituation').value='';document.getElementById('stockSort').value='name_az';apply()},20));
  const style=document.createElement('style');style.textContent=`.stockAdvancedFilters{margin:8px 0 4px;padding-top:8px;border-top:1px solid #d9e0da}.stockFilterGrid{display:grid;grid-template-columns:repeat(5,minmax(145px,1fr));gap:8px}.stockFilterGrid label{font-size:11px;font-weight:800}.stockFilterGrid select{margin-top:3px}@media(max-width:1000px){.stockFilterGrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){.stockFilterGrid{grid-template-columns:1fr}}`;document.head.appendChild(style);
  watch();setTimeout(apply,50);
 }
 function refreshLists(){
  const cats=uniq((typeof activeProducts==='function'?activeProducts():[]).map(p=>p.categoria));
  const locs=uniq((typeof activeProducts==='function'?activeProducts():[]).map(p=>p.localizacao));
  const cs=document.getElementById('stockCategorySelect'),ls=document.getElementById('stockLocationSelect');if(!cs||!ls)return;
  const cv=cs.value,lv=ls.value;cs.innerHTML='<option value="">Todas as categorias</option>';ls.innerHTML='<option value="">Todas as locações</option>';cats.forEach(x=>addOption(cs,x));locs.forEach(x=>addOption(ls,x));cs.value=cv;ls.value=lv;
 }
 function apply(){
  if(applying)return;const tbody=document.getElementById('stockTable');if(!tbody)return;applying=true;
  try{
   refreshLists();const initial=document.getElementById('stockInitial')?.value||'',sit=document.getElementById('stockSituation')?.value||'',sort=document.getElementById('stockSort')?.value||'name_az';
   let rows=[...tbody.querySelectorAll('tr')];
   rows.forEach(r=>{
    const cells=r.children, name=(cells[2]?.querySelector('b')?.textContent||cells[2]?.textContent||'').trim(),qty=n(cells[3]?.textContent),min=n(cells[4]?.textContent),max=n(cells[5]?.textContent);
    let ok=!initial||norm(name).startsWith(norm(initial));
    if(sit==='zero')ok=ok&&qty===0;else if(sit==='negative')ok=ok&&qty<0;else if(sit==='positive')ok=ok&&qty>0;else if(sit==='above')ok=ok&&max>0&&qty>max;else if(sit==='low')ok=ok&&min>0&&qty<min;
    r.style.display=ok?'':'none';
   });
   const key=r=>{const c=r.children;switch(sort){case'name_az':case'name_za':return norm(c[2]?.querySelector('b')?.textContent||c[2]?.textContent);case'code_asc':case'code_desc':return n(c[1]?.querySelector('b')?.textContent||c[1]?.textContent);case'qty_asc':case'qty_desc':return n(c[3]?.textContent);case'price_asc':case'price_desc':return n(c[6]?.textContent);case'category':return norm(c[7]?.textContent);case'location':return norm(c[8]?.textContent);default:return''}};
   rows.sort((a,b)=>{const A=key(a),B=key(b);let v=typeof A==='number'&&typeof B==='number'?A-B:String(A).localeCompare(String(B),'pt-BR',{numeric:true,sensitivity:'base'});return ['name_za','code_desc','qty_desc','price_desc'].includes(sort)?-v:v});
   if(observer)observer.disconnect();rows.forEach(r=>tbody.appendChild(r));
  }finally{applying=false;if(observer){observer.observe(document.getElementById('stockTable'),{childList:true})}}
 }
 function watch(){const tbody=document.getElementById('stockTable');if(!tbody)return;observer=new MutationObserver(()=>setTimeout(apply,0));observer.observe(tbody,{childList:true})}
 addEventListener('DOMContentLoaded',()=>setTimeout(build,1100));setTimeout(build,2200);window.JFStockAdvancedFilters={build,apply,refreshLists};
})();