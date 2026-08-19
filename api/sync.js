const crypto=require('crypto');
const {Pool}=require('pg');

let pool;
function findDbUrl(){
  const entries=Object.entries(process.env);
  const preferred=['POSTGRES_URL','DATABASE_URL','POSTGRES_PRISMA_URL'];
  for(const suffix of preferred){
    const hit=entries.find(([k,v])=>k.endsWith(suffix)&&/^postgres(?:ql)?:\/\//i.test(v||''));
    if(hit)return hit[1];
  }
  const any=entries.find(([k,v])=>/POSTGRES|DATABASE/i.test(k)&&/^postgres(?:ql)?:\/\//i.test(v||''));
  return any?.[1]||'';
}
function normalizeDbUrl(raw){
  try{
    const u=new URL(raw);
    for(const k of ['sslmode','sslcert','sslkey','sslrootcert'])u.searchParams.delete(k);
    return u.toString();
  }catch(e){return raw}
}
function getPool(){
  if(pool)return pool;
  const raw=findDbUrl();
  if(!raw)throw new Error('Nenhuma variável Postgres válida encontrada no ambiente Vercel.');
  pool=new Pool({connectionString:normalizeDbUrl(raw),ssl:{rejectUnauthorized:false},max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000});
  return pool;
}
async function ensureTable(){
  await getPool().query(`create table if not exists jf_sync_state(
    workspace_hash text primary key,
    payload jsonb not null default '{}'::jsonb,
    revision bigint not null default 0,
    updated_at timestamptz not null default now()
  )`);
}
function workspaceHash(req){
  const raw=String(req.headers['x-jf-sync-key']||'').trim();
  if(raw.length<24)return null;
  return crypto.createHash('sha256').update(raw).digest('hex');
}
function json(res,status,obj){res.status(status).setHeader('content-type','application/json; charset=utf-8');res.setHeader('cache-control','no-store');res.end(JSON.stringify(obj));}
function osSortKey(o){return String(o?.entrada||o?.data_entrada||o?.created_at||o?.createdAt||'9999')+'|'+String(o?.id||'')}
function canonicalizeOSNumbers(payload){
  if(!payload||typeof payload!=='object')return {payload,renumbered:[]};
  const clone=JSON.parse(JSON.stringify(payload));
  const arrays=[];
  if(Array.isArray(clone.ordens_servico))arrays.push(clone.ordens_servico);
  if(Array.isArray(clone.custom?.os))arrays.push(clone.custom.os);
  const all=arrays.flat().filter(x=>x&&typeof x==='object');
  const numeric=all.map(o=>Number(o.numero_os)).filter(n=>Number.isInteger(n)&&n>0);
  let next=numeric.length?Math.max(...numeric):0;
  const groups=new Map();
  for(const o of all){
    const n=Number(o.numero_os);
    if(!Number.isInteger(n)||n<=0)continue;
    if(!groups.has(n))groups.set(n,[]);
    groups.get(n).push(o);
  }
  const renumbered=[];
  for(const [n,group] of groups){
    const unique=[];const ids=new Set();
    for(const o of group){const id=String(o.id||'');if(id&&ids.has(id))continue;if(id)ids.add(id);unique.push(o)}
    if(unique.length<=1)continue;
    unique.sort((a,b)=>osSortKey(a).localeCompare(osSortKey(b)));
    for(let i=1;i<unique.length;i++){
      const o=unique[i];const old=String(o.numero_os);o.numero_os=String(++next);
      renumbered.push({id:String(o.id||''),from:old,to:String(o.numero_os)});
    }
  }
  return {payload:clone,renumbered};
}

module.exports=async function handler(req,res){
  if(!['GET','POST'].includes(req.method))return json(res,405,{ok:false,error:'method_not_allowed'});
  const workspace=workspaceHash(req);
  if(!workspace)return json(res,401,{ok:false,error:'sync_key_required'});
  try{
    await ensureTable();
    const db=getPool();
    if(req.method==='GET'){
      const client=await db.connect();
      try{
        await client.query('begin');
        const q=await client.query('select payload,revision,updated_at from jf_sync_state where workspace_hash=$1 for update',[workspace]);
        if(!q.rowCount){await client.query('commit');return json(res,200,{ok:true,exists:false,revision:0,payload:null,updatedAt:null});}
        let r=q.rows[0];
        const fixed=canonicalizeOSNumbers(r.payload);
        if(fixed.renumbered.length){
          const upd=await client.query('update jf_sync_state set payload=$2::jsonb,revision=revision+1,updated_at=now() where workspace_hash=$1 returning revision,updated_at',[workspace,JSON.stringify(fixed.payload)]);
          await client.query('commit');
          return json(res,200,{ok:true,exists:true,revision:Number(upd.rows[0].revision),payload:fixed.payload,updatedAt:upd.rows[0].updated_at,renumbered:fixed.renumbered});
        }
        await client.query('commit');
        return json(res,200,{ok:true,exists:true,revision:Number(r.revision),payload:r.payload,updatedAt:r.updated_at,renumbered:[]});
      }catch(e){try{await client.query('rollback')}catch(_){}throw e}finally{client.release()}
    }
    let body=req.body;
    if(typeof body==='string'){try{body=JSON.parse(body)}catch(e){body=null}}
    if(!body||typeof body!=='object'||!body.payload||typeof body.payload!=='object')return json(res,400,{ok:false,error:'invalid_payload'});
    const baseRevision=Number(body.baseRevision||0);
    const client=await db.connect();
    try{
      await client.query('begin');
      const q=await client.query('select payload,revision,updated_at from jf_sync_state where workspace_hash=$1 for update',[workspace]);
      if(!q.rowCount){
        if(baseRevision!==0){await client.query('rollback');return json(res,409,{ok:false,error:'revision_conflict',revision:0,payload:null,updatedAt:null});}
        const fixed=canonicalizeOSNumbers(body.payload);
        const ins=await client.query('insert into jf_sync_state(workspace_hash,payload,revision,updated_at) values($1,$2::jsonb,1,now()) returning revision,updated_at',[workspace,JSON.stringify(fixed.payload)]);
        await client.query('commit');
        return json(res,200,{ok:true,revision:Number(ins.rows[0].revision),updatedAt:ins.rows[0].updated_at,payload:fixed.payload,renumbered:fixed.renumbered});
      }
      const current=q.rows[0];
      const currentRevision=Number(current.revision);
      if(baseRevision!==currentRevision){
        await client.query('rollback');
        return json(res,409,{ok:false,error:'revision_conflict',revision:currentRevision,payload:current.payload,updatedAt:current.updated_at});
      }
      const fixed=canonicalizeOSNumbers(body.payload);
      const upd=await client.query('update jf_sync_state set payload=$2::jsonb,revision=revision+1,updated_at=now() where workspace_hash=$1 returning revision,updated_at',[workspace,JSON.stringify(fixed.payload)]);
      await client.query('commit');
      return json(res,200,{ok:true,revision:Number(upd.rows[0].revision),updatedAt:upd.rows[0].updated_at,payload:fixed.payload,renumbered:fixed.renumbered});
    }catch(e){try{await client.query('rollback')}catch(_){}throw e}finally{client.release()}
  }catch(e){
    console.error('JF sync API',e);
    return json(res,500,{ok:false,error:'server_error',message:String(e.message||e)});
  }
};
