// Experiment 13: isolated wrapper; old solver and evaluator remain untouched.
const SOURCE_BLOB="1a73674db2a654ae38ec41a5c8e1e6bf087ddd6f";
const arms=["BASE-512","LOCAL-512","SHORT-384","LONG-1024","UNLEASH","HALVE-LOSS","SUSPEND-LOSS","SUSPEND-PROGRESS"];
function load(source,discovery){
  const anchor="let index=seed-83000,n=8+Math.floor(index/16)";
  if(source.split(anchor).length!==2)throw Error("generator anchor");
  source=source.replace(anchor,"let index=seed-(seed>=84000?84000:83000),n=8+Math.floor(index/16)");
  const m={exports:{}},g={exports:{}};
  new Function("module","require",discovery)(g,{});
  new Function("module","require",source+"\nObject.assign(module.exports,{work,metered,BUDGET,rng,compile,seedState,value,modelH,diag,block,dot,trialChart,leak,rotate});")(m,{});
  m.exports.setEvaluator(g.exports.evalProgram);
  return m.exports;
}
function regulate(f,p,lib,arm,budget){
  if(arm==="BASE-512")return f.solveH(p,"SYN",budget,lib,0,8);
  const {raw,l:base}=f.metered(budget),RCAP=Symbol("rotation cap");
  const l=new Proxy(base,{set(o,k,v){if(k==="rotations"&&v>4096)throw RCAP;o[k]=v;return true}});
  let best=null,c=null,issued=0,stop="completed",events=[],states=[];
  let r=f.rng(p.seed+90000),ra=f.rng(p.seed+590000);
  const maxRot=arm==="SHORT-384"?384:arm==="LOCAL-512"?512:1024;
  const race=arm.includes("LOSS")||arm==="SUSPEND-PROGRESS";
  const probe=p.n===8?8:budget===2000000?6:10;
  let maxLeak=0;
  function consider(cur){
    maxLeak=Math.max(maxLeak,f.leak(cur,c,p,l));
    if(best)l.frontier++;
    if(!best||cur.m.success!==best.m.success?(!best||cur.m.success):cur.m.loss<best.m.loss-1e-18||Math.abs(cur.m.loss-best.m.loss)<=1e-18&&cur.path.length<best.path.length)best=cur;
  }
  function seed(){
    let id=issued++,rot0=raw.rotations,w0=f.work(raw);l.restarts++;
    let cur=f.seedState(c,p,id,r,ra,l);consider(cur);
    let s={id,cur,mu:1e-3,smooth:true,sa:0,st:0,cache:null,loss:f.value(cur,p,c,true,true,l),rot:raw.rotations-rot0,seedWork:f.work(raw)-w0,h:[],done:null};
    states.push(s);events.push({event:"seed",id,rot:s.rot,work:s.seedWork,full:cur.m.loss});
    return s;
  }
  function finish(s,reason){if(!s.done){s.done=reason;events.push({event:"terminal",id:s.id,reason,trials:s.st,rot:s.rot,full:s.cur.m.loss})}return false}
  function recent(s){let h=s.h.slice(-4);if(!h.length)return {drop:0,rate:0};l.selection+=h.length+8;
    let a=h[0].before,b=h.at(-1).after,w=h.reduce((t,x)=>t+x.work,0);
    return {drop:(a-b)/Math.max(a,1e-30),rate:Math.log(Math.max(a,1e-30)/Math.max(b,1e-30))/Math.max(1,w)};
  }
  function trial(s){
    if(s.done||best?.m.success)return false;
    l.selection++;
    if(s.smooth&&(s.loss<=1e-3||s.sa>=12||s.st>=20||s.mu>=1e12||s.rot>=256)){
      s.smooth=false;s.loss=s.cur.m.loss;s.cache=null;s.mu=1e-3;
      events.push({event:"transition",id:s.id,trials:s.st,rot:s.rot,work:f.work(raw)});
    }
    const d=c.proof.dimension,pd=c.proof.physicalDimension;
    if(s.mu>=1e12||s.st>=120)return finish(s,"damping/trial limit");
    if(s.rot+pd>maxRot)return finish(s,"local rotation limit");
    if(arm==="UNLEASH"&&s.rot+pd>512){
      if(!s.h.at(-1)?.accepted||recent(s).drop<=.01)return finish(s,"progress leash");
    }
    if(raw.rotations+pd>4096)throw RCAP;
    let w0=f.work(raw),rot0=raw.rotations,before=s.cur.m.loss;
    l.iterations++;l.cache++;
    if(s.cache){if(s.cache.state!==s.cur)throw Error("stale cache")}
    else s.cache=f.modelH(s.cur,p,c,true,true,s.smooth,[],l);
    let m=s.cache;f.diag(m,l);let delta=f.block(m,Array.from({length:d},(_,i)=>i),s.mu,l);
    if(!delta||!delta.every(Number.isFinite))return finish(s,"invalid step");
    let norm=Math.sqrt(f.dot(delta,delta,l));l.linear++;
    let sc=norm>.5?.5/norm:1;
    let cand=f.trialChart(s.cur,delta.map(x=>x*sc),c,p,l);
    let val=f.value(cand,p,c,true,s.smooth,l);consider(cand);
    let accepted=cand.m.success||val<s.loss;s.st++;
    if(accepted){s.cur=cand;s.loss=val;s.cache=null;s.mu=Math.max(1e-12,s.mu/3);s.sa++}else s.mu*=10;
    s.rot+=raw.rotations-rot0;
    let item={before,after:s.cur.m.loss,work:f.work(raw)-w0,accepted};
    s.h.push(item);
    events.push({event:"trial",id:s.id,k:s.st,rot:s.rot,work:item.work,full:item.after,accepted,smooth:s.smooth,mu:s.mu});
    return true;
  }
  function block(s,k){for(let i=0;i<k&&!s.done&&!best?.m.success;i++)if(!trial(s))break}
  function rank(a){
    let scores=a.map(s=>({s,loss:s.cur.m.loss,rate:arm==="SUSPEND-PROGRESS"?recent(s).rate:0}));
    l.selection+=scores.length*3;
    scores.sort((x,y)=>{l.selection++;return y.rate-x.rate||x.loss-y.loss||x.s.id-y.s.id});
    return scores[0].s;
  }
  try{
    c=f.compile(p,l,"SYN",lib);if(!c.proof)throw Error("unsupported");
    while(issued<8&&!best?.m.success){
      if(!race){let s=seed();block(s,120);continue}
      let a=seed();block(a,probe);if(best?.m.success)break;
      let b=seed();block(b,probe);if(best?.m.success)break;
      let pair=[a,b],last=b.id;
      if(arm==="HALVE-LOSS"){
        let live=pair.filter(s=>!s.done);if(live.length){let s=rank(live);for(let z of live)if(z!==s)finish(z,"halved");events.push({event:"choose",id:s.id,from:last,work:f.work(raw)});block(s,120)}
      }else{
        while(!best?.m.success){let live=pair.filter(s=>!s.done);if(!live.length)break;
          let s=rank(live);events.push({event:"choose",id:s.id,from:last,work:f.work(raw),live:live.map(x=>x.id)});last=s.id;block(s,4)}
      }
    }
  }catch(e){if(e===f.BUDGET)stop="work cap";else if(e===RCAP)stop="rotation cap";else throw e}
  if(!best)throw Error("no endpoint");
  let verification=f.verify(p.start,best,p.scale);
  let check=f.metric(best.A,p,f.ledger());
  if(check.loss!==best.m.loss||check.success!==best.m.success)throw Error("metric mismatch");
  return {seed:p.seed,n:p.n,mode:arm,budget,success:best.m.success,loss:best.m.loss,work:f.work(raw),rotations:raw.rotations,ledger:raw,stop,path:best.path,verification,maxLeak,events};
}
function run(f,lib,ids){
  let rows=[],audits=[];
  for(let seed of ids){
    let g=f.generate(seed),p=f.problem(seed),id=f.chosen(lib,g.type,"FIRST"),item=f.item(lib,g.type,id);
    let witness=f.metric(g.target,p,f.ledger());
    if(!witness.success)throw Error("witness");
    let w=f.verify(g.target,{A:g.start,path:g.canonicalPath},g.scale),deriv=f.rawAudit(p,item);
    if(deriv.max>1e-7||deriv.leak>1e-12)throw Error("derivative audit");
    audits.push({seed,witness:w,derivative:deriv.max,leak:deriv.leak});
    for(let budget of [2000000,4000000])for(let arm of arms){
      let z=regulate(f,p,item,arm,budget);
      if(z.work>budget||z.rotations>4096||f.work(z.ledger)!==z.work)throw Error("cap/ledger");
      let A=p.start;for(let a of z.path)A=f.rotate(A,a,f.ledger());
      let metric=f.metric(A,p,f.ledger());
      if(metric.success!==z.success||Math.abs(metric.loss-z.loss)>1e-14*Math.max(1,Math.abs(z.loss)))throw Error("path metric mismatch");
      let {path,...row}=z;rows.push({...row,mode:arm,type:g.type,id,stages:path.length});
    }
  }
  return {rows,audits};
}
module.exports={load,regulate,run,arms,SOURCE_BLOB};
if(require.main===module){
  const fs=require("node:fs"),crypto=require("node:crypto");
  const source=fs.readFileSync("rotation_quality.cjs","utf8");
  const hash=crypto.createHash("sha1").update("blob "+Buffer.byteLength(source)+"\\0".replace("\\0","\0")).update(source).digest("hex");
  if(hash!==SOURCE_BLOB)throw Error("source blob drift "+hash);
  const f=load(source,fs.readFileSync("discover_givens.cjs","utf8")),lib=JSON.parse(fs.readFileSync("results/rotation_quality_library.json"));
  // Gate 11 compact rows were checked identical to Gate 12 trace replays.
  let summary=JSON.parse(fs.readFileSync("results/rotation_quality_summary.json")),count=0;
  for(let file of summary.rawFiles){
    let rows=JSON.parse(fs.readFileSync("results/"+file));
    for(let old of rows.filter(x=>/^R[0-4]$/.test(x.mode)&&x.organ===f.chosen(lib,x.type,"FIRST"))){
      let p=f.problem(old.seed),z=f.solveH(p,"SYN",old.budget??Infinity,f.item(lib,old.type,old.organ),0,8);
      for(let k of ["success","loss","work","rotations"])if(z[k]!==old[k])throw Error("baseline replay "+old.seed+" "+k);
      count++;
    }
  }
  if(count!==64)throw Error("replay count "+count);
  let result=run(f,lib,Array.from({length:32},(_,i)=>84000+i));
  fs.writeFileSync("results/rotation_regulator_reproduced.json",JSON.stringify({baselineReplay:count,...result},null,2));
}
