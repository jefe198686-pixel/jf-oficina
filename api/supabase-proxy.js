const SUPABASE_ORIGIN='https://vfswmnkbwtlzensycnfj.supabase.co';
const PUBLIC_KEY='sb_publishable_rO1NER3IpMO8HkRWwzVqvA_jDUqnyba';

function json(res,status,obj){
  res.status(status);
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store');
  res.end(JSON.stringify(obj));
}

function allowed(path){
  return path.startsWith('/auth/v1/token') ||
    path==='/auth/v1/logout' ||
    path==='/auth/v1/user' ||
    path==='/functions/v1/jf-technicians' ||
    path==='/functions/v1/jf-technician-admin';
}

module.exports=async function handler(req,res){
  const raw=Array.isArray(req.query?.path)?req.query.path[0]:req.query?.path;
  const path=String(raw||'');
  if(!path.startsWith('/')||!allowed(path))return json(res,400,{ok:false,error:'proxy_path_not_allowed'});
  if(!['GET','POST','PUT','PATCH','DELETE','OPTIONS'].includes(req.method))return json(res,405,{ok:false,error:'method_not_allowed'});
  if(req.method==='OPTIONS'){res.status(204).end();return}
  try{
    const headers={
      apikey:String(req.headers.apikey||PUBLIC_KEY),
      'content-type':String(req.headers['content-type']||'application/json')
    };
    if(req.headers.authorization)headers.authorization=String(req.headers.authorization);
    if(req.headers['x-jf-sync-key'])headers['x-jf-sync-key']=String(req.headers['x-jf-sync-key']);
    let body;
    if(!['GET','HEAD'].includes(req.method)){
      body=typeof req.body==='string'?req.body:JSON.stringify(req.body??{});
    }
    const upstream=await fetch(SUPABASE_ORIGIN+path,{method:req.method,headers,body,redirect:'manual'});
    const text=await upstream.text();
    res.status(upstream.status);
    res.setHeader('content-type',upstream.headers.get('content-type')||'application/json; charset=utf-8');
    res.setHeader('cache-control','no-store');
    res.end(text);
  }catch(e){
    console.error('JF Supabase proxy',e);
    return json(res,502,{ok:false,error:'upstream_unreachable',message:String(e?.message||e)});
  }
};