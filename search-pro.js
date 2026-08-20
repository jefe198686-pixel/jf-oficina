// JF Oficina v0.13.1 — busca completa em OS e busca global
(function(){
 const escp=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const toks=q=>norm(q).trim().split(/\s+/).filter(Boolean);
 const hit=(text,q)=>toks(q).every(t=>norm(text).includes(t));
 function osText(o){
   const eq=(o.equipamentos||legacyEquipLinks(o.id)).map(x=>{const z=equipBy(x.equipamento_id);return [equipName(x.equipamento_id),z?.marca,z?.modelo,z?.numero_serie,z?.serie,z?.patrimonio,z?.tipo].join(' ')}).join(' ');
   const mats=(o.materiais||legacyMaterials(o.id)).map(m=>{const p=prodBy(m.produto_id);return [p&&productCode(p),p&&productMakerCode(p),p?.descricao,p?.marca,p?.aplicacao,p?.codigos_equivalentes].join(' ')}).join(' ');
   const srvs=(o.servicos||legacyServices(o.id)).map(s=>{const x=serviceBy(s.servico_id);return [x?.descricao,s.descricao,x?.categoria,x?.palavras_chave,s.tecnico].join(' ')}).join(' ');
   return [o.numero_os,clientName(o.cliente_id),o.situacao,o.tecnico,o.solicitante,o.local,o.horimetro,o.controle,o.defeito_reclamado,o.defeito_constatado,o.descricao_servico,o.laudo,o.recomendacao,o.observacoes_internas,eq,mats,srvs].join(' ');
 }
 function rerenderOs(){const inp=document.getElementById('osSearch'),tb=document.getElementById('osTable');if(!inp||!tb)return;const q=inp.value.trim();if(!q)return;const st=document.getElementById('osStatus')?.value||'';const rows=orders().filter(o=>(!st||situation(o)===st)&&hit(osText(o),q)).sort((a,b)=>num(b.numero_os)-num(a.numero_os)).slice(0,500);tb.innerHTML=rows.map(o=>{const eq=(o.equipamentos||legacyEquipLinks(o.id)).map(x=>equipName(x.equipamento_id)).filter(Boolean).join(', ');return `<tr class="click" onclick="openOS('${escp(o.id)}')"><td><b>${escp(o.numero_os||o.id)}</b></td><td>${escp(o.data_entrada||String(o.entrada||'').slice(0,10))}</td><td><b>${escp(clientName(o.cliente_id))}</b><br><span class="muted">${escp(eq)}</span></td><td>${badge(situation(o))}</td><td>${money(o.total)}</td></tr>`}).join('')||'<tr><td colspan="5" class="muted">Nenhuma OS encontrada com todos os termos pesquisados.</td></tr>'}
 function installOs(){const inp=document.getElementById('osSearch');if(!inp||inp.dataset.full==='1')return;inp.dataset.full='1';inp.addEventListener('input',()=>setTimeout(rerenderOs,0));document.getElementById('osStatus')?.addEventListener('change',()=>setTimeout(rerenderOs,0))}
 function globalRows(q){const r=[],add=(type,title,sub,go)=>r.push({type,title,sub,go});
   for(const o of orders())if(hit(osText(o),q))add('OS','OS '+(o.numero_os||o.id),clientName(o.cliente_id)+' · '+(o.defeito_reclamado||o.defeito_constatado||''),()=>openOS(o.id));
   for(const c of clients())if(hit([c.nome,c.documento,c.cpf_cnpj,c.ie,c.telefone,c.email,c.cidade,c.fazenda,c.endereco,c.observacoes].join(' '),q))add('Cliente',c.nome,[c.cidade,c.fazenda].filter(Boolean).join(' · '),()=>openClient(c.id));
   for(const x of equips())if(hit([equipName(x.id),x.marca,x.modelo,x.numero_serie,x.serie,x.patrimonio,x.ano,x.tipo,x.local,clientName(equipClient(x)),x.observacoes].join(' '),q))add('Equipamento',equipName(x.id),clientName(equipClient(x))+' · '+(x.numero_serie||x.serie||''),()=>openEquip(x.id));
   for(const p of activeProducts())if(hit([productCode(p),productMakerCode(p),p.codigo_barras,p.descricao,p.categoria,p.localizacao,p.fornecedor,p.marca,p.aplicacao,p.codigos_equivalentes].join(' '),q))add('Peça',productCode(p)+' · '+p.descricao,'Saldo '+num(p.estoque_atual)+' '+(p.unidade||'')+' · '+(p.marca||''),()=>openProduct(p.id));
   for(const s of S.servicos_catalogo||[])if(hit([s.codigo,s.descricao,s.categoria,s.palavras_chave].join(' '),q))add('Serviço',s.descricao,[s.categoria,money(s.valor)].filter(Boolean).join(' · '),()=>{showView('admin')});
   for(const f of S.custom?.funcionarios||[])if(hit(JSON.stringify(f),q))add('Técnico',f.nome,[f.funcao,f.competencias].filter(Boolean).join(' · '),()=>showView('admin'));
   for(const f of S.custom?.fornecedores||[])if(hit(JSON.stringify(f),q))add('Fornecedor',f.nome,[f.cidade,f.marcas].filter(Boolean).join(' · '),()=>showView('admin'));
   return r.slice(0,50)
 }
 function drawGlobal(){const inp=document.getElementById('globalSearch'),box=document.getElementById('globalResults');if(!inp||!box)return;const q=inp.value.trim();if(q.length<2)return;const rows=globalRows(q);box.innerHTML=rows.map((x,i)=>`<div class="gitem" data-pro-i="${i}"><b>${escp(x.type)} · ${escp(x.title)}</b><div class="small muted">${escp(x.sub)}</div></div>`).join('')||'<div class="gitem muted">Nenhum resultado.</div>';box.classList.remove('hidden');box.querySelectorAll('[data-pro-i]').forEach(el=>el.onclick=()=>{box.classList.add('hidden');inp.value='';rows[Number(el.dataset.proI)].go()})}
 function installGlobal(){const inp=document.getElementById('globalSearch');if(!inp||inp.dataset.pro==='1')return;inp.dataset.pro='1';inp.addEventListener('input',()=>setTimeout(drawGlobal,1))}
 const old=window.render;window.render=function(){const x=old.apply(this,arguments);setTimeout(()=>{installOs();installGlobal();rerenderOs()},0);return x};
 addEventListener('DOMContentLoaded',()=>setTimeout(()=>{installOs();installGlobal()},150));
})();