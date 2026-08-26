// JF Oficina v0.19.2 — ordenação flexível da lista de clientes
(function(){
 const n=v=>Number(String(v??'').replace(/\D/g,''))||0;
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function clientCode(c){return c?.matricula||c?.codigo_cti||c?.id||''}
 function clientLastOS(c,os){return os.filter(o=>String(o.cliente_id)===String(c.id)).sort((a,b)=>n(b.numero_os||b.id)-n(a.numero_os||a.id))[0]||null}
 function ensureControl(){
  if(document.getElementById('clientSort'))return;
  const q=document.getElementById('clientSearch');if(!q)return;
  const s=document.createElement('select');s.id='clientSort';s.title='Ordenar clientes';s.innerHTML=`
   <option value="name_asc">Nome A → Z</option>
   <option value="name_desc">Nome Z → A</option>
   <option value="code_asc">Nº cadastro: menor → maior</option>
   <option value="code_desc">Nº cadastro: maior → menor</option>
   <option value="recent">Último atendimento mais recente</option>
   <option value="os_desc">Mais atendimentos / OS</option>
   <option value="equip_desc">Mais equipamentos</option>`;
  s.value=localStorage.getItem('jf-client-sort')||'name_asc';
  s.onchange=()=>{localStorage.setItem('jf-client-sort',s.value);renderSorted()};
  q.insertAdjacentElement('afterend',s);
 }
 function renderSorted(){
  const table=document.getElementById('clientTable');if(!table||typeof clients!=='function'||typeof orders!=='function')return;
  ensureControl();
  const q=(document.getElementById('clientSearch')?.value||'').toLowerCase();
  const mode=document.getElementById('clientSort')?.value||'name_asc';
  const os=orders(), allEq=typeof equips==='function'?equips():[];
  let rows=clients().filter(c=>[c.nome,c.documento,c.cpf_cnpj,c.cidade,clientCode(c)].join(' ').toLowerCase().includes(q));
  const stats=new Map(rows.map(c=>{const co=os.filter(o=>String(o.cliente_id)===String(c.id));const es=allEq.filter(e=>String(equipClient(e))===String(c.id));const last=clientLastOS(c,os);return [String(c.id),{co,es,last}]}));
  rows.sort((a,b)=>{
   const A=stats.get(String(a.id)),B=stats.get(String(b.id));
   if(mode==='name_desc')return norm(b.nome).localeCompare(norm(a.nome),'pt-BR');
   if(mode==='code_asc')return n(clientCode(a))-n(clientCode(b))||norm(a.nome).localeCompare(norm(b.nome),'pt-BR');
   if(mode==='code_desc')return n(clientCode(b))-n(clientCode(a))||norm(a.nome).localeCompare(norm(b.nome),'pt-BR');
   if(mode==='recent')return n(B.last?.numero_os||B.last?.id)-n(A.last?.numero_os||A.last?.id)||norm(a.nome).localeCompare(norm(b.nome),'pt-BR');
   if(mode==='os_desc')return B.co.length-A.co.length||norm(a.nome).localeCompare(norm(b.nome),'pt-BR');
   if(mode==='equip_desc')return B.es.length-A.es.length||norm(a.nome).localeCompare(norm(b.nome),'pt-BR');
   return norm(a.nome).localeCompare(norm(b.nome),'pt-BR');
  });
  table.innerHTML=rows.slice(0,500).map(c=>{const st=stats.get(String(c.id)),last=st.last;return `<tr class="click" onclick="openClient('${esc(c.id)}')"><td><b>${esc(c.nome)}</b><br><span class="muted">Cadastro ${esc(clientCode(c))}${c.cidade?' · '+esc(c.cidade):''}</span></td><td>${st.es.length}<br><span class="muted">${esc(st.es.slice(0,3).map(e=>equipName(e.id)).join(', '))}</span></td><td>${st.co.length}</td><td>${last?`OS ${esc(last.numero_os||last.id)} · ${esc(last.data_entrada||last.entrada||'')}`:''}</td></tr>`}).join('');
 }
 function install(){ensureControl();renderSorted();const q=document.getElementById('clientSearch');if(q&&!q.dataset.sortHook){q.dataset.sortHook='1';q.addEventListener('input',()=>setTimeout(renderSorted,0))}}
 addEventListener('DOMContentLoaded',()=>setTimeout(install,1000));setTimeout(install,1800);
 const oldRender=window.render;if(typeof oldRender==='function'&&!oldRender.__clientSort){const wrapped=function(){oldRender.apply(this,arguments);setTimeout(renderSorted,0)};wrapped.__clientSort=true;window.render=wrapped}
 window.JFClientSorting={render:renderSorted};
})();