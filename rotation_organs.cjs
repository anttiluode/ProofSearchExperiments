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


const source=Array.from({length:96},(_,i)=>72000+i),target=Array.from({length:96},(_,i)=>73000+i);
const modes=["P2","P8","A8","V","R","M","ShM","S0","S1","ShS","X"];
const ledger=()=>({...L(),jacobian:0,linear:0,iterations:0,restarts:0,align:0,deriv:0,organ:0});
const work=l=>Object.values(l).reduce((a,b)=>a+b,0);
function addLedger(a,b){for(const k of Object.keys(a))a[k]+=b[k];return a}
function generate(seed){
 const cell=(seed%1000)%8,n=5+(cell&1),family=1+((cell>>1)&1),chords=1+((cell>>2)&1),N=n+2;
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
function solve(p,mode,library={},budget=Infinity,scheduleOverride=null){
 let {raw,l}=metered(budget),best=null,stop="completed",firstSuccessWork=null;
 const full=Array.from({length:p.n},(_,i)=>i+1),starts=mode==="P2"?2:8;
 const r=rng(p.seed+90000),rm=rng(p.seed+190000);
 const chosen=mode==="ShM"||mode==="ShS"?library[p.cell^4]:library[p.cell];
 const learnedMotif=["R","M","ShM","X"].includes(mode),schedule=scheduleOverride??(mode==="S0"?"port":["S1","ShS","X"].includes(mode)?chosen?.schedule:null);
 function better(a,b){l.frontier++;return a.m.success!==b.m.success?a.m.success:a.m.loss<b.m.loss-1e-18||Math.abs(a.m.loss-b.m.loss)<=1e-18&&a.path.length<b.path.length}
 function consider(cur){if(!best||better(cur,best))best=cur}
 try{
 let origin=startState(p,l);best=origin;let aligned=mode==="A8"?{root:origin,free:full,pins:[]}:align(origin,p,l);consider(aligned.root);
 for(let restart=0;restart<starts&&!best.m.success;restart++){
  l.restarts++;let limit=Math.floor((restart+1)*4096/starts),relax=mode==="A8"||(["V","X"].includes(mode)&&restart>=4);
  let {root,free,pins}=relax?{root:origin,free:full,pins:[]}:aligned,cur=root,mu=1e-3,planes=allPlanes(free);
  if(restart){for(let k=0;k<free.length-1;k++){if(raw.rotations>=limit)break;let theta=(r()-.5)*Math.PI;l.angles++;cur=step(cur,{i:free[k],j:free[k+1],c:Math.cos(theta),s:Math.sin(theta)},p,l);auditPins(cur,p,pins,l)}consider(cur)}
  if(!restart&&learnedMotif){l.organ++;let motif=chosen?.motif??[];if(mode==="R"){let cs=candidates(p,planes,l);motif=Array.from({length:motif.length},()=>{l.organ++;return cs[Math.floor(rm()*cs.length)]})}
   for(let c of motif){l.organ++;if(!c||raw.rotations>=limit)break;let [i,j,k,z]=c;if(!free.includes(i)||!free.includes(j)||p.mask[k][z])continue;let a=pivot(cur.A,...c,l);if(a){cur=step(cur,a,p,l);auditPins(cur,p,pins,l)}}consider(cur)}
  for(let it=0;it<120&&!best.m.success&&mu<1e12;it++){
   let active=blockPlanes(p,planes,schedule,it,l),d=active.length;if(!d||raw.rotations+d>limit)break;
   l.iterations++;let res=residual(cur.A,p,l),rr=res.values,J=active.map(([i,j])=>jac(cur.A,res,i,j,p,l));
   let H=J.map((a,i)=>J.map((b,j)=>a.reduce((s,x,k)=>{l.linear+=2;return s+x*b[k]},i===j?mu:0))),g=J.map(a=>-a.reduce((s,x,k)=>{l.linear+=2;return s+x*rr[k]},0)),delta=linear(H,g,l);if(!delta)break;
   let mx=Math.max(...delta.map(Math.abs)),sc=mx>.5?.5/mx:1,trial=cur;for(let k=0;k<d;k++){let theta=delta[k]*sc;if(Math.abs(theta)<1e-15)continue;let [i,j]=active[k];l.angles++;trial=step(trial,{i,j,c:Math.cos(theta),s:Math.sin(theta)},p,l);auditPins(trial,p,pins,l)}
   consider(trial);if(trial.m.success||trial.m.loss<cur.m.loss){cur=trial;mu=Math.max(1e-12,mu/3)}else mu*=10;
  }
 }
 }catch(e){if(e!==BUDGET)throw e;stop="work cap"}
 if(!best)throw Error("budget too low");if(best.m.success)firstSuccessWork=work(raw);
 const verification=verify(p.start,best,p.scale);
 return {seed:p.seed,cell:p.cell,n:p.n,family:p.family,chords:p.chords,mode,budget:Number.isFinite(budget)?budget:null,schedule,success:best.m.success,loss:best.m.loss,rotations:raw.rotations,work:work(raw),ledger:raw,stop,firstSuccessWork,path:best.path,verification};
}
function sourceBatch(ids){return ids.map(seed=>{let p=problem(seed),m=mine(p),schedules=["port","internal","alternating"].map(s=>solve(p,"P8",{},2000000,s));return {seed,cell:p.cell,motif:m.motif,mineLedger:m.ledger,schedules:schedules.map(({path,...r})=>r)}})}
function select(rows){
 let library={},selection=0;
 for(let cell=0;cell<8;cell++){
  let a=rows.filter(x=>{selection++;return x.cell===cell}),freq=new Map;
  for(let x of a){let k=JSON.stringify(x.motif);selection++;freq.set(k,(freq.get(k)??0)+1)}
  let motifs=[...freq].sort((a,b)=>{selection++;return b[1]-a[1]||a[0].localeCompare(b[0])});
  let sched=["port","internal","alternating"].map(s=>{let rr=a.flatMap(x=>x.schedules.filter(y=>{selection++;return y.schedule===s}));return {s,success:rr.filter(y=>y.success).length,work:rr.reduce((v,y)=>v+y.work,0)}});
  sched.sort((a,b)=>{selection++;return b.success-a.success||a.work-b.work||a.s.localeCompare(b.s)});
  library[cell]={motif:JSON.parse(motifs[0][0]),frequency:motifs[0][1],schedule:sched[0].s,sourceCases:a.map(x=>x.seed),scheduleScores:sched}
 }
 return {library,development:rows.reduce((v,r)=>v+work(r.mineLedger)+r.schedules.reduce((s,x)=>s+x.work,0),selection),selection,predictedIds:target};
}
function targetBatch(ids,library,budget=Infinity,arms=modes){return ids.flatMap(seed=>{let p=problem(seed);return arms.map(mode=>solve(p,mode,library,budget))})}
function summary(rows,development){return [...new Set(rows.map(x=>x.budget))].flatMap(budget=>{let a=rows.filter(x=>x.budget===budget),base=a.filter(x=>x.mode==="P8");return modes.map(mode=>{let r=a.filter(x=>x.mode===mode),n=r.length;if(!n)return null;let success=r.filter(x=>x.success).length,meanWork=r.reduce((v,x)=>v+x.work,0)/n,baseline=base.reduce((v,x)=>v+x.work,0)/base.length,saving=baseline-meanWork;return {budget,mode,n,success,meanWork,meanRotations:r.reduce((v,x)=>v+x.rotations,0)/n,breakEven:success>=base.filter(x=>x.success).length&&saving>0?Math.ceil(development/saving):null}}).filter(Boolean)})}
module.exports={generate,problem,solve,mine,sourceBatch,select,targetBatch,summary,source,target,modes};
if(require.main===module){
 const fs=require("node:fs"),phase=process.argv[2];fs.mkdirSync("results",{recursive:true});
 if(phase==="source"){let rows=sourceBatch(source),policy=select(rows);fs.writeFileSync("results/rotation_organs_source.json",JSON.stringify({rows,...policy},null,2));console.log(JSON.stringify(policy,null,2))}
 else if(phase==="target"){let policy=JSON.parse(fs.readFileSync("results/rotation_organs_source.json"));let rows=[...targetBatch(target,policy.library),...targetBatch(target,policy.library,2000000)];let s=summary(rows,policy.development);fs.writeFileSync("results/rotation_organs_target.json",JSON.stringify({summary:s,rows},null,2));console.log(JSON.stringify(s,null,2))}
 else throw Error("use source or target");
}
