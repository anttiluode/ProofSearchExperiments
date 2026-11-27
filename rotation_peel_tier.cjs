// Tier-specialized local Lie generator; Gate 14a-tier only.
function load(fast,reference,quality,discovery){
 let m={exports:{}};new Function("module","require",fast+"\nObject.assign(module.exports,{chart,sparse,port,numericMM,tr,entry,clipped,maxDiff});")(m,{});
 let a=m.exports,api=a.load(reference,quality,discovery);
 let anchor="let D=frame(dom,m,branch),T=frame(tar,m,branch),fixed=depth+1;";
 if(reference.split(anchor).length!==2)throw Error("prefix anchor");
 let r={exports:{}};new Function("module","require",reference.replace(anchor,"return {dom,tar,W};"+anchor)+"\nObject.assign(module.exports,{reduced});")(r,{});
 return {a,api,prefix:r.exports.reduced};
}
function tangent(env,p,c,x,depth,sign,z,entries,l){
 let {a,api,prefix}=env,N=p.n+2,m=p.n-2,d=x.length,fixed=depth+1,cut=7+m-1;
 let E=a.sparse(cut,l),xx=x.slice(0,cut).map((v,i)=>E.X(v,i)),ev;
 let P=a.port(E,(...args)=>(ev=api.evaluate(...args)),c,xx.slice(0,7),N,l);
 let {dom,tar,W}=prefix(E,p,c,P,depth,sign,xx.slice(7),[]);
 let pv=E.val(P),D=z.frames[0],T=z.frames[1],out=entries.map(()=>Array(d).fill(0));
 // Frame columns in endpoint coordinates. AZ columns cached once.
 function transform(F,Q){let cols=F.map(u=>Array.from({length:N},(_,i)=>{let v=0;for(let j=0;j<m;j++)if(Q[W[j]][i]!==0&&u[j]!==0){v+=Q[W[j]][i]*u[j];l.arithmetic+=2}return v}));return {Z:cols,AZ:cols.map(v=>apply(z.A,v))}}
 function apply(A,v){return A.map(row=>{let s=0;for(let j=0;j<v.length;j++)if(v[j]!==0&&row[j]!==0){s+=row[j]*v[j];l.arithmetic+=2}return s})}
 let ds=transform(D,pv),ts=transform(T,z.Q);
 function wedge(u,v,au,av){return entries.map(([i,j])=>{l.arithmetic+=7;return av[i]*u[j]-au[i]*v[j]+av[j]*u[i]-au[j]*v[i]})}
 function accumulate(w,co){for(let k=0;k<co.length;k++)if(co[k]!==0)for(let j=0;j<w.length;j++){out[j][k]+=co[k]*w[j];l.arithmetic+=2;l.deriv++}}
 function framePart(F,S,prefix,sg){
  for(let i=0;i<fixed;i++)for(let j=i+1;j<m;j++){
   let co=Array(cut).fill(0);
   for(let h=0;h<m;h++)for(let [k,v] of prefix[i][h].g){co[k]+=sg*F[j][h]*v;l.arithmetic+=3}
   if(co.some(v=>v!==0))accumulate(wedge(S.Z[i],S.Z[j],S.AZ[i],S.AZ[j]),co);
  }
 }
 framePart(D,ds,dom,-1);framePart(T,ts,tar,1);
 function suffix(size,i,j,rotations,k){
  let u=Array(size).fill(0),v=u.slice();u[i]=1;v[j]=1;
  for(let h=k+1;h<rotations.length;h++){let {i,j,c,s}=rotations[h];for(let q of [u,v]){let x=q[i],y=q[j];if(x===0&&y===0)continue;q[i]=c*x+s*y;q[j]=-s*x+c*y;l.arithmetic+=6}}
  return [u,v];
 }
 function combine(cols,coef){let v=Array(N).fill(0);for(let i=0;i<coef.length;i++)if(coef[i]!==0)for(let j=0;j<N;j++)if(cols[i][j]!==0){v[j]+=coef[i]*cols[i][j];l.arithmetic+=2}return v}
 let core=[];for(let i=fixed;i<m;i++)for(let j=i+1;j<m;j++){let t=x[cut+core.length];core.push({i,j,c:Math.cos(t),s:Math.sin(t)});l.angles+=2}
 for(let k=0;k<core.length;k++){
  let {i,j}=core[k],[u,v]=suffix(m,i,j,core,k),co=Array(d).fill(0);co[cut+k]=1;
  accumulate(wedge(combine(ds.Z,u),combine(ds.Z,v),combine(ds.AZ,u),combine(ds.AZ,v)),co);
 }
 let rotations=ev.rotations.map(q=>({...q,i:c.synth.map[q.i],j:c.synth.map[q.j]}));
 for(let k=0;k<rotations.length;k++){
  let {i,j}=rotations[k],co=Array(7).fill(0);
  for(let h=0;h<7;h++)for(let [idx,v] of ev.deps[h]){l.key++;if(idx===k)co[h]=v}
  if(!co.some(v=>v!==0))continue;
  let [u,v]=suffix(N,i,j,rotations,k);accumulate(wedge(u,v,apply(z.A,u),apply(z.A,v)),co);
 }
 return out;
}
function model(env,p,c,x,depth,sign,z,smooth,l){
 let f=env.api.f,res=f.residualH(z.A,p,c,true,smooth,l),d=x.length,entries=res.f.map(e=>[e.i,e.j]),maxIndex=-1,active=[];
 if(!smooth&&res.mx/10>1e-6){maxIndex=entries.length;entries.push([res.r[res.im].i,res.r[res.im].j])}
 for(let e of res.r){if(smooth||res.floor<=Math.abs(e.x)){active.push(-1);continue}active.push(entries.length);entries.push([e.i,e.j])}
 let rows=tangent(env,p,c,x,depth,sign,z,entries,l).map(g=>g.map(v=>{l.jacobian++;l.arithmetic++;return v/p.scale}));
 let dm=maxIndex>=0?rows[maxIndex].map(v=>{l.arithmetic+=2;return Math.sign(res.r[res.im].x)*v/10}):Array(d).fill(0);
 let J=env.a.tr([...rows.slice(0,res.f.length),...res.r.map((e,i)=>active[i]<0?Array(d).fill(0):rows[active[i]].map((v,k)=>{l.arithmetic+=2;return dm[k]-Math.sign(e.x)*v}))]);l.cache++;
 return {J,r:res.values,g:null,h:null,G:[]};
}
function run(env,lib,inputs){
 let {a,api}=env,f=api.f,out=[];
 for(let r of inputs){
  let {seed,depth,k,sign,x}=r,p=f.problem(seed),g=f.generate(seed),id=f.chosen(lib,g.type,"FIRST"),c=f.compile(p,f.ledger(),"SYN",f.item(lib,g.type,id)),N=p.n+2,d=x.length;
  let z=a.chart(api,p,c,x,depth,sign,false,null,f.ledger()),local=a.chart(api,p,c,x,depth,sign,true,z.frames,f.ledger()),entries=[];
  for(let i=0;i<N;i++)for(let j=i;j<N;j++)entries.push([i,j]);
  let l=f.ledger(),J=tangent(env,p,c,x,depth,sign,local,entries,l),err=0;
  for(let i=0;i<entries.length;i++){let [u,v]=entries[i],old=a.entry(local,u,v,d,f.ledger());for(let j=0;j<d;j++)err=Math.max(err,Math.abs(J[i][j]-old[j])/p.scale)}
  let costs=null;
  if(p.n===9&&depth===2)costs=[true,false].map(smooth=>{let ml=f.ledger(),tl=f.ledger(),base=r.costs.find(v=>v.smooth===smooth);
   ml.iterations++;ml.cache++;let m=model(env,p,c,x,depth,sign,local,smooth,ml),dx=a.clipped(f,m,ml);
   let b=a.chart(api,p,c,x.map((v,i)=>{tl.linear++;return v+dx[i]}),depth,sign,false,z.frames,tl);b.m=f.metric(b.A,p,tl);f.leak(b,c,p,tl);f.value(b,p,c,true,smooth,tl);tl.frontier++;
   return {smooth,model:f.work(ml),trial:f.work(tl),total:f.work(ml)+f.work(tl),baseTotal:base.baseTotal,baseModel:base.baseModel,baseTrial:base.baseTrial,sparseTotal:base.total,ledger:{model:ml,trial:tl}};
  });
  out.push({seed,n:p.n,depth,k,d,err,base:a.maxDiff(z.A,local.A,p.scale),pass:err<=1e-12,costs});
 }return out
}
module.exports={load,run};
if(require.main===module){let fs=require("node:fs"),a=load(...["rotation_peel_fast.cjs","rotation_peel_diagnostic.cjs","rotation_quality.cjs","discover_givens.cjs"].map(p=>fs.readFileSync(p,"utf8"))),lib=JSON.parse(fs.readFileSync("results/rotation_quality_library.json")),rows=[];for(let k=0;k<4;k++)rows.push(...run(a,lib,JSON.parse(fs.readFileSync("results/rotation_peel_fast_diag_0"+k+".json"))));fs.writeFileSync("results/rotation_peel_tier_reproduced.json",JSON.stringify(rows,null,2))}
