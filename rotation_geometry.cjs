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


const target=Array.from({length:96},(_,i)=>76000+i);
const modes=["F8","F2","B2","T2","G2","G8","PERM","SMOOTH","BAND","HOMO"];
const ledger=()=>({...L(),jacobian:0,linear:0,iterations:0,restarts:0,align:0,deriv:0,organ:0,assembly:0,dot:0,orthogonalize:0,selection:0,cache:0});
const work=l=>Object.values(l).reduce((a,b)=>a+b,0);
function addLedger(a,b){for(const k of Object.keys(a))a[k]+=b[k];return a}
function generate(seed){
 const index=seed-76000,n=6+Math.floor(index/32),family=2,chords=index%2?n-4:1,cell=2*(n-6)+index%2,N=n+2;
 let mix=Math.imul(seed^(seed>>>16),0x45d9f3b);mix=Math.imul(mix^(mix>>>16),0x45d9f3b);const r=rng((mix^(mix>>>16))>>>0);
 let A=Array.from({length:N},()=>Array(N).fill(0)),mask=Array.from({length:N},()=>Array(N).fill(false));
 for(let i=0;i<N;i++)A[i][i]=12+Math.floor(r()*9);
 function edge(i,j){if(mask[i][j])return;mask[i][j]=mask[j][i]=true;A[i][j]=A[j][i]=1+Math.floor(r()*7)}
 for(let i=0;i<N-1;i++)edge(i,i+1);
 if(chords===1)edge(1,n);else{edge(1,3);edge(2,n);let left=chords-2;for(let i=1;i<=n-2&&left;i++)if(!mask[i][i+2]){edge(i,i+2);left--}if(left)throw Error('chords')}
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

const chartModes=new Set(["G2","G8","PERM","SMOOTH","BAND","HOMO"]),contModes=new Set(["SMOOTH","BAND","HOMO"]);
function rot(i,j,t,l){l.angles++;return {i,j,c:Math.cos(t),s:Math.sin(t)}}
function gauge(p,l){
 let B=p.start,path=[],n=p.n;
 for(let j=2;j<=n;j++){l.score++;if(Math.abs(B[0][j])/p.scale>1e-12)throw Error("source not aligned")}
 if(Math.abs(B[n+1][1])/p.scale>1e-12)throw Error("port vectors not orthogonal");
 for(let j=3;j<=n;j++){if(Math.abs(B[n+1][j])/p.scale<1e-15)continue;let a=pivot(B,2,j,n+1,j,l);if(a){B=rotate(B,a,l);path.push(a);l.align++}}
 for(let j=1;j<=n;j++)if(j!==2&&Math.abs(B[n+1][j])/p.scale>1e-12)throw Error("load alignment");
 return {B,path};
}
function tail(B,path,a,b,p,l){
 let x=rot(1,p.n-1,a,l),y=rot(2,p.n,b,l),A=rotate(rotate(B,x,l),y,l);
 return {B,basePath:path,a,b,A,path:[...path,x,y],m:metric(A,p,l),tails:[x,y]}
}
function portLeak(A,p,l){let leak=0;for(let k of [0,p.n+1])for(let i=1;i<=p.n;i++){l.score++;if(!p.mask[k][i])leak=Math.max(leak,Math.abs(A[k][i])/p.scale)}if(leak>1e-12)throw Error("chart leak");return leak}
function terms(cur,i,j,l){
 function row(i){for(let q of cur.tails){if(i===q.i)return [[q.i,q.c],[q.j,-q.s]];if(i===q.j)return [[q.i,q.s],[q.j,q.c]]}return [[i,1]]}
 let out=[];for(let [x,a] of row(i))for(let [y,b] of row(j)){l.arithmetic+=2;if(x!==y)out.push([Math.min(x,y),Math.max(x,y),(x<y?1:-1)*a*b])}return out
}
function dchart(cur,a,b,ts,l){let s=0;for(let [i,j,c] of ts){l.arithmetic+=2;s+=c*deriv(cur.A,a,b,i,j,l)}return s}
function chartPlanes(p){return [...allPlanes(Array.from({length:p.n-2},(_,i)=>i+3)),[1,p.n-1],[2,p.n]]}
function chartTrial(cur,delta,p,planes,l){
 let B=cur.B,basePath=cur.basePath.slice(),d=planes.length;
 for(let k=0;k<d-2;k++){let t=delta[k];if(Math.abs(t)<1e-15)continue;let a=rot(...planes[k],t,l);B=rotate(B,a,l);basePath.push(a)}
 return tail(B,basePath,cur.a+delta[d-2],cur.b+delta[d-1],p,l)
}
function rawAudit(p){
 let l=ledger(),g=gauge(p,l),cur=tail(g.B,g.path,.37,-.61,p,l),planes=chartPlanes(p),max=0,eps=1e-5;
 for(let k=0;k<planes.length;k++){let dx=Array(planes.length).fill(0);dx[k]=eps;let plus=chartTrial(cur,dx,p,planes,l);dx[k]=-eps;let minus=chartTrial(cur,dx,p,planes,l);let ts=k<planes.length-2?terms(cur,...planes[k],l):[[...planes[k],1]];
 for(let i=0;i<cur.A.length;i++)for(let j=0;j<cur.A.length;j++){let v=dchart(cur,i,j,ts,l);max=Math.max(max,Math.abs((plus.A[i][j]-minus.A[i][j])/(2*eps)-v)/p.scale)}}
 return {seed:p.seed,max,leak:portLeak(cur.A,p,l),ledger:l}
}
function weights(mode,stage,p){
 if(!contModes.has(mode)||stage===(mode==="SMOOTH"?1:2))return null;
 let hinge=mode==="SMOOTH"?0:stage===0?.05:.25;
 return {hinge:Math.sqrt(hinge),forbidden:(i,j)=>{
 if(mode==="SMOOTH")return 1;
 if(mode==="BAND")return i===0||j===p.n+1||j-i>=(stage===0?3:2)?1:Math.sqrt(.05);
 return Math.abs(p.start[i][j])/p.scale>.05?Math.sqrt(stage===0?.05:.25):1;
 }}
}
function weightedRes(A,p,w,l){
 let res=residual(A,p,l);
 if(w){res.ws=[...res.f.map(x=>w.forbidden(x.i,x.j)),...res.r.map(()=>w.hinge)];res.values=res.values.map((x,i)=>{l.arithmetic++;return x*res.ws[i]})}
 return res
}
function stageLoss(cur,p,w,l){if(!w)return cur.m.loss;let v=weightedRes(cur.A,p,w,l).values;return dot(v,v,l)}
function build(cur,p,planes,w,chart,l){
 if(!chart&&!w)return model(cur,p,planes,l);
 let res=weightedRes(cur.A,p,w,l),r=res.values;
 let J=planes.map(([i,j],k)=>{
  let ts=chart&&k<planes.length-2?terms(cur,i,j,l):[[i,j,1]];
  let diff=v=>{l.jacobian++;return dchart(cur,v.i,v.j,ts,l)/p.scale};
  let dm=res.mx/10>1e-6?Math.sign(res.r[res.im].x)*diff(res.r[res.im])/10:0;
  let col=[...res.f.map(diff),...res.r.map(v=>{l.jacobian++;return res.floor>Math.abs(v.x)?dm-Math.sign(v.x)*diff(v):0})];
  if(w)col=col.map((x,i)=>{l.arithmetic++;return x*res.ws[i]});return col;
 });l.cache++;return {state:cur,J,r,g:null,h:null,G:[],rb:null}
}
function solveGeo(p,mode,budget=Infinity,rotationCap=4096){
 let {raw,l}=metered(budget),best=null,stop="completed",chart=chartModes.has(mode),cont=contModes.has(mode),starts=["F8","G8"].includes(mode)?8:2,
 legacy=["F8","F2"].includes(mode),l2=!["F8","F2","B2"].includes(mode);
 let telemetry={accepted:0,rejected:0,cacheHits:0,modelBuilds:0,fullSteps:0,stageTransitions:0,stageAttempts:[0,0,0],maxPortLeak:0,dimension:chart?((p.n-2)*(p.n-3)/2+2):p.n*(p.n-1)/2};
 let r=rng(p.seed+90000),ra=rng(p.seed+490000);
 function better(a,b){l.frontier++;return a.m.success!==b.m.success?a.m.success:a.m.loss<b.m.loss-1e-18||Math.abs(a.m.loss-b.m.loss)<=1e-18&&a.path.length<b.path.length}
 function consider(cur){if(chart)telemetry.maxPortLeak=Math.max(telemetry.maxPortLeak,portLeak(cur.A,p,l));if(!best||better(cur,best))best=cur}
 try{
 let origin=startState(p,l),g=chart?gauge(p,l):null;
 if(!chart){best=origin;consider(origin)}
 let free=Array.from({length:p.n},(_,i)=>i+1),planes=chart?chartPlanes(p):allPlanes(free),d=planes.length;
 for(let restart=0;restart<starts&&!best?.m.success;restart++){
  l.restarts++;let limit=Math.floor((restart+1)*rotationCap/starts),mid=Math.floor((restart+.5)*rotationCap/starts),cur=origin,mu=1e-3;
  if(chart){
   let B=g.B,path=g.path.slice();
   if(restart){
    if(mode==="PERM"){let pool=free.slice(2);for(let k=pool.length-1;k>0;k--){l.permutation++;let j=Math.floor(r()*(k+1));if(j===k)continue;let a=rot(pool[j],pool[k],Math.PI/2,l);B=rotate(B,a,l);path.push(a)}}
    else for(let j=3;j<p.n;j++){let a=rot(j,j+1,(r()-.5)*Math.PI,l);B=rotate(B,a,l);path.push(a)}
   }
   cur=tail(B,path,restart?(ra()-.5)*2*Math.PI:Math.PI/4,restart?(ra()-.5)*2*Math.PI:-Math.PI/4,p,l);consider(cur)
  }else if(restart){for(let k=0;k<free.length-1;k++){if(raw.rotations>=limit)break;let a=rot(free[k],free[k+1],(r()-.5)*Math.PI,l);cur=step(cur,a,p,l)}consider(cur)}
  let cache=null,stage=0,sa=0,st=0,last=cont?(mode==="SMOOTH"?1:2):0,w=cont?weights(mode,0,p):null,loss=stageLoss(cur,p,w,l);
  for(let it=0;it<120&&!best.m.success;it++){
   if(cont&&stage<last&&(loss<=1e-3||sa>=12||st>=20||mu>=1e12||raw.rotations>=mid)){
    stage=raw.rotations>=mid?last:stage+1;w=weights(mode,stage,p);loss=stageLoss(cur,p,w,l);cache=null;mu=1e-3;sa=0;st=0;telemetry.stageTransitions++;
   }
   if(mu>=1e12||raw.rotations+d>limit)break;
   l.iterations++;l.cache++;if(cache){if(cache.state!==cur)throw Error("stale cache");telemetry.cacheHits++}else{cache=build(cur,p,planes,w,chart,l);telemetry.modelBuilds++}
   diag(cache,l);let delta=block(cache,Array.from({length:d},(_,i)=>i),mu,l);telemetry.fullSteps++;if(!delta||!delta.every(Number.isFinite))break;
   let mx;if(l2){mx=Math.sqrt(dot(delta,delta,l));l.linear++}else mx=Math.max(...delta.map(Math.abs));let sc=mx>.5?.5/mx:1;
   let dx=delta.map(x=>x*sc),trial=cur;
   if(chart)trial=chartTrial(cur,dx,p,planes,l);
   else if(legacy){for(let k=0;k<d;k++){if(Math.abs(dx[k])<1e-15)continue;trial=step(trial,rot(...planes[k],dx[k],l),p,l)}}
   else{let A=cur.A,path=cur.path.slice();for(let k=0;k<d;k++){if(Math.abs(dx[k])<1e-15)continue;let a=rot(...planes[k],dx[k],l);A=rotate(A,a,l);path.push(a)}trial={A,path,m:metric(A,p,l)}}
   let value=stageLoss(trial,p,w,l);consider(trial);st++;telemetry.stageAttempts[stage]++;
   if(trial.m.success||value<loss){cur=trial;loss=value;cache=null;mu=Math.max(1e-12,mu/3);sa++;telemetry.accepted++}else{mu*=10;telemetry.rejected++}
  }
 }
 }catch(e){if(e!==BUDGET)throw e;stop="work cap"}
 if(!best)throw Error("budget too low");let verification=verify(p.start,best,p.scale);
 return {seed:p.seed,n:p.n,cell:p.cell,chords:p.chords,regime:p.chords===1?"over":"square",mode,budget:Number.isFinite(budget)?budget:null,rotationCap,success:best.m.success,loss:best.m.loss,rotations:raw.rotations,work:work(raw),ledger:raw,stop,path:best.path,verification,telemetry};
}
function run(ids,budget=2000000,scaled=false){return ids.flatMap(seed=>{let p=problem(seed),rc=scaled?Math.ceil(4096*(p.n*(p.n-1)/2)/15):4096;return modes.map(mode=>({...solveGeo(p,mode,budget,rc),scaled}))})}
function summarize(rows){let out=[];for(let condition of ["fixed","rotation","scaled"])for(let n of ["all",6,7,8])for(let regime of ["all","over","square"])for(let mode of modes){
 let a=rows.filter(r=>(condition==="fixed"?r.budget!==null:condition==="rotation"?r.budget===null&&!r.scaled:r.scaled)&&r.mode===mode&&(n==="all"||r.n===n)&&(regime==="all"||r.regime===regime));if(!a.length)continue;
 let base=rows.filter(r=>r.mode==="G2"&&a.some(q=>q.seed===r.seed&&q.budget===r.budget&&q.scaled===r.scaled));let mean=f=>a.reduce((s,x)=>s+f(x),0)/a.length;
 let wins=a.filter(x=>x.success&&!base.find(b=>b.seed===x.seed)?.success).map(x=>x.seed),losses=a.filter(x=>!x.success&&base.find(b=>b.seed===x.seed)?.success).map(x=>x.seed);
 out.push({condition,n,regime,mode,cases:a.length,success:a.filter(x=>x.success).length,meanWork:mean(x=>x.work),meanRotations:mean(x=>x.rotations),meanIterations:mean(x=>x.ledger.iterations),meanLinear:mean(x=>x.ledger.linear),meanLoss:mean(x=>x.loss),maxLeak:Math.max(...a.map(x=>x.telemetry.maxPortLeak)),meanStageTransitions:mean(x=>x.telemetry.stageTransitions),wins,losses})}return out}
module.exports={generate,problem,solveGeo,run,summarize,target,modes,verify,metric,L,rawAudit,gauge,tail,chartPlanes};
if(require.main===module){let fs=require("node:fs"),rows=[...run(target),...run(target,Infinity),...run(target,Infinity,true)].map(({path,...r})=>({...r,stages:path.length}));fs.writeFileSync("results/rotation_geometry_reproduced.json",JSON.stringify({summary:summarize(rows),rows},null,2));console.log(JSON.stringify(summarize(rows).filter(x=>x.regime==="all"),null,2))}
