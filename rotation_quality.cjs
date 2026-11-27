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


const target=Array.from({length:32},(_,i)=>83000+i);
const modes=["R0","R1","R2","R3","R4","TOP4+4","AC","MIX"];
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
 let index=seed-83000,n=8+Math.floor(index/16),type=index%2,N=n+2,r=rngMix(seed);
 let pool=Array.from({length:n},(_,i)=>i+1);for(let i=n-1;i>0;i--){let j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
 let [u,v]=type===0?[pool.slice(0,5),[pool[0],pool[1],pool[2],pool[5],pool[6]]]:[pool.slice(0,5),[pool[0],pool[1],pool[2],pool[3],pool[5]]];
 if(Math.floor(index/2)%2)[u,v]=[v,u];
 let A=Array.from({length:N},()=>Array(N).fill(0)),mask=Array.from({length:N},()=>Array(N).fill(false));
 for(let i=0;i<N;i++)A[i][i]=12+Math.floor(r()*9);
 function edge(i,j){if(mask[i][j])return;mask[i][j]=mask[j][i]=true;A[i][j]=A[j][i]=1+Math.floor(r()*7)}
 for(let i=1;i<n;i++)edge(i,i+1);for(let i=1;i<=n-4;i++)edge(i,i+2);
 for(let i of u)edge(0,i);for(let i of v)edge(N-1,i);
 let generation=L(),c=canon(A,generation);
 return {seed,n,type,mask,scale:Math.max(...A.flat().map(Math.abs)),target:A,start:c.A,canonicalPath:c.path,generation};
}
function problem(seed){let {target,canonicalPath,generation,type,...p}=generate(seed);return p}
function rot(i,j,t,l){l.angles++;return {i,j,c:Math.cos(t),s:Math.sin(t)}}
function exactGram(a,b,l){if(!a.concat(b).every(Number.isSafeInteger))return null;let x=0n,y=0n,z=0n;for(let i=0;i<a.length;i++){l.organ+=6;let u=BigInt(a[i]),v=BigInt(b[i]);x+=u*u;y+=v*v;z+=u*v}return {x,y,z,det:x*y-z*z}}
function REFUTE_GRAM(st,l){let {exact:e,over,u,v,a,b,ports}=st;if(!e||e.x===0n||e.y===0n)return null;let kind=!over.length&&e.z!==0n?"disjoint-nonzero":over.length===1&&e.z===0n?"singleton-zero":e.det===0n&&(u.length!==v.length||u.some(i=>!v.includes(i)))?"rank-one-unequal":null;return kind?{kind,ports,supports:[u,v],u:a,v:b,gram:[e.x,e.y,e.z,e.det].map(String)}:null}
function ALIGN_FRAME(st,p,l){
 let {u,v,over,union,rank,ports,free}=st;
 let x=over.length===1&&rank===2?over[0]:u[0],y=rank===1?null:(!over.length?v[0]:over.length===1&&u.length>1&&v.length>1?u.find(i=>i!==x):union.find(i=>i!==x));
 let anchors=rank===1?[x]:[x,y],B=p.start,path=[];
 function alignRow(k,anchor,allowed){for(let j of allowed){l.organ++;if(j===anchor||Math.abs(B[k][j])/p.scale<1e-15)continue;let q=pivot(B,anchor,j,k,j,l);B=rotate(B,q,l);path.push(q);l.align++}}
 alignRow(ports[0],x,free);if(rank===2)alignRow(ports[1],y,free.filter(j=>j!==x));
 for(let h=0;h<2;h++)for(let i of free){l.score++;if(!(h===0?[x]:anchors).includes(i)&&Math.abs(B[ports[h]][i])/p.scale>1e-12)throw Error("alignment")}
 st.B=B;st.path=path;st.anchors=anchors;st.base=allPlanes(free.filter(i=>!anchors.includes(i)));st.factors=[];st.C=[new Set([x]),new Set(rank===1?[x]:!over.length?[y]:[x,y])];st.trace=[{rule:"ALIGN_FRAME",rank,anchors,after:st.C.map(s=>[...s])}];
}
function appendFactor(st,i,j){st.factors.push({kind:"givens",i,j});for(let s of st.C)if(s.has(i)||s.has(j)){s.add(i);s.add(j)}}
function COUPLE_OVERLAP_1(st,l){
 let {rank,u,v,over,anchors,B,ports}=st;if(rank!==2||over.length!==1||u.length===1||v.length===1)return false;
 let [c,p]=anchors,q=v.find(i=>i!==c),norm=Math.hypot(B[ports[1]][c],B[ports[1]][p]),rho=B[ports[1]][c]/norm,sigma=B[ports[1]][p]/norm;l.organ+=8;
 if(Math.abs(rho)<1e-10)return false;
 st.factors.push({kind:"coupled",c,p,q,rho,sigma});st.C=[new Set([c,p]),new Set([c,q])];st.trace.push({rule:"COUPLE_OVERLAP_1",c,p,q,rho,sigma,identity:"-rho*s_alpha + sigma*cos(gamma)*c_alpha = 0",after:st.C.map(s=>[...s])});return true
}
function EXPAND_EXCLUSIVE(st,l){
 let changed=false;
 if(st.rank===1){let a=st.anchors[0],extra=st.u.filter(i=>!st.C[0].has(i));if(extra.length){for(let j of extra){l.organ++;appendFactor(st,a,j)}st.trace.push({rule:"EXPAND_EXCLUSIVE",jointRankOne:true,anchor:a,extra,after:st.C.map(s=>[...s])});changed=true}return changed}
 for(let h=0;h<2;h++){let own=h?st.v:st.u,other=h?st.u:st.v,anchor=[...st.C[h]].find(i=>own.includes(i)&&!other.includes(i)),extra=own.filter(i=>!other.includes(i)&&!st.C[h].has(i));if(anchor!==undefined&&extra.length){for(let j of extra){l.organ++;appendFactor(st,anchor,j)}st.trace.push({rule:"EXPAND_EXCLUSIVE",port:h,anchor,extra,after:st.C.map(s=>[...s])});changed=true}}
 return changed
}
function CONFINE_UNION(st,l){
 if(st.u.every(i=>st.C[0].has(i))&&st.v.every(i=>st.C[1].has(i)))return;
 if(st.rank!==2)throw Error("rank-one fallback");
 // For partial overlap the initial aligned frame is preserved; no exclusive expansions precede this fallback.
 if(st.factors.length)throw Error("nonminimal fallback");
 let [x,y]=st.anchors;
 for(let j of st.union)if(j!==x&&j!==y){l.organ++;appendFactor(st,y,j)}
 for(let j of st.union)if(j!==x){l.organ++;appendFactor(st,x,j)}
 st.trace.push({rule:"CONFINE_UNION",after:st.C.map(s=>[...s])});
}
function compileRules(p,l){
 let n=p.n,free=Array.from({length:n},(_,i)=>i+1),ports=[0,n+1],supports=ports.map(k=>free.filter(i=>{l.organ++;return p.mask[k][i]}));
 if(supports.some(s=>!s.length))return {unsupported:"empty"};
 if(supports[1].length===1&&supports[0].includes(supports[1][0])){ports.reverse();supports.reverse()}
 let [u,v]=supports,over=u.filter(x=>v.includes(x)),union=[...new Set([...u,...v])].sort((a,b)=>a-b),a=p.start[ports[0]].slice(1,n+1),b=p.start[ports[1]].slice(1,n+1),exact=exactGram(a,b,l);
 let st={free,ports,u,v,over,union,a,b,exact},certificate=REFUTE_GRAM(st,l);if(certificate)return {certificate};
 let aa=dot(a,a,l),bb=dot(b,b,l),ab=dot(a,b,l);l.organ+=4;
 if(!(aa>0&&bb>0))return {unsupported:"zero norm"};
 st.rank=exact&&exact.det===0n?1:aa*bb-ab*ab>1e-12*aa*bb?2:0;
 if(!st.rank)return {unsupported:"near rank one"};
 if(st.rank===1&&(u.length!==v.length||u.some(i=>!v.includes(i))))return {unsupported:"rank one support"};
 if(!over.length&&Math.abs(ab)>1e-12*Math.sqrt(aa*bb))return {unsupported:"nonzero floating Gram"};
 ALIGN_FRAME(st,p,l);
 let coupled=COUPLE_OVERLAP_1(st,l);
 if(over.length===1&&u.length>1&&v.length>1&&!coupled)return {unsupported:"near-zero singleton Gram"};
 if(st.rank===1||!over.length||over.length===1)EXPAND_EXCLUSIVE(st,l);
 CONFINE_UNION(st,l);
 let prune=[];for(let h=0;h<2;h++)for(let i of free){l.organ++;if(!st.C[h].has(i)&&!p.mask[ports[h]][i])prune.push([Math.min(ports[h],i),Math.max(ports[h],i)])}
 if(!p.mask[0][n+1]&&p.start[0][n+1]===0)prune.push([0,n+1]);
 let proof={rank:st.rank,ports,supports,anchors:st.anchors,base:st.base,factors:st.factors,trace:st.trace,propagated:st.C.map(s=>[...s].sort((a,b)=>a-b)),prune,dimension:st.base.length+st.factors.length,physicalDimension:st.base.length+st.factors.reduce((a,f)=>a+(f.kind==="coupled"?2:1),0)};
 return {B:st.B,path:st.path,base:st.base,factors:st.factors,proof,prune:new Set(prune.map(x=>x.join(":")))};
}
function compileSynth(p,l,lib){
 let n=p.n,free=Array.from({length:n},(_,i)=>i+1),ports=[0,n+1],supports=ports.map(k=>free.filter(i=>{l.organ++;return p.mask[k][i]}));
 if(supports[0].length>supports[1].length){ports.reverse();supports.reverse()}
 let [u,v]=supports,over=u.filter(i=>v.includes(i)),pu=u.filter(i=>!v.includes(i)),pv=v.filter(i=>!u.includes(i));
 // Generic membership-preserving matching between stored program labels and target labels.
 let chosen=null,map=null;
 for(let item of Object.values(lib)){l.organ++;let t=item.task,shared=t.u.filter(i=>t.v.includes(i)),eu=t.u.filter(i=>!t.v.includes(i)),ev=t.v.filter(i=>!t.u.includes(i));
  if(shared.length!==over.length||eu.length!==pu.length||ev.length!==pv.length)continue;
  map={};for(let [aa,bb] of [[shared,over],[eu,pu],[ev,pv]])aa.forEach((x,i)=>{map[x]=bb[i];l.organ++});chosen=item;break}
 if(!chosen)return {unsupported:"no discovered program"};
 let t=chosen.task,x=map[t.a],y=map[t.b],anchors=[x,y],B=p.start,path=[];
 function alignRow(k,anchor,allowed){for(let j of allowed){l.organ++;if(j===anchor||Math.abs(B[k][j])/p.scale<1e-15)continue;let q=pivot(B,anchor,j,k,j,l);B=rotate(B,q,l);path.push(q);l.align++}}
 alignRow(ports[0],x,free);alignRow(ports[1],y,free.filter(j=>j!==x));
 for(let h=0;h<2;h++)for(let i of free){l.score++;if(!(h===0?[x]:anchors).includes(i)&&Math.abs(B[ports[h]][i])/p.scale>1e-12)throw Error("alignment")}
 let norm=Math.hypot(B[ports[1]][x],B[ports[1]][y]),rho=B[ports[1]][x]/norm,sigma=B[ports[1]][y]/norm;
 if(Math.abs(rho)<1e-10||Math.abs(sigma)<1e-10)return {unsupported:"degenerate discovered domain"};
 // The first normalized vector in the discovered program is +e_a.
 // A negative aligned first row is just an overall row sign, so zeros are unchanged.
 let base=allPlanes(free.filter(i=>!anchors.includes(i))),factors=Array.from({length:chosen.free},()=>({kind:"parameter"})),prune=[];
 for(let h=0;h<2;h++)for(let i of free){l.organ++;if(!supports[h].includes(i))prune.push([Math.min(ports[h],i),Math.max(ports[h],i)])}
 if(!p.mask[0][n+1]&&p.start[0][n+1]===0)prune.push([0,n+1]);
 let proof={kind:"synthesized",name:t.name,ports,supports,anchors,base,program:chosen.program,map,rho,sigma,prune,dimension:base.length+chosen.free,physicalDimension:base.length+chosen.program.length};
 return {B,path,base,factors,proof,synth:{task:t,program:chosen.program,map,rho,sigma},prune:new Set(prune.map(x=>x.join(":")))};
}
function compile(p,l,mode,lib){
 let c=compileSynth(p,l,lib);
 if(mode!=="OLD-INIT"||!c.proof)return c;
 let q=c.proof,[x,y]=q.anchors,union=[...new Set(q.supports.flat())].sort((a,b)=>a-b),factors=[];
 for(let j of union)if(j!==x&&j!==y){l.organ++;factors.push({kind:"givens",i:y,j})}
 for(let j of union)if(j!==x){l.organ++;factors.push({kind:"givens",i:x,j})}
 let prune=[];for(let h=0;h<2;h++)for(let j=1;j<=p.n;j++){l.organ++;if(!union.includes(j)&&!p.mask[q.ports[h]][j])prune.push([Math.min(q.ports[h],j),Math.max(q.ports[h],j)])}
 if(!p.mask[0][p.n+1]&&p.start[0][p.n+1]===0)prune.push([0,p.n+1]);
 let proof={...q,kind:"matched-union",factors,prune,dimension:c.base.length+factors.length,physicalDimension:c.base.length+factors.length};
 return {B:c.B,path:c.path,base:c.base,factors,proof,prune:new Set(prune.map(x=>x.join(":")))};
}
let evaluator=null;
function synthFactors(c,angles,l){
 let meter={numericOps:0},s=c.synth,ev=evaluator(s.task,s.program,angles,s.rho,s.sigma,meter);l.arithmetic+=meter.numericOps;
 let ts=ev.rotations.map(q=>({i:s.map[q.i],j:s.map[q.j],c:q.c,s:q.s}));l.angles+=ts.length;
 return {ts,deps:ev.deps}
}
function clipPhysical(cur,delta,c,p,l){
 let base=c.base.length,angles=cur.angles;
 let v=Array(cur.ts.length).fill(0);
 for(let k=0;k<angles.length;k++)for(let [j,w] of cur.deps[k]){l.arithmetic+=2;v[j]+=delta[base+k]*w}
 let norm=Math.sqrt(dot(delta.slice(0,base),delta.slice(0,base),l)+dot(v,v,l));l.arithmetic+=2;
 let sc=norm>.5?.5/norm:1;
 // OLD-P on this corpus has independent factors only. The Euclidean factor displacement is exact.
 if(!c.synth)return delta.map(x=>x*sc);
 for(let it=0;it<24;it++){
  let a=angles.map((x,k)=>x+sc*delta[base+k]),{ts}=synthFactors(c,a,l),ss=0;
  for(let k=0;k<base;k++){l.arithmetic+=3;ss+=(sc*delta[k])**2}
  for(let k=0;k<ts.length;k++){let x=cur.ts[k],y=ts[k],v=Math.atan2(y.s*x.c-y.c*x.s,y.c*x.c+y.s*x.s);l.arithmetic+=10;ss+=v*v}
  if(ss<=.25+1e-14)return delta.map(x=>x*sc);
  sc*=.5;l.arithmetic++;
 }
 return delta.map(()=>0)
}
function endpoint(B,path,angles,c,p,l){let A=B,ts=[],deps=[];
 if(c.synth){({ts,deps}=synthFactors(c,angles,l));for(let q of ts)A=rotate(A,q,l);return {B,basePath:path,angles,ts,deps,A,path:[...path,...ts],m:metric(A,p,l)}}
 for(let k=0;k<c.factors.length;k++){let f=c.factors[k],g=angles[k],i=ts.length;
 if(f.kind==="givens"){ts.push(rot(f.i,f.j,g,l));deps.push([[i,1]])}
 else{let cg=Math.cos(g),sg=Math.sin(g),h=Math.hypot(f.rho,f.sigma*cg);l.angles+=3;l.arithmetic+=12;
 ts.push({i:f.p,j:f.q,c:cg,s:sg},{i:f.c,j:f.p,c:f.rho/h,s:f.sigma*cg/h});
 deps.push([[i,1],[i+1,-f.rho*f.sigma*sg/(h*h)]])}}
 for(let q of ts)A=rotate(A,q,l);return {B,basePath:path,angles,ts,deps,A,path:[...path,...ts],m:metric(A,p,l)}}
function seedState(c,p,restart,r,ra,l){let B=c.B,path=c.path.slice();let inner=[...new Set(c.base.flat())].sort((a,b)=>a-b);
 if(restart)for(let k=0;k<inner.length-1;k++){let q=rot(inner[k],inner[k+1],(r()-.5)*Math.PI,l);B=rotate(B,q,l);path.push(q)}
 let angles=c.factors.map((_,k)=>restart?(ra()-.5)*2*Math.PI:(k%2?-1:1)*Math.PI/4);return endpoint(B,path,angles,c,p,l)}
function trialChart(cur,delta,c,p,l){let B=cur.B,path=cur.basePath.slice();for(let k=0;k<c.base.length;k++){let t=delta[k];if(Math.abs(t)<1e-15)continue;let q=rot(...c.base[k],t,l);B=rotate(B,q,l);path.push(q)}return endpoint(B,path,cur.angles.map((a,k)=>a+delta[c.base.length+k]),c,p,l)}
function transport(cur,i,j,start,l){let n=cur.A.length,u=Array(n).fill(0),v=Array(n).fill(0);u[i]=1;v[j]=1;
 for(let q of cur.ts.slice(start)){for(let a of [u,v]){let x=a[q.i],y=a[q.j];a[q.i]=q.c*x+q.s*y;a[q.j]=-q.s*x+q.c*y;l.arithmetic+=6}}
 let ts=[];for(let a=1;a<n-1;a++)for(let b=a+1;b<n-1;b++){l.arithmetic+=3;let z=u[a]*v[b]-u[b]*v[a];if(z!==0)ts.push([a,b,z])}return ts}
function terms(cur,c,k,l){if(k<c.base.length)return transport(cur,...c.base[k],0,l);
 let out=[];for(let [i,w] of cur.deps[k-c.base.length])for(let [a,b,z] of transport(cur,cur.ts[i].i,cur.ts[i].j,i+1,l)){l.arithmetic++;out.push([a,b,w*z])}return out}
function trialFull(cur,delta,planes,p,l){let A=cur.A,path=cur.path.slice();for(let k=0;k<planes.length;k++){let t=delta[k];if(Math.abs(t)<1e-15)continue;let q=rot(...planes[k],t,l);A=rotate(A,q,l);path.push(q)}return {A,path,m:metric(A,p,l)}}
function dchart(cur,a,b,ts,l){let s=0;for(let [i,j,t] of ts){l.arithmetic+=2;s+=t*deriv(cur.A,a,b,i,j,l)}return s}
function leak(cur,c,p,l){let z=0;for(let [i,j] of c.proof.prune){l.score++;z=Math.max(z,Math.abs(cur.A[i][j])/p.scale)}if(z>1e-12)throw Error("compiled support leak");return z}
function rawAudit(p,lib){let l=ledger(),c=compile(p,l,"SYN-S",lib);if(!c.proof)throw Error("compile");let cur=endpoint(c.B,c.path,c.factors.map((_,k)=>.37+.13*k),c,p,l),max=0,eps=1e-5,d=c.proof.dimension;for(let k=0;k<d;k++){let dx=Array(d).fill(0);dx[k]=eps;let plus=trialChart(cur,dx,c,p,l);dx[k]=-eps;let minus=trialChart(cur,dx,c,p,l),ts=terms(cur,c,k,l);for(let i=0;i<p.n+2;i++)for(let j=0;j<p.n+2;j++){let v=dchart(cur,i,j,ts,l);max=Math.max(max,Math.abs((plus.A[i][j]-minus.A[i][j])/(2*eps)-v)/p.scale)}}return {seed:p.seed,max,leak:leak(cur,c,p,l),proof:c.proof,ledger:l}}
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
function solveH(p,mode,budget=Infinity,lib={},startOffset=0,starts=8){
 let {raw,l}=metered(budget),best=null,stop="completed",chart=mode!=="OLD-END",prune=chart,smoothMode=true,nl=mode==="NL8",c=null;
 let telemetry={accepted:0,rejected:0,cacheHits:0,modelBuilds:0,stageTransitions:0,maxLeak:0,maxPortDrift:0,dimension:0,pruned:0,minNullDim:null,maxNullDim:null};
 let r=rng(p.seed+90000),ra=rng(p.seed+590000),planes=allPlanes(Array.from({length:p.n},(_,i)=>i+1));
 function better(a,b){l.frontier++;return a.m.success!==b.m.success?a.m.success:a.m.loss<b.m.loss-1e-18||Math.abs(a.m.loss-b.m.loss)<=1e-18&&a.path.length<b.path.length}
 function consider(cur){if(chart)telemetry.maxLeak=Math.max(telemetry.maxLeak,leak(cur,c,p,l));if(nl)for(let k of [0,p.n+1])for(let i=1;i<=p.n;i++){l.score++;if(!p.mask[k][i])telemetry.maxPortDrift=Math.max(telemetry.maxPortDrift,Math.abs(cur.A[k][i])/p.scale)}if(!best||better(cur,best))best=cur}
 try{
 c=compile(p,l,mode,lib);
 if(c.certificate)return {seed:p.seed,n:p.n,mode,budget:Number.isFinite(budget)?budget:null,certificate:c.certificate,success:false,rotations:raw.rotations,work:work(raw),ledger:raw,stop:"certificate",telemetry};
 if(!c.proof)throw Error("unsupported "+c.unsupported);
 let d=chart?c.proof.dimension:planes.length;telemetry.dimension=d;telemetry.pruned=prune?c.proof.prune.length:0;
 for(let skip=1;skip<startOffset;skip++){for(let k=0;k<p.n-3;k++)r();for(let k=0;k<c.factors.length;k++)ra()}
 for(let restart=startOffset;restart<startOffset+starts&&!best?.m.success;restart++){
  l.restarts++;let limit=(restart-startOffset+1)*512,cur=seedState(c,p,restart,r,ra,l),mu=1e-3,smooth=smoothMode,sa=0,st=0,cache=null;consider(cur);let loss=value(cur,p,c,prune,smooth,l);
  for(let it=0;it<120&&!best.m.success;it++){
   if(smooth&&(loss<=1e-3||sa>=12||st>=20||mu>=1e12||raw.rotations>=limit-256)){smooth=false;loss=cur.m.loss;cache=null;mu=1e-3;telemetry.stageTransitions++}
   if(mu>=1e12||raw.rotations+(chart?c.proof.physicalDimension:d)>limit)break;
   l.iterations++;l.cache++;if(cache){if(cache.state!==cur)throw Error("stale");telemetry.cacheHits++}else{cache=modelH(cur,p,c,chart,prune,smooth,planes,l);telemetry.modelBuilds++;if(nl)cache.null=nullModel(cache,p,l)}
   let m=nl?cache.null.m:cache,dim=m.J.length,delta;
   if(nl){telemetry.minNullDim=Math.min(telemetry.minNullDim??dim,dim);telemetry.maxNullDim=Math.max(telemetry.maxNullDim??dim,dim)}
   if(dim){diag(m,l);delta=block(m,Array.from({length:dim},(_,i)=>i),mu,l);if(!delta)break}else delta=[];
   if(nl){let v=cache.null.part.slice();for(let i=0;i<dim;i++)sub(v,cache.null.basis[i],-delta[i],l);delta=v}
   if(!delta.every(Number.isFinite))break;
   let dx;if(mode.endsWith('-P'))dx=clipPhysical(cur,delta,c,p,l);else{let norm=Math.sqrt(dot(delta,delta,l));l.linear++;let sc=norm>.5?.5/norm:1;dx=delta.map(x=>x*sc)}
   let trial=chart?trialChart(cur,dx,c,p,l):trialFull(cur,dx,planes,p,l),val=value(trial,p,c,prune,smooth,l);consider(trial);st++;
   if(trial.m.success||val<loss){cur=trial;loss=val;cache=null;mu=Math.max(1e-12,mu/3);sa++;telemetry.accepted++}else{mu*=10;telemetry.rejected++}
  }
 }
 }catch(e){if(e!==BUDGET)throw e;stop="work cap"}
 if(!best)throw Error("no endpoint");let verification=verify(p.start,best,p.scale);
 return {seed:p.seed,n:p.n,mode,budget:Number.isFinite(budget)?budget:null,success:best.m.success,loss:best.m.loss,rotations:raw.rotations,work:work(raw),ledger:raw,stop,path:best.path,verification,telemetry,proof:c.proof};
}


function setEvaluator(fn){evaluator=fn}



function item(lib,type,id){let group=lib.groups[type?"quad55":"triple55"],x=group.candidates.find(x=>x.id===id);if(!x)throw Error("missing "+id);return {[x.task.name]:x}}
function chosen(lib,type,mode){let group=lib.groups[type?"quad55":"triple55"];return mode.startsWith("R")&&/^R[0-4]$/.test(mode)?group.ranked[Number(mode[1])]:group.policy[mode]}
function single(p,type,lib,id,budget,offset=0,starts=8){return solveH(p,"SYN",budget,item(lib,type,id),offset,starts)}
function portfolio(p,type,lib,ids,budget){
 let first=single(p,type,lib,ids[0],Number.isFinite(budget)?budget/2:Infinity,0,4);
 let second=first.success?null:single(p,type,lib,ids[1],Number.isFinite(budget)?budget-first.work:Infinity,4,4);
 let best=!second||first.success||!second.success&&first.loss<=second.loss?first:second,ledger={...first.ledger};if(second)for(let k in ledger)ledger[k]+=second.ledger[k];
 return {...best,budget:Number.isFinite(budget)?budget:null,work:work(ledger),rotations:ledger.rotations,ledger,phases:[first,second].filter(Boolean).map(({path,...r})=>({success:r.success,work:r.work,rotations:r.rotations,loss:r.loss,restarts:r.ledger.restarts,verification:r.verification,telemetry:r.telemetry,stages:path.length})),telemetry:{...best.telemetry,maxLeak:Math.max(first.telemetry.maxLeak,second?.telemetry.maxLeak??0)},organs:ids}
}
function run(ids,lib,budget=2000000){return ids.flatMap(seed=>{let p=problem(seed),type=generate(seed).type,group=lib.groups[type?"quad55":"triple55"],pol=group.policy;
 return modes.map(mode=>{let id=chosen(lib,type,mode),r=id?single(p,type,lib,id,budget):portfolio(p,type,lib,mode==="AC"?[pol.A,pol.C]:mode==="MIX"?[pol.TOP,pol.NEXT]:[pol.TOP,pol.TOP],budget);return {...r,mode,type,organ:id??null}})})}
function summarize(rows,lib){let out=[];for(let budget of [2000000,null])for(let group of ["all",8,9,"triple55","quad55"])for(let mode of [...modes,"TOP","NEXT","WORST","FIRST","RANDOM"]){let a=rows.filter(r=>r.budget===budget&&(group==="all"||r.n===group||group===(r.type?"quad55":"triple55"))&&(modes.includes(mode)?r.mode===mode:r.organ===chosen(lib,r.type,mode)));if(!a.length)continue;
 let mean=f=>a.reduce((s,x)=>s+f(x),0)/a.length;out.push({budget,group,mode,n:a.length,success:a.filter(x=>x.success).length,meanWork:mean(x=>x.work),meanRotations:mean(x=>x.rotations),meanStarts:mean(x=>x.ledger.restarts)})}return out}
module.exports={generate,problem,compileSynth,rawAudit,solveH,run,summarize,target,modes,verify,metric,L,ledger,setEvaluator,item,chosen};
if(require.main===module){let fs=require("node:fs"),dis=require("./discover_givens.cjs"),lib=JSON.parse(fs.readFileSync("results/rotation_quality_library.json"));setEvaluator(dis.evalProgram);let strip=({path,...r})=>({...r,stages:path.length});let rows=[...run(target,lib),...run(target,lib,Infinity)].map(strip);fs.writeFileSync("results/rotation_quality_reproduced.json",JSON.stringify({summary:summarize(rows,lib),rows},null,2))}
