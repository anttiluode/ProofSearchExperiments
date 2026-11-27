const L=()=>({rotations:0,arithmetic:0,angles:0,score:0,key:0,frontier:0,permutation:0}),cap=4096, rng=s=>()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296};
const eye=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j))),tr=A=>A[0].map((_,j)=>A.map(r=>r[j])),mul=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,x,k)=>s+x*B[k][j],0)));
function rotate(A,a,l){let {i,j,c,s}=a,n=A.length,B=A.map(r=>r.slice());l.rotations++;for(let k=0;k<n;k++){let x=A[k][i],y=A[k][j];B[k][i]=c*x+s*y;B[k][j]=-s*x+c*y;l.arithmetic+=6}let x=B[i].slice(),y=B[j].slice();for(let k=0;k<n;k++){B[i][k]=c*x[k]+s*y[k];B[j][k]=-s*x[k]+c*y[k];l.arithmetic+=6}return B}
function pivot(A,i,j,k,which,l){l.angles++;let x=A[k][i],y=A[k][j],h=Math.hypot(x,y);if(h===0)return null;return which===j?{i,j,c:x/h,s:y/h,k,zero:which}:{i,j,c:y/h,s:-x/h,k,zero:which}}
function canon(A,l){let B=A,path=[],n=A.length;for(let k=0;k<n-3;k++)for(let j=n-2;j>k+1;j--){if(Math.abs(B[k][j])<1e-14)continue;let a=pivot(B,k+1,j,k,j,l);B=rotate(B,a,l);path.push(a)}return {A:B,path}}
function make(seed,dense){let r=rng(seed),n=4+seed%3,N=n+2,A=Array.from({length:N},()=>Array(N).fill(0)),mask=Array.from({length:N},()=>Array(N).fill(false));for(let i=0;i<N;i++)A[i][i]=12+Math.floor(r()*9);function edge(i,j){if(mask[i][j])return;mask[i][j]=mask[j][i]=true;A[i][j]=A[j][i]=1+Math.floor(r()*7)}
 if(dense){for(let i=0;i<N;i++)for(let j=i+1;j<N;j++)edge(i,j)}else{for(let i=0;i<N-1;i++)edge(i,i+1);if(seed%2===0)edge(1,n);else{edge(1,3);edge(2,n)}}
 let scale=Math.max(...A.flat().map(Math.abs)),generation=L(),c=canon(A,generation);return {seed,dense,n,mask,scale,target:A,start:c.A,canonicalPath:c.path,generation}}
function metric(A,p,l){let n=A.length,forbid=0,maxF=0,min=Infinity,max=0,edges=0,missing=0,forbiddenCount=0;let req=[];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){l.score++;let a=Math.abs(A[i][j])/p.scale;if(a>1e-8)edges++;if(p.mask[i][j]){req.push(a);min=Math.min(min,a);max=Math.max(max,a);if(a<1e-6)missing++}else{forbid+=a*a;maxF=Math.max(maxF,a);if(a>1e-8)forbiddenCount++}}
 let floor=Math.max(1e-6,max/10),pen=0;for(let a of req){l.score++;pen+=Math.max(0,floor-a)**2}let ratio=min>0?max/min:Infinity;return {loss:forbid+pen,edges,forbiddenCount,missing,ratio:Number.isFinite(ratio)?ratio:null,maxForbidden:maxF,success:maxF<=1e-8&&missing===0&&ratio<=10+1e-7}}
function allPivots(A,l){let out=[],N=A.length;for(let i=1;i<N-1;i++)for(let j=i+1;j<N-1;j++)for(let k=0;k<N;k++){if(k===i||k===j)continue;if(Math.abs(A[k][i])+Math.abs(A[k][j])<1e-12)continue;for(let z of [i,j]){if(Math.abs(A[k][z])<1e-12)continue;let a=pivot(A,i,j,k,z,l);if(a)out.push(a)}}return out}
function key(A,p,l){let a=[];for(let i=0;i<A.length;i++)for(let j=i;j<A.length;j++){l.key++;a.push(Math.round(A[i][j]/p.scale*1e10))}return a.join(",")}
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],neg=a=>[-a[0],-a[1]],cm=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],cd=(a,b)=>cm(a,[b[0]/(b[0]**2+b[1]**2),-b[1]/(b[0]**2+b[1]**2)]),abs=a=>Math.hypot(...a);
function response(A,w){let n=A.length,C=A.map((row,i)=>row.map((x,j)=>[x+(i===j&&i>0&&i<n-1?w:0),i===j&&(i===0||i===n-1)?-1:0]).concat([[i===0?1:0,0]]));for(let k=0;k<n;k++){let j=k;for(let i=k+1;i<n;i++)if(abs(C[i][k])>abs(C[j][k]))j=i;[C[k],C[j]]=[C[j],C[k]];let pivot=C[k][k];for(let q=k;q<=n;q++)C[k][q]=cd(C[k][q],pivot);for(let i=0;i<n;i++)if(i!==k){let v=C[i][k];for(let q=k;q<=n;q++)C[i][q]=add(C[i][q],neg(cm(v,C[k][q])))}}return [add([1,0],cm([0,2],C[0][n])),cm([0,-2],C[n-1][n])]}
function verify(A,b,scale){let n=A.length,Q=eye(n),count=0;for(let a of b.path){let T=eye(n);T[a.i][a.i]=T[a.j][a.j]=a.c;T[a.i][a.j]=-a.s;T[a.j][a.i]=a.s;Q=mul(Q,T);count+=n**3}if(b.permutation){let T=eye(n).map(row=>b.permutation.map(j=>row[j]));Q=mul(Q,T);count+=n**3}let z=mul(mul(tr(Q),A),Q),o=mul(tr(Q),Q),err=0,orth=0,ports=0,sym=0;count+=3*n**3;for(let i=0;i<n;i++)for(let j=0;j<n;j++){err=Math.max(err,Math.abs(z[i][j]-b.A[i][j])/scale);orth=Math.max(orth,Math.abs(o[i][j]-+(i===j)));sym=Math.max(sym,Math.abs(b.A[i][j]-b.A[j][i])/scale);if(i===0||i===n-1||j===0||j===n-1)ports=Math.max(ports,Math.abs(Q[i][j]-+(i===j)))}let resp=0;for(let w of [-2,-1,0,1,2]){let x=response(A,w),y=response(b.A,w);for(let i=0;i<2;i++)resp=Math.max(resp,abs(add(x[i],neg(y[i]))))}if(![err,orth,ports,sym,resp].every(Number.isFinite)||Math.max(err,orth,ports,sym,resp)>1e-8)throw Error("verification");return {err,orth,ports,sym,resp,denseMultiplyTerms:count,responseSolves:10}}


const target=Array.from({length:96},(_,i)=>75000+i);
const modes=["P8C","P8C+","DIAG","D+F","PCG3","B","RB"];
const ledger=()=>({...L(),jacobian:0,linear:0,iterations:0,restarts:0,align:0,deriv:0,organ:0,assembly:0,dot:0,orthogonalize:0,selection:0,cache:0});
const work=l=>Object.values(l).reduce((a,b)=>a+b,0);
function addLedger(a,b){for(const k of Object.keys(a))a[k]+=b[k];return a}
function generate(seed){
 const index=seed-75000,n=6+Math.floor(index/32),family=2,chords=1+(index%2),cell=2*(n-6)+chords-1,N=n+2;
 let mix=Math.imul(seed^(seed>>>16),0x45d9f3b);mix=Math.imul(mix^(mix>>>16),0x45d9f3b);const r=rng((mix^(mix>>>16))>>>0);
 let A=Array.from({length:N},()=>Array(N).fill(0)),mask=Array.from({length:N},()=>Array(N).fill(false));
 for(let i=0;i<N;i++)A[i][i]=12+Math.floor(r()*9);
 function edge(i,j){if(mask[i][j])return;mask[i][j]=mask[j][i]=true;A[i][j]=A[j][i]=1+Math.floor(r()*7)}
 for(let i=0;i<N-1;i++)edge(i,i+1);
 if(chords===1)edge(1,n);else{edge(1,3);edge(2,n)}
 edge(2,N-1);if(family===2)edge(0,n-1);
 let generation=L(),c=canon(A,generation);
 return {seed,n,family,chords,cell,mask,scale:Math.max(...A.flat().map(Math.abs)),target:A,start:c.A,canonicalPath:c.path,generation};
}
function problem(seed){let {target,canonicalPath,generation,...p}=generate(seed);return p}
function deriv(A,a,b,i,j,l){l.deriv++;return (b===i?A[a][j]:b===j?-A[a][i]:0)-(a===i?-A[j][b]:a===j?A[i][b]:0)}
const BUDGET=Symbol("budget");
function metered(cap){let raw=ledger(),total=0;let l=new Proxy(raw,{set(o,k,v){let delta=v-o[k];if(total+delta>cap)throw BUDGET;total+=delta;o[k]=v;return true}});return {raw,l}}
function allPlanes(free){let p=[];for(let a=0;a<free.length;a++)for(let b=a+1;b<free.length;b++)p.push([free[a],free[b]]);return p}
function candidates(p,planes,l){let out=[];for(let [i,j] of planes)for(let k=0;k<p.n+2;k++){l.organ++;if(k===i||k===j)continue;for(let z of [i,j]){l.organ++;if(!p.mask[k][z])out.push([i,j,k,z])}}return out}
function residual(A,p,l){let f=[],r=[],mx=-1,im=0,N=A.length;for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){l.score++;let x=A[i][j]/p.scale;if(p.mask[i][j]){if(Math.abs(x)>mx){mx=Math.abs(x);im=r.length}r.push({i,j,x})}else f.push({i,j,x})}let floor=Math.max(1e-6,mx/10);return {f,r,mx,im,floor,values:[...f.map(v=>v.x),...r.map(v=>Math.max(0,floor-Math.abs(v.x)))]}}
function jac(A,res,i,j,p,l){let diff=v=>{l.jacobian++;return deriv(A,v.i,v.j,i,j,l)/p.scale},dm=res.mx/10>1e-6?Math.sign(res.r[res.im].x)*diff(res.r[res.im])/10:0;return [...res.f.map(diff),...res.r.map(v=>{l.jacobian++;return res.floor>Math.abs(v.x)?dm-Math.sign(v.x)*diff(v):0})]}
function linear(H,b,l){let d=b.length,C=H.map((r,i)=>[...r,b[i]]);for(let k=0;k<d;k++){let j=k;for(let i=k+1;i<d;i++){l.linear++;if(Math.abs(C[i][k])>Math.abs(C[j][k]))j=i}[C[k],C[j]]=[C[j],C[k]];let v=C[k][k];if(Math.abs(v)<1e-20)return null;for(let j=k;j<=d;j++){C[k][j]/=v;l.linear++}for(let i=0;i<d;i++)if(i!==k){let v=C[i][k];for(let j=k;j<=d;j++){C[i][j]-=v*C[k][j];l.linear+=2}}}return C.map(r=>r[d])}
function startState(p,l){return {A:p.start,m:metric(p.start,p,l),path:[]}}
function step(cur,a,p,l){let A=rotate(cur.A,a,l);let m=metric(A,p,l);metric(A,p,l);return {A,m,path:[...cur.path,a]}}
function align(root,p,l){let free=Array.from({length:p.n},(_,i)=>i+1),pins=[];for(let k of [0,p.n+1]){let req=free.concat(pins.map(x=>x[1])).filter(i=>p.mask[k][i]);if(req.length!==1)continue;let t=req[0];if(!free.includes(t))throw Error("pin overlap");for(let [,j] of pins)if(Math.abs(root.A[k][j])/p.scale>1e-12)throw Error("nonorthogonal pins");for(let j of free){if(j===t||Math.abs(root.A[k][j])/p.scale<1e-15)continue;let a=pivot(root.A,Math.min(t,j),Math.max(t,j),k,j,l);if(a){root=step(root,a,p,l);l.align++}}pins.push([k,t]);free=free.filter(i=>i!==t)}return {root,free,pins}}
function auditPins(cur,p,pins,l){for(let [k,t] of pins)for(let j=1;j<=p.n;j++)if(j!==t){l.score++;if(Math.abs(cur.A[k][j])/p.scale>1e-12)throw Error("pin leak")}}
function blockPlanes(p,planes,s,it,l){if(!s||it>=3)return planes;let port=[],internal=[];for(let [i,j] of planes){l.organ++;if([0,p.n+1].some(k=>p.mask[k][i]!==p.mask[k][j]))port.push([i,j]);else internal.push([i,j])}let primary=s==="port"?port:s==="internal"?internal:it%2?internal:port;let other=primary===port?internal:port;return (primary.length?primary:other).slice(0,6)}
function mine(p){let l=ledger(),{root,free}=align(startState(p,l),p,l),cs=candidates(p,allPlanes(free),l),motif=[];for(let k=0;k<5;k++){let best=root,op=null;for(let c of cs){l.organ++;let a=pivot(root.A,...c,l);if(!a)continue;let trial=step(root,a,p,l);if(trial.m.loss<best.m.loss-1e-15){best=trial;op=c}}if(!op)break;motif.push(op);root=best}return {motif,ledger:l}}


function dot(a,b,l){let s=0;for(let i=0;i<a.length;i++){l.linear+=2;s+=a[i]*b[i]}return s}
function model(cur,p,planes,l){let res=residual(cur.A,p,l),r=res.values,J=planes.map(([i,j])=>jac(cur.A,res,i,j,p,l));l.cache++;return {state:cur,J,r,g:null,h:null,G:[],rb:null}}
function diag(m,l){l.cache++;if(m.g)return;let d=m.J.length;m.g=m.J.map(a=>{let v=dot(a,m.r,l);l.linear++;return -v});m.h=m.J.map(a=>dot(a,a,l));m.G=Array.from({length:d},(_,i)=>{let r=Array(d).fill(undefined);r[i]=m.h[i];return r})}
function entry(m,i,j,l){l.cache++;if(m.G[i][j]===undefined){let v=dot(m.J[i],m.J[j],l);m.G[i][j]=m.G[j][i]=v}return m.G[i][j]}
function factor(H,g,l){
 let d=g.length,C=Array.from({length:d},()=>Array(d).fill(0));
 for(let i=0;i<d;i++)for(let j=0;j<=i;j++){let s=H[i][j];for(let t=0;t<j;t++){l.linear+=2;s-=C[i][t]*C[j][t]}l.linear++;if(i===j){if(!(s>0))return null;C[i][j]=Math.sqrt(s)}else C[i][j]=s/C[j][j]}
 let y=Array(d),x=Array(d);for(let i=0;i<d;i++){let s=g[i];for(let j=0;j<i;j++){l.linear+=2;s-=C[i][j]*y[j]}l.linear++;y[i]=s/C[i][i]}
 for(let i=d-1;i>=0;i--){let s=y[i];for(let j=i+1;j<d;j++){l.linear+=2;s-=C[j][i]*x[j]}l.linear++;x[i]=s/C[i][i]}return x;
}
function block(m,idx,mu,l){let k=idx.length,H=Array.from({length:k},()=>Array(k).fill(0));for(let i=0;i<k;i++)for(let j=i;j<k;j++){let v=entry(m,idx[i],idx[j],l);if(i===j){v+=mu;l.linear++}H[i][j]=H[j][i]=v;l.linear++}return factor(H,idx.map(i=>m.g[i]),l)}
function diagStep(m,mu,l){return m.g.map((g,i)=>{l.linear+=2;return g/(m.h[i]+mu)})}
function select(m,mode,mu,rand,l){let n=m.g.length,k=Math.min(5,n),a=[];if(mode==="RB"){l.cache++;if(m.rb)return m.rb;let pool=Array.from({length:n},(_,i)=>i);for(let j=0;j<k;j++){l.selection+=2;a.push(pool.splice(Math.floor(rand()*pool.length),1)[0])}m.rb=a;return a}
 let rank=m.g.map((g,i)=>{l.selection+=4;return Math.abs(g)/Math.sqrt(m.h[i]+mu)});for(let j=0;j<k;j++){let best=-1;for(let i=0;i<n;i++){l.selection++;if(a.includes(i))continue;if(best<0||rank[i]>rank[best])best=i}a.push(best)}return a}
function matvec(m,v,mu,l){let y=Array(m.r.length).fill(0),d=v.length;for(let i=0;i<d;i++)for(let t=0;t<y.length;t++){l.linear+=2;y[t]+=m.J[i][t]*v[i]}return m.J.map((a,i)=>{let q=dot(a,y,l);l.linear+=2;return q+mu*v[i]})}
function pcg(m,mu,l){
 let d=m.g.length,x=Array(d).fill(0),r=m.g.slice(),z=diagStep(m,mu,l),v=z.slice(),rz=dot(r,z,l),r0=dot(r,r,l);
 if(!(r0>0))return x;
 for(let k=0;k<3;k++){
  let Av=matvec(m,v,mu,l),den=dot(v,Av,l);if(!(den>0)||!Number.isFinite(den)||!Number.isFinite(rz))break;
  let alpha=rz/den;l.linear++;
  for(let i=0;i<d;i++){l.linear+=4;x[i]+=alpha*v[i];r[i]-=alpha*Av[i]}
  if(dot(r,r,l)<=r0*1e-20||k===2)break;
  z=r.map((q,i)=>{l.linear+=2;return q/(m.h[i]+mu)});let nrz=dot(r,z,l);if(!(rz>0)||!Number.isFinite(nrz))break;
  let beta=nrz/rz;l.linear++;v=z.map((q,i)=>{l.linear+=2;return q+beta*v[i]});rz=nrz;
 }return x;
}
function solve(p,mode,budget=Infinity){
 let {raw,l}=metered(budget),best=null,stop="completed",telemetry={accepted:0,rejected:0,cacheHits:0,modelBuilds:0,fullSteps:0,approxSteps:0,fallbackSteps:0,failures:0};
 let r=rng(p.seed+90000),rm=rng(p.seed+390000);
 function better(a,b){l.frontier++;return a.m.success!==b.m.success?a.m.success:a.m.loss<b.m.loss-1e-18||Math.abs(a.m.loss-b.m.loss)<=1e-18&&a.path.length<b.path.length}
 function consider(cur){if(!best||better(cur,best))best=cur}
 try{
 let origin=startState(p,l);best=origin;let aligned=align(origin,p,l);consider(aligned.root);
 for(let restart=0;restart<8&&!best.m.success;restart++){
  l.restarts++;let limit=Math.floor((restart+1)*4096/8),{root,free,pins}=aligned,cur=root,mu=1e-3,planes=allPlanes(free),d=planes.length;
  if(restart){for(let k=0;k<free.length-1;k++){if(raw.rotations>=limit)break;let theta=(r()-.5)*Math.PI;l.angles++;cur=step(cur,{i:free[k],j:free[k+1],c:Math.cos(theta),s:Math.sin(theta)},p,l);auditPins(cur,p,pins,l)}consider(cur)}
  let cache=null,stalls=0;
  for(let it=0;it<120&&!best.m.success&&mu<1e12;it++){
   if(!d||raw.rotations+d>limit)break;
   l.iterations++;l.cache++;
   if(cache){if(cache.state!==cur)throw Error("stale cache");telemetry.cacheHits++}else{cache=model(cur,p,planes,l);telemetry.modelBuilds++}
   diag(cache,l);
   let fallback=mode!=="P8C+"&&mode!=="DIAG"&&(cur.m.loss<=1e-5||stalls>=2);
   let delta;
   if(mode==="P8C+"||fallback){delta=block(cache,Array.from({length:d},(_,i)=>i),mu,l);telemetry.fullSteps++;if(fallback){telemetry.fallbackSteps++;stalls=0}}
   else{telemetry.approxSteps++;
    if(mode==="PCG3")delta=pcg(cache,mu,l);
    else{delta=diagStep(cache,mu,l);if(mode==="B"||mode==="RB"){let idx=select(cache,mode,mu,rm,l),b=block(cache,idx,mu,l);if(!b)delta=null;else for(let i=0;i<idx.length;i++){l.linear++;delta[idx[i]]=b[i]}}}
   }
   if(!delta||!delta.every(Number.isFinite)){telemetry.failures++;break}
   let mx=Math.max(...delta.map(Math.abs)),sc=mx>.5?.5/mx:1,trial=cur;for(let k=0;k<d;k++){let theta=delta[k]*sc;if(Math.abs(theta)<1e-15)continue;let [i,j]=planes[k];l.angles++;trial=step(trial,{i,j,c:Math.cos(theta),s:Math.sin(theta)},p,l);auditPins(trial,p,pins,l)}
   let relative=(cur.m.loss-trial.m.loss)/Math.max(cur.m.loss,1e-30);
   consider(trial);if(trial.m.success||trial.m.loss<cur.m.loss){cur=trial;cache=null;mu=Math.max(1e-12,mu/3);telemetry.accepted++}else{mu*=10;telemetry.rejected++}
   if(!fallback){if(relative<1e-3)stalls++;else stalls=0}
  }
 }
 }catch(e){if(e!==BUDGET)throw e;stop="work cap"}
 if(!best)throw Error("budget too low");let verification=verify(p.start,best,p.scale);
 return {seed:p.seed,cell:p.cell,n:p.n,family:p.family,chords:p.chords,mode,budget:Number.isFinite(budget)?budget:null,success:best.m.success,loss:best.m.loss,rotations:raw.rotations,work:work(raw),ledger:raw,stop,path:best.path,verification,telemetry};
}
function run(ids,old,budget=2000000){return ids.flatMap(seed=>{let p=problem(seed);return modes.map(mode=>mode==="P8C"?old.solveNew(p,mode,{},budget):solve(p,mode,budget))})}
function summarize(rows){let out=[];for(let budget of [2000000,null])for(let n of ["all",6,7,8])for(let mode of modes){let a=rows.filter(r=>r.budget===budget&&r.mode===mode&&(n==="all"||r.n===n));if(!a.length)continue;let base=rows.filter(r=>r.budget===budget&&r.mode==="P8C+"&&a.some(q=>q.seed===r.seed));let mean=f=>a.reduce((s,x)=>s+f(x),0)/a.length;
 let wins=a.filter(x=>x.success&&!base.find(b=>b.seed===x.seed)?.success).map(x=>x.seed),losses=a.filter(x=>!x.success&&base.find(b=>b.seed===x.seed)?.success).map(x=>x.seed);
 out.push({budget,n,mode,cases:a.length,success:a.filter(x=>x.success).length,meanWork:mean(x=>x.work),meanRotations:mean(x=>x.rotations),meanLinear:mean(x=>x.ledger.linear),meanSelection:mean(x=>x.ledger.selection??0),meanCache:mean(x=>x.ledger.cache??0),meanIterations:mean(x=>x.ledger.iterations),meanCacheHits:mean(x=>x.telemetry?.cacheHits??0),meanFallback:mean(x=>x.telemetry?.fallbackSteps??0),meanAccepted:mean(x=>x.telemetry?.accepted??0),meanRejected:mean(x=>x.telemetry?.rejected??0),wins,losses})}return out}
module.exports={generate,problem,solve,run,summarize,target,modes,verify,metric,L};
if(require.main===module){let fs=require("node:fs"),old=require("./rotation_pursuit.cjs"),rows=[...run(target,old),...run(target,old,Infinity)].map(({path,...r})=>({...r,stages:path.length}));fs.writeFileSync("results/rotation_precision_reproduced.json",JSON.stringify({summary:summarize(rows),rows},null,2));console.log(JSON.stringify(summarize(rows),null,2))}
