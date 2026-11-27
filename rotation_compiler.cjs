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


const target=Array.from({length:72},(_,i)=>77000+i),negative=Array.from({length:12},(_,i)=>77100+i);
const modes=["F8","INIT8","NL8","COMP-U8","COMP-G8","COMP-G8S"];
const ledger=()=>({...L(),jacobian:0,linear:0,iterations:0,restarts:0,align:0,deriv:0,organ:0,assembly:0,dot:0,orthogonalize:0,selection:0,cache:0});
const work=l=>Object.values(l).reduce((a,b)=>a+b,0);
function addLedger(a,b){for(const k of Object.keys(a))a[k]+=b[k];return a}
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


function rngMix(seed){let m=Math.imul(seed^(seed>>>16),0x45d9f3b);m=Math.imul(m^(m>>>16),0x45d9f3b);return rng((m^(m>>>16))>>>0)}
function generate(seed){
 let neg=seed>=77100,index=neg?seed-77100:seed-77000,n=6+(neg?index%3:Math.floor(index/24)),type=neg?0:Math.floor(index%24/4),N=n+2,r=rngMix(seed);
 let pool=Array.from({length:n},(_,i)=>i+1);for(let i=n-1;i>0;i--){let j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
 let [u,v]=[[pool.slice(0,1),pool.slice(1,4)],[pool.slice(0,2),pool.slice(2,5)],[pool.slice(0,3),pool.slice(3,6)],[pool.slice(0,1),pool.slice(0,2)],[pool.slice(0,1),pool.slice(0,3)],[pool.slice(0,2),pool.slice(1,3)]][type];
 if(seed%2)[u,v]=[v,u];
 let A=Array.from({length:N},()=>Array(N).fill(0)),mask=Array.from({length:N},()=>Array(N).fill(false));
 for(let i=0;i<N;i++)A[i][i]=12+Math.floor(r()*9);
 function edge(i,j){if(mask[i][j])return;mask[i][j]=mask[j][i]=true;A[i][j]=A[j][i]=1+Math.floor(r()*7)}
 for(let i=1;i<n;i++)edge(i,i+1);for(let i=1;i<=n-4;i++)edge(i,i+2);
 for(let i of u)edge(0,i);for(let i of v)edge(N-1,i);
 if(neg){let i=u[0];A[N-1][i]=A[i][N-1]=3}
 let generation=L(),c=neg?{A,path:[]}:canon(A,generation);
 return {seed,n,type,neg,mask,scale:Math.max(...A.flat().map(Math.abs)),target:neg?null:A,start:c.A,canonicalPath:c.path,generation};
}
function problem(seed){let {target,canonicalPath,generation,type,neg,...p}=generate(seed);return p}
function rot(i,j,t,l){l.angles++;return {i,j,c:Math.cos(t),s:Math.sin(t)}}
function compile(p,l){
 let n=p.n,free=Array.from({length:n},(_,i)=>i+1),ports=[0,n+1],supports=ports.map(k=>free.filter(i=>{l.organ++;return p.mask[k][i]}));
 if(supports.some(s=>!s.length))return {unsupported:"empty"};
 if(supports[1].length===1&&supports[0].includes(supports[1][0])){ports.reverse();supports.reverse()}
 let [u,v]=supports,over=u.filter(x=>v.includes(x)),union=[...new Set([...u,...v])].sort((a,b)=>a-b);
 let a=p.start[ports[0]].slice(1,n+1),b=p.start[ports[1]].slice(1,n+1);
 if(!over.length&&a.concat(b).every(Number.isSafeInteger)){let cross=0n;for(let i=0;i<n;i++){l.organ+=2;cross+=BigInt(a[i])*BigInt(b[i])}if(cross!==0n)return {certificate:{kind:"integer-disjoint-Gram",supports,dot:cross.toString(),u:a,v:b}}}
 let aa=dot(a,a,l),bb=dot(b,b,l),ab=dot(a,b,l);l.organ+=4;
 if(!(aa>0&&bb>0&&aa*bb-ab*ab>1e-12*aa*bb))return {unsupported:"rank"};
 if(!over.length&&Math.abs(ab)>1e-12*Math.sqrt(aa*bb))return {unsupported:"nonzero floating Gram"};
 let kind=!over.length?"disjoint":u.length===1?"nested":"partial",x=u[0],y=(kind==="disjoint"?v:union).find(j=>j!==x);
 let inner=free.filter(i=>i!==x&&i!==y),base=allPlanes(inner),tails=[];
 function chain(anchor,arr){for(let j of arr)if(j!==anchor)tails.push([anchor,j])}
 if(kind==="disjoint"){chain(x,u);chain(y,v)}
 else if(kind==="nested")chain(y,v.filter(i=>i!==x));
 else{chain(y,union.filter(i=>i!==x));chain(x,union)}
 let B=p.start,path=[];
 function alignRow(k,anchor,allowed){for(let j of allowed){l.organ++;if(j===anchor||Math.abs(B[k][j])/p.scale<1e-15)continue;let q=pivot(B,anchor,j,k,j,l);B=rotate(B,q,l);path.push(q);l.align++}}
 alignRow(ports[0],x,free);alignRow(ports[1],y,free.filter(j=>j!==x));
 for(let i of free){l.score+=2;if(i!==x&&Math.abs(B[ports[0]][i])/p.scale>1e-12||i!==x&&i!==y&&Math.abs(B[ports[1]][i])/p.scale>1e-12)throw Error("alignment")}
 // Conservative symbolic support propagation from aligned port frame.
 let sets=[new Set([x]),new Set(kind==="disjoint"?[y]:[x,y])];
 for(let [i,j] of tails)for(let s of sets){l.organ++;if(s.has(i)||s.has(j)){s.add(i);s.add(j)}}
 let prune=[];for(let h=0;h<2;h++)for(let i of free){l.organ++;if(!sets[h].has(i)&&!p.mask[ports[h]][i])prune.push([Math.min(ports[h],i),Math.max(ports[h],i)])}
 if(!p.mask[0][n+1]&&p.start[0][n+1]===0)prune.push([0,n+1]);
 let proof={kind,ports,supports,anchors:[x,y],base, tails,propagated:sets.map(s=>[...s].sort((a,b)=>a-b)),prune,dimension:base.length+tails.length};
 return {B,path,base,tails,proof,prune:new Set(prune.map(x=>x.join(":")))};
}
function endpoint(B,path,angles,c,p,l){let A=B,ts=c.tails.map(([i,j],k)=>rot(i,j,angles[k],l));for(let q of ts)A=rotate(A,q,l);return {B,basePath:path,angles,ts,A,path:[...path,...ts],m:metric(A,p,l)}}
function seedState(c,p,restart,r,ra,l){let B=c.B,path=c.path.slice();let inner=[...new Set(c.base.flat())].sort((a,b)=>a-b);
 if(restart)for(let k=0;k<inner.length-1;k++){let q=rot(inner[k],inner[k+1],(r()-.5)*Math.PI,l);B=rotate(B,q,l);path.push(q)}
 let angles=c.tails.map((_,k)=>restart?(ra()-.5)*2*Math.PI:(k%2?-1:1)*Math.PI/4);return endpoint(B,path,angles,c,p,l)}
function trialChart(cur,delta,c,p,l){let B=cur.B,path=cur.basePath.slice();for(let k=0;k<c.base.length;k++){let t=delta[k];if(Math.abs(t)<1e-15)continue;let q=rot(...c.base[k],t,l);B=rotate(B,q,l);path.push(q)}return endpoint(B,path,cur.angles.map((a,k)=>a+delta[c.base.length+k]),c,p,l)}
function trialFull(cur,delta,planes,p,l){let A=cur.A,path=cur.path.slice();for(let k=0;k<planes.length;k++){let t=delta[k];if(Math.abs(t)<1e-15)continue;let q=rot(...planes[k],t,l);A=rotate(A,q,l);path.push(q)}return {A,path,m:metric(A,p,l)}}
function terms(cur,c,k,l){
 let base=k<c.base.length,[i,j]=base?c.base[k]:c.tails[k-c.base.length],n=cur.A.length;
 let u=Array(n).fill(0),v=Array(n).fill(0);u[i]=1;v[j]=1;
 for(let q of cur.ts.slice(base?0:k-c.base.length+1)){for(let a of [u,v]){let x=a[q.i],y=a[q.j];a[q.i]=q.c*x+q.s*y;a[q.j]=-q.s*x+q.c*y;l.arithmetic+=6}}
 let ts=[];for(let a=1;a<n-1;a++)for(let b=a+1;b<n-1;b++){l.arithmetic+=3;let z=u[a]*v[b]-u[b]*v[a];if(z!==0)ts.push([a,b,z])}return ts
}
function dchart(cur,a,b,ts,l){let s=0;for(let [i,j,t] of ts){l.arithmetic+=2;s+=t*deriv(cur.A,a,b,i,j,l)}return s}
function leak(cur,c,p,l){let z=0;for(let [i,j] of c.proof.prune){l.score++;z=Math.max(z,Math.abs(cur.A[i][j])/p.scale)}if(z>1e-12)throw Error("compiled support leak");return z}
function rawAudit(p){let l=ledger(),c=compile(p,l);if(!c.proof)throw Error("compile");let cur=endpoint(c.B,c.path,c.tails.map((_,k)=>.37+.13*k),c,p,l),max=0,eps=1e-5,d=c.proof.dimension;for(let k=0;k<d;k++){let dx=Array(d).fill(0);dx[k]=eps;let plus=trialChart(cur,dx,c,p,l);dx[k]=-eps;let minus=trialChart(cur,dx,c,p,l),ts=terms(cur,c,k,l);for(let i=0;i<p.n+2;i++)for(let j=0;j<p.n+2;j++){let v=dchart(cur,i,j,ts,l);max=Math.max(max,Math.abs((plus.A[i][j]-minus.A[i][j])/(2*eps)-v)/p.scale)}}return {seed:p.seed,max,leak:leak(cur,c,p,l),proof:c.proof,ledger:l}}
function residualH(A,p,c,prune,smooth,l){let res=residual(A,p,l);if(prune)res.f=res.f.filter(x=>{l.organ++;return !c.prune.has(x.i+":"+x.j)});res.values=[...res.f.map(x=>x.x),...res.r.map(x=>smooth?0:Math.max(0,res.floor-Math.abs(x.x)))];return res}
function modelH(cur,p,c,chart,prune,smooth,planes,l){
 let res=residualH(cur.A,p,c,prune,smooth,l),r=res.values,d=chart?c.proof.dimension:planes.length;
 let J=Array.from({length:d},(_,k)=>{
 let ts=chart?terms(cur,c,k,l):null,[i,j]=chart?[0,0]:planes[k];
 let diff=v=>{l.jacobian++;return (chart?dchart(cur,v.i,v.j,ts,l):deriv(cur.A,v.i,v.j,i,j,l))/p.scale};
 let dm=!smooth&&res.mx/10>1e-6?Math.sign(res.r[res.im].x)*diff(res.r[res.im])/10:0;
 return [...res.f.map(diff),...res.r.map(v=>{l.jacobian++;return !smooth&&res.floor>Math.abs(v.x)?dm-Math.sign(v.x)*diff(v):0})]});
 l.cache++;return {state:cur,J,r,res,g:null,h:null,G:[]}
}
function normalize(v,l){let z=Math.sqrt(dot(v,v,l));l.linear++;return {z,q:z>1e-9?v.map(x=>{l.linear++;return x/z}):null}}
function sub(v,q,t,l){for(let i=0;i<v.length;i++){l.linear+=2;v[i]-=t*q[i]}}
function nullModel(m,p,l){
 let d=m.J.length,qs=[],rhs=[],part=Array(d).fill(0);
 for(let k=0;k<m.res.f.length;k++){let e=m.res.f[k];if(e.i!==0&&e.j!==p.n+1||e.i===0&&e.j===p.n+1)continue;
 let v=m.J.map(a=>a[k]),b=-m.r[k];for(let j=0;j<qs.length;j++){let t=dot(v,qs[j],l);sub(v,qs[j],t,l);b-=t*rhs[j];l.linear+=2}
 let {z,q}=normalize(v,l);if(q){qs.push(q);rhs.push(b/z);l.linear++}}
 for(let j=0;j<qs.length;j++)sub(part,qs[j],-rhs[j],l);
 let basis=[];for(let i=0;i<d;i++){let v=Array(d).fill(0);v[i]=1;for(let q of [...qs,...basis])sub(v,q,dot(v,q,l),l);let {q}=normalize(v,l);if(q)basis.push(q)}
 function apply(v){let r=Array(m.r.length).fill(0);for(let i=0;i<d;i++)for(let j=0;j<r.length;j++){l.linear+=2;r[j]+=m.J[i][j]*v[i]}return r}
 let shift=apply(part),r=m.r.map((x,i)=>{l.linear++;return x+shift[i]});return {part,basis,m:{J:basis.map(apply),r,g:null,h:null,G:[]}}
}
function value(cur,p,c,prune,smooth,l){if(!smooth)return cur.m.loss;let v=residualH(cur.A,p,c,prune,true,l).values;return dot(v,v,l)}
function solveH(p,mode,budget=Infinity){
 let {raw,l}=metered(budget),best=null,stop="completed",chart=mode.startsWith("COMP"),prune=chart&&mode!=="COMP-U8",smoothMode=mode==="COMP-G8S",nl=mode==="NL8",c=null;
 let telemetry={accepted:0,rejected:0,cacheHits:0,modelBuilds:0,stageTransitions:0,maxLeak:0,maxPortDrift:0,dimension:0,pruned:0,minNullDim:null,maxNullDim:null};
 let r=rng(p.seed+90000),ra=rng(p.seed+590000),planes=allPlanes(Array.from({length:p.n},(_,i)=>i+1));
 function better(a,b){l.frontier++;return a.m.success!==b.m.success?a.m.success:a.m.loss<b.m.loss-1e-18||Math.abs(a.m.loss-b.m.loss)<=1e-18&&a.path.length<b.path.length}
 function consider(cur){if(chart)telemetry.maxLeak=Math.max(telemetry.maxLeak,leak(cur,c,p,l));if(nl)for(let k of [0,p.n+1])for(let i=1;i<=p.n;i++){l.score++;if(!p.mask[k][i])telemetry.maxPortDrift=Math.max(telemetry.maxPortDrift,Math.abs(cur.A[k][i])/p.scale)}if(!best||better(cur,best))best=cur}
 try{
 c=compile(p,l);
 if(c.certificate)return {seed:p.seed,n:p.n,mode,budget:Number.isFinite(budget)?budget:null,certificate:c.certificate,success:false,rotations:raw.rotations,work:work(raw),ledger:raw,stop:"certificate",telemetry};
 if(!c.proof)throw Error("unsupported "+c.unsupported);
 let d=chart?c.proof.dimension:planes.length;telemetry.dimension=d;telemetry.pruned=prune?c.proof.prune.length:0;
 for(let restart=0;restart<8&&!best?.m.success;restart++){
  l.restarts++;let limit=(restart+1)*512,cur=seedState(c,p,restart,r,ra,l),mu=1e-3,smooth=smoothMode,sa=0,st=0,cache=null;consider(cur);let loss=value(cur,p,c,prune,smooth,l);
  for(let it=0;it<120&&!best.m.success;it++){
   if(smooth&&(loss<=1e-3||sa>=12||st>=20||mu>=1e12||raw.rotations>=limit-256)){smooth=false;loss=cur.m.loss;cache=null;mu=1e-3;telemetry.stageTransitions++}
   if(mu>=1e12||raw.rotations+d>limit)break;
   l.iterations++;l.cache++;if(cache){if(cache.state!==cur)throw Error("stale");telemetry.cacheHits++}else{cache=modelH(cur,p,c,chart,prune,smooth,planes,l);telemetry.modelBuilds++;if(nl)cache.null=nullModel(cache,p,l)}
   let m=nl?cache.null.m:cache,dim=m.J.length,delta;
   if(nl){telemetry.minNullDim=Math.min(telemetry.minNullDim??dim,dim);telemetry.maxNullDim=Math.max(telemetry.maxNullDim??dim,dim)}
   if(dim){diag(m,l);delta=block(m,Array.from({length:dim},(_,i)=>i),mu,l);if(!delta)break}else delta=[];
   if(nl){let v=cache.null.part.slice();for(let i=0;i<dim;i++)sub(v,cache.null.basis[i],-delta[i],l);delta=v}
   if(!delta.every(Number.isFinite))break;
   let norm=Math.sqrt(dot(delta,delta,l));l.linear++;let sc=norm>.5?.5/norm:1,dx=delta.map(x=>x*sc);
   let trial=chart?trialChart(cur,dx,c,p,l):trialFull(cur,dx,planes,p,l),val=value(trial,p,c,prune,smooth,l);consider(trial);st++;
   if(trial.m.success||val<loss){cur=trial;loss=val;cache=null;mu=Math.max(1e-12,mu/3);sa++;telemetry.accepted++}else{mu*=10;telemetry.rejected++}
  }
 }
 }catch(e){if(e!==BUDGET)throw e;stop="work cap"}
 if(!best)throw Error("no endpoint");let verification=verify(p.start,best,p.scale);
 return {seed:p.seed,n:p.n,mode,budget:Number.isFinite(budget)?budget:null,success:best.m.success,loss:best.m.loss,rotations:raw.rotations,work:work(raw),ledger:raw,stop,path:best.path,verification,telemetry,proof:c.proof};
}
function run(ids,old,budget=2000000){return ids.flatMap(seed=>{let p=problem(seed),type=generate(seed).type;return modes.map(mode=>({...mode==="F8"?old.solveGeo(p,mode,budget):solveH(p,mode,budget),type}))})}
function summarize(rows){let out=[];for(let budget of [2000000,null])for(let group of ["all",6,7,8,"t0","t1","t2","t3","t4","t5"])for(let mode of modes){let a=rows.filter(r=>r.budget===budget&&r.mode===mode&&(group==="all"||r.n===group||"t"+r.type===group));if(!a.length)continue;let mean=f=>a.reduce((s,x)=>s+f(x),0)/a.length;
 let pair=base=>{let b=rows.filter(r=>r.budget===budget&&r.mode===base);return {wins:a.filter(x=>x.success&&!b.find(y=>y.seed===x.seed)?.success).map(x=>x.seed),losses:a.filter(x=>!x.success&&b.find(y=>y.seed===x.seed)?.success).map(x=>x.seed)}};
 out.push({budget,group,mode,n:a.length,success:a.filter(x=>x.success).length,meanWork:mean(x=>x.work),meanLinear:mean(x=>x.ledger.linear),meanRotations:mean(x=>x.rotations),meanDimension:mean(x=>x.telemetry.dimension),meanPruned:mean(x=>x.telemetry.pruned??0),maxLeak:Math.max(...a.map(x=>x.telemetry.maxLeak??0)),maxPortDrift:Math.max(...a.map(x=>x.telemetry.maxPortDrift??0)),vsInit:pair("INIT8"),vsUnpruned:pair("COMP-U8")})}return out}
module.exports={generate,problem,compile,rawAudit,solveH,run,summarize,target,negative,modes,verify,metric,L,ledger};
if(require.main===module){let fs=require("node:fs"),old=require("./rotation_geometry.cjs"),rows=[...run(target,old),...run(target,old,Infinity)].map(({path,...r})=>({...r,stages:path.length})),neg=negative.map(seed=>({seed,certificate:solveH(problem(seed),"COMP-G8",2000000),baseline:old.solveGeo(problem(seed),"F8",2000000)}));fs.writeFileSync("results/rotation_compiler_reproduced.json",JSON.stringify({summary:summarize(rows),rows,neg},null,2));console.log(JSON.stringify(summarize(rows).filter(x=>x.group==="all"),null,2))}
