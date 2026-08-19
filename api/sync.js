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
function getPool(){
  if(pool)return pool;
  const connectionString=findDbUrl();
  if(!connectionString)throw new Error('Nenhuma variável Postgres válida encontrada no ambiente Vercel.');
  pool=new Pool({connectionString,ssl:{rejectUnauthorized:false},max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000});
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

module.exports=async function handler(req,res){
  if(!['GET','POST'].includes(req.method))return json(res,405,{ok:false,error:'method_not_allowed'});
  const workspace=workspaceHash(req);
  if(!workspace)return json(res,401,{ok:false,error:'sync_key_required'});
  try{
    await ensureTable();
    const db=getPool();
    if(req.method==='GET'){
      const q=await db.query('select payload,revision,updated_at from jf_sync_state where workspace_hash=$1',[workspace]);
      if(!q.rowCount)return json(res,200,{ok:true,exists:false,revision:0,payload:null,updatedAt:null});
      const r=q.rows[0];
      return json(res,200,{ok:true,exists:true,revision:Number(r.revision),payload:r.payload,updatedAt:r.updated_at});
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
        const ins=await client.query('insert into jf_sync_state(workspace_hash,payload,revision,updated_at) values($1,$2::jsonb,1,now()) returning revision,updated_at',[workspace,JSON.stringify(body.payload)]);
        await client.query('commit');
        return json(res,200,{ok:true,revision:Number(ins.rows[0].revision),updatedAt:ins.rows[0].updated_at});
      }
      const current=q.rows[0];
      const currentRevision=Number(current.revision);
      if(baseRevision!==currentRevision){
        await client.query('rollback');
        return json(res,409,{ok:false,error:'revision_conflict',revision:currentRevision,payload:current.payload,updatedAt:current.updated_at});
      }
      const upd=await client.query('update jf_sync_state set payload=$2::jsonb,revision=revision+1,updated_at=now() where workspace_hash=$1 returning revision,updated_at',[workspace,JSON.stringify(body.payload)]);
      await client.query('commit');
      return json(res,200,{ok:true,revision:Number(upd.rows[0].revision),updatedAt:upd.rows[0].updated_at});
    }catch(e){try{await client.query('rollback')}catch(_){}throw e}finally{client.release()}
  }catch(e){
    console.error('JF sync API',e);
    return json(res,500,{ok:false,error:'server_error',message:String(e.message||e)});
  }
};
