const VERSION='0.9.8';
let S={clientes:[],equipamentos_clientes:[],produtos:[],servicos_catalogo:[],ordens_servico:[],os_equipamentos:[],os_servicos:[],os_outros_servicos:[],os_produtos:[],situacoes:[],custom:{}};
let work=null, installPrompt=null, swreg=null, reloading=false;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const num=v=>{let x=String(v??0).trim().replace(/\./g,'').replace(',','.');if(/^-?\d+(\.\d+)?$/.test(String(v??'')))x=String(v);return Number(x)||0};
const money=v=>num(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const nowLocal=()=>{let d=new Date(),z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`};
const dateOnly=()=>nowLocal().slice(0,10);
function uid(prefix){return prefix+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function deep(x){return JSON.parse(JSON.stringify(x))}
function normalize(){
 S.custom=S.custom||{}; for(const k of ['clientes','equipamentos','os','log','stockMoves','deletedProducts','dictionary','techLibrary']) S.custom[k]=S.custom[k]||[];S.custom.productSeq=Math.max(num(S.custom.productSeq),1746,...S.produtos.map(p=>num(productCode(p))));
 for(const k of ['clientes','equipamentos_clientes','produtos','servicos_catalogo','ordens_servico','os_equipamentos','os_servicos','os_outros_servicos','os_produtos','situacoes'])S[k]=S[k]||[];
}
function clients(){return [...S.custom.clientes,...S.clientes]}
function equips(){return [...S.custom.equipamentos,...S.equipamentos_clientes]}
function orders(){return [...S.custom.os,...S.ordens_servico]}
function byId(arr,id){return arr.find(x=>String(x.id)==String(id))}
function clientBy(id){return byId(clients(),id)}
function equipBy(id){return byId(equips(),id)}
function prodBy(id){return byId(S.produtos,id)}
function activeProducts(){let del=new Set(S.custom.deletedProducts.map(x=>String(x.product_id)));return S.produtos.filter(p=>!del.has(String(p.id)))}
function isLegacyProduct(p){return !!p && /^\d+$/.test(String(p.id||''))}
function productCode(p){return String(p?.codigo_jf || (isLegacyProduct(p)?p.id:(p?.codigo_interno||p?.id||'')))}
function productMakerCode(p){return String(p?.codigo_fabricante || (isLegacyProduct(p)?(p?.codigo_interno||''):'') || '')}
function nextClientCode(){let a=clients().map(c=>String(c.matricula||c.codigo_cti||c.id||'')).filter(x=>/^\d+$/.test(x)).map(Number);return String((a.length?Math.max(...a):0)+1)}
function serviceBy(id){return byId(S.servicos_catalogo,id)}
function osBy(id){return byId(orders(),id)}
function clientName(id){return clientBy(id)?.nome||''}
function equipClient(e){return e?.cliente_id??e?.id_cliente??e?.cliente}
function equipName(id){let e=equipBy(id);return e?(e.equipamento||e.modelo||e.descricao||[e.marca,e.tipo].filter(Boolean).join(' ')||`Equip. ${e.id}`):''}
function situation(o){
 if(o.situacao)return o.situacao;
 let s=byId(S.situacoes,o.situacao_id)?.descricao||'',u=s.toUpperCase();
 if(u.includes('AGUARD'))return 'Aguardando peças'; if(u.includes('CANCEL'))return 'Cancelada'; if(u.includes('CONCLU'))return 'Concluída'; if(u.includes('ABERT')||u.includes('ANDAMENTO'))return 'Em andamento'; return 'Finalizada'
}
function badge(s){let c=s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(' ')[0];return `<span class="badge ${c}">${esc(s)}</span>`}
function legacyEquipLinks(id){return S.os_equipamentos.filter(x=>String(x.os_id)==String(id)).map(x=>({equipamento_id:x.equipamento_cliente_id,principal:!!x.principal}))}
function legacyServices(id){return S.os_servicos.filter(x=>String(x.os_id)==String(id)).map(x=>({id:x.id,servico_id:x.servico_id,descricao:serviceBy(x.servico_id)?.descricao||'',quantidade:num(x.quantidade),valor:num(x.valor_unitario),desconto:num(x.desconto),acrescimo:num(x.acrescimo),tecnico:'',total:num(x.total)}))}
function legacyOthers(id){return S.os_outros_servicos.filter(x=>String(x.os_id)==String(id)).map(x=>({id:x.id,nome:x.nome||'',quantidade:num(x.quantidade),valor:num(x.valor_unitario),desconto:num(x.desconto),acrescimo:num(x.acrescimo),origem:'',destino:'',km:0,total:num(x.total)}))}
function legacyMaterials(id){return S.os_produtos.filter(x=>String(x.os_id)==String(id)).map(x=>({id:x.id,produto_id:x.produto_id,quantidade:num(x.quantidade),valor:num(x.valor_unitario),desconto:num(x.desconto),acrescimo:num(x.acrescimo),origem:'Oficina',total:num(x.total)}))}
function log(entity,id,message,details=''){S.custom.log.unshift({id:uid('L'),entity,entity_id:id,at:new Date().toISOString(),message,details})}
function auditFor(o){return [...(o.audit||[]),...S.custom.log.filter(x=>x.entity==='os'&&String(x.entity_id)==String(o.id))].sort((a,b)=>String(b.at).localeCompare(String(a.at)))}

function openDB(){return new Promise((ok,err)=>{let r=indexedDB.open('jf-oficina',2);r.onupgradeneeded=()=>{let d=r.result;if(!d.objectStoreNames.contains('s'))d.createObjectStore('s')};r.onsuccess=()=>ok(r.result);r.onerror=()=>err(r.error)})}
async function loadDB(){let d=await openDB();return new Promise(ok=>{let r=d.transaction('s').objectStore('s').get('a');r.onsuccess=()=>ok(r.result)})}
async function saveDB(){let d=await openDB();return new Promise(ok=>{let t=d.transaction('s','readwrite');t.objectStore('s').put(S,'a');t.oncomplete=ok})}

function render(){
 normalize(); let os=orders(), low=S.produtos.filter(p=>num(p.estoque_minimo)>0&&num(p.estoque_atual)<num(p.estoque_minimo));
 kOs.textContent=os.length;kAnd.textContent=os.filter(o=>situation(o)==='Em andamento').length;kWait.textContent=os.filter(o=>situation(o)==='Aguardando peças').length;kCli.textContent=clients().length;kLow.textContent=low.length;
 let att=os.filter(o=>['Em andamento','Aguardando peças'].includes(situation(o))).sort((a,b)=>String(b.data_entrada||'').localeCompare(String(a.data_entrada||''))).slice(0,7);
 attention.innerHTML=att.length?att.map(o=>`<div class="audit click" onclick="openOS('${esc(o.id)}')"><b>OS ${esc(o.numero_os||o.id)}</b> · ${badge(situation(o))}<br>${esc(clientName(o.cliente_id))} <span class="muted">${esc((o.defeito_reclamado||'').slice(0,80))}</span></div>`).join(''):'<p class="muted">Nenhuma OS pendente.</p>';
 recent.innerHTML=os.slice().sort((a,b)=>num(b.numero_os)-num(a.numero_os)).slice(0,7).map(o=>`<div class="audit click" onclick="openOS('${esc(o.id)}')"><b>OS ${esc(o.numero_os||o.id)}</b> · ${esc(clientName(o.cliente_id))}<br><span class="muted">${esc(o.data_entrada||'')} · ${money(o.total)}</span></div>`).join('');
 let q=osSearch.value.toLowerCase(),st=osStatus.value;
 osTable.innerHTML=os.filter(o=>(!st||situation(o)===st)&&[o.numero_os,clientName(o.cliente_id),...(legacyEquipLinks(o.id).map(x=>equipName(x.equipamento_id))),o.defeito_reclamado].join(' ').toLowerCase().includes(q)).sort((a,b)=>num(b.numero_os)-num(a.numero_os)).slice(0,500).map(o=>{
   let eq=(o.equipamentos||legacyEquipLinks(o.id)).map(x=>equipName(x.equipamento_id)).filter(Boolean).join(', ');
   return `<tr class="click" onclick="openOS('${esc(o.id)}')"><td><b>${esc(o.numero_os||o.id)}</b></td><td>${esc(o.data_entrada||'')}</td><td><b>${esc(clientName(o.cliente_id))}</b><br><span class="muted">${esc(eq)}</span></td><td>${badge(situation(o))}</td><td>${money(o.total)}</td></tr>`}).join('');
 q=clientSearch.value.toLowerCase();
 clientTable.innerHTML=clients().filter(c=>[c.nome,c.documento,c.cpf_cnpj,c.cidade].join(' ').toLowerCase().includes(q)).slice(0,500).map(c=>{
   let es=equips().filter(e=>String(equipClient(e))===String(c.id)), co=os.filter(o=>String(o.cliente_id)===String(c.id)), last=co.slice().sort((a,b)=>num(b.numero_os)-num(a.numero_os))[0];
   return `<tr class="click" onclick="openClient('${esc(c.id)}')"><td><b>${esc(c.nome)}</b><br><span class="muted">${esc(c.cidade||'')}</span></td><td>${es.length}<br><span class="muted">${esc(es.slice(0,3).map(e=>equipName(e.id)).join(', '))}</span></td><td>${co.length}</td><td>${last?`OS ${esc(last.numero_os||last.id)} · ${esc(last.data_entrada||'')}`:''}</td></tr>`}).join('');
 let fpc=filterProdCode.value.trim().toLowerCase(),fic=filterInternalCode.value.trim().toLowerCase(),fgt=filterGTIN.value.trim().toLowerCase(),fn=filterName.value.trim().toLowerCase(),fcat=filterCategory.value.trim().toLowerCase(),floc=filterLocation.value.trim().toLowerCase();
 stockTable.innerHTML=activeProducts().filter(p=>{
   let gt=(p.codigo_barras||'SEM GTIN').toLowerCase();
   return (!fpc||productCode(p).toLowerCase().includes(fpc))&&(!fic||productMakerCode(p).toLowerCase().includes(fic))&&(!fgt||gt.includes(fgt))&&(!fn||(p.descricao||'').toLowerCase().includes(fn))&&(!fcat||(p.categoria||'').toLowerCase().includes(fcat))&&(!floc||(p.localizacao||'').toLowerCase().includes(floc))&&(stockFilter.value!=='low'||(num(p.estoque_minimo)>0&&num(p.estoque_atual)<num(p.estoque_minimo)))
 }).slice(0,900).map(p=>`<tr class="click" onclick="openProduct('${esc(p.id)}')"><td>${p.imagem?`<img class="prodImg" src="${p.imagem}">`:''}</td><td><b>${esc(productCode(p))}</b><br><span class="muted">${esc(productMakerCode(p))}</span></td><td><b>${esc(p.descricao)}</b><br><span class="muted">${esc(p.codigo_barras||'SEM GTIN')}</span></td><td>${num(p.estoque_atual)}</td><td>${num(p.estoque_minimo)}</td><td>${num(p.estoque_maximo)}</td><td>${money(p.valor_venda)}</td><td>${esc(p.categoria||'')}</td><td>${esc(p.localizacao||'')}</td></tr>`).join('');
}
