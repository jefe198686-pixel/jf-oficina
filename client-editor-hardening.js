// JF Oficina v0.19.5 — edição de clientes estável, sem herdar campos do cadastro anterior
(function(){
 const ids=['clientId','clientCode','clientName','clientDoc','clientIE','clientPhone','clientEmail','clientCity','clientFarm','clientAddress','clientBirth','clientObs'];
 const by=id=>document.getElementById(id);
 const txt=v=>String(v??'').normalize('NFC');
 function valuesFor(c){return {
  clientId:c?.id||'',clientCode:c?(c.matricula||c.codigo_cti||c.id):nextClientCode(),clientName:txt(c?.nome||''),
  clientDoc:txt(c?.documento||c?.cpf_cnpj||''),clientIE:txt(c?.ie||c?.inscricao_estadual||''),clientPhone:txt(c?.telefone||c?.fone||''),
  clientEmail:txt(c?.email||''),clientCity:txt(c?.cidade||''),clientFarm:txt(c?.fazenda||''),clientAddress:txt(c?.endereco||c?.logradouro||''),
  clientBirth:txt(c?.data_nascimento||c?.data_abertura||''),clientObs:txt(c?.observacoes||'')
 }}
 function apply(vals){ids.forEach(id=>{const el=by(id);if(el)el.value=vals[id]??''})}
 function clear(){const form=by('clientForm');if(form)form.reset();apply(Object.fromEntries(ids.map(id=>[id,''])))}
 function hardenAutofill(){
  const f=by('clientForm');if(!f)return;f.setAttribute('autocomplete','off');
  ids.forEach((id,i)=>{const el=by(id);if(!el)return;el.setAttribute('autocomplete','off');el.setAttribute('data-lpignore','true');el.setAttribute('data-form-type','other');if(id!=='clientId')el.setAttribute('name','jf_client_field_'+i)});
  const n=by('clientName');if(n){n.spellcheck=true;n.setAttribute('autocorrect','on');n.setAttribute('autocapitalize','words')}
 }
 function openStable(id=''){
  hardenAutofill();clear();fillClientSelects();const c=id?clientBy(id):null,vals=valuesFor(c);apply(vals);
  const title=by('clientTitle');if(title)title.textContent=c?`Cliente — ${txt(c.nome)}`:'Novo cliente';
  const rel=by('clientRelations');if(rel)rel.classList.toggle('hidden',!c);if(c)renderClientRelations(c.id);
  const dlg=by('clientDlg');if(dlg&&!dlg.open)dlg.showModal();
  // Alguns navegadores reaplicam autofill logo após abrir o dialog; restauramos o cadastro correto.
  requestAnimationFrame(()=>apply(vals));setTimeout(()=>apply(vals),80);setTimeout(()=>apply(vals),250);
 }
 async function saveStable(e){
  e.preventDefault();e.stopImmediatePropagation();
  const id=by('clientId').value;const source=id?clientBy(id):null;const created=!source;
  const fields={matricula:txt(by('clientCode').value),codigo_cti:txt(by('clientCode').value),nome:txt(by('clientName').value),documento:txt(by('clientDoc').value),cpf_cnpj:txt(by('clientDoc').value),ie:txt(by('clientIE').value),inscricao_estadual:txt(by('clientIE').value),telefone:txt(by('clientPhone').value),email:txt(by('clientEmail').value),cidade:txt(by('clientCity').value),fazenda:txt(by('clientFarm').value),endereco:txt(by('clientAddress').value),logradouro:txt(by('clientAddress').value),data_nascimento:txt(by('clientBirth').value),observacoes:txt(by('clientObs').value)};
  S.custom=S.custom||{};S.custom.clientes=S.custom.clientes||[];
  let c=id?S.custom.clientes.find(x=>String(x.id)===String(id)):null;
  if(c)Object.assign(c,fields);
  else if(source){c={...JSON.parse(JSON.stringify(source)),...fields,id:source.id};S.custom.clientes.unshift(c)}
  else{c={id:uid('C'),...fields};S.custom.clientes.unshift(c)}
  log('cliente',c.id,created?'Cliente criado':'Cliente alterado');await saveDB();render();
  const dlg=by('clientDlg');if(dlg?.open)dlg.close();clear();
  if(typeof pushCentralSync==='function')pushCentralSync().catch(()=>{});
  if(by('osDlg')?.open){fillClientSelects();by('osClient').value=c.id;work.cliente_id=c.id;renderEquipments()}
 }
 function install(){
  hardenAutofill();window.openClient=openStable;
  const f=by('clientForm');if(f)f.onsubmit=saveStable;
  const close=()=>{const d=by('clientDlg');if(d?.open)d.close();clear()};
  if(by('closeClient'))by('closeClient').onclick=close;if(by('clientCancel'))by('clientCancel').onclick=close;
 }
 addEventListener('DOMContentLoaded',()=>setTimeout(install,1300));setTimeout(install,2400);
})();