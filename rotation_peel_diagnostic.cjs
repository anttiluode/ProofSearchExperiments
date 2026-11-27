// Gate 14a dense diagnostic reference, not a production LM.
function load(q,g){
 const m={exports:{}},d={exports:{}};new Function("module","require",g)(d,{});new Function("module","require",q+"\nObject.assign(module.exports,{compile,rng,rotate});")(m,{});m.exports.setEvaluator(d.exports.evalProgram);return {f:m.exports,evaluate:d.exports.evalProgram};
}
function engine(dim){
 let ops=0;
 const C=v=>({v,g:Array(dim).fill(0)}),X=(v,i)=>{let a=C(v);a.g[i]=1;return a};
 const add=(a,b)=>{ops+=1+dim;return {v:a.v+b.v,g:a.g.map((x,i)=>x+b.g[i])}};
 const neg=a=>{ops+=1+dim;return {v:-a.v,g:a.g.map(x=>-x)}};
 const sub=(a,b)=>add(a,neg(b));
 const mul=(a,b)=>{ops+=1+3*dim;return {v:a.v*b.v,g:a.g.map((x,i)=>x*b.v+a.v*b.g[i])}};
 const div=(a,b)=>{ops+=1+3*dim;let v=a.v/b.v;return {v,g:a.g.map((x,i)=>(x-v*b.g[i])/b.v)}};
 const sqrt=a=>{ops+=1+dim;let v=Math.sqrt(a.v);return {v,g:a.g.map(x=>x/(2*v))}};
 const sin=a=>{ops+=2+dim;return {v:Math.sin(a.v),g:a.g.map(x=>x*Math.cos(a.v))}};
 const cos=a=>{ops+=2+dim;return {v:Math.cos(a.v),g:a.g.map(x=>-x*Math.sin(a.v))}};
 const dot=(a,b)=>a.reduce((s,x,i)=>add(s,mul(x,b[i])),C(0));
 const norm=a=>sqrt(dot(a,a)),scale=(a,b)=>a.map(x=>mul(x,b)),minus=(a,b)=>a.map((x,i)=>sub(x,b[i]));
 const proj=(v,qs)=>qs.reduce((a,q)=>minus(a,scale(q,dot(a,q))),v);
 const unit=(v,tag)=>{let h=norm(v);if(!(h.v>1e-12))throw Error("singular "+tag+" "+h.v);return v.map(x=>div(x,h))};
 const eye=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>C(+(i===j))));
 const tr=A=>A[0].map((_,j)=>A.map(r=>r[j])),mm=(A,B)=>{let t=tr(B);return A.map(r=>t.map(c=>dot(r,c)))},mv=(A,v)=>A.map(r=>dot(r,v));
 const mat=A=>A.map(r=>r.map(C)),val=A=>A.map(r=>r.map(x=>x.v));
 function givens(A,i,j,c,s){for(let row of A){let a=row[i],b=row[j];row[i]=add(mul(a,c),mul(b,s));row[j]=sub(mul(b,c),mul(a,s))}return A}
 function frame(prefix,m,branch){let q=prefix.slice(),e=eye(m);while(q.length<m){let cand=e.map(v=>proj(v,q)),ns=cand.map(v=>dot(v,v).v),i=ns.indexOf(Math.max(...ns));branch.push(i);q.push(unit(cand[i],"completion"))}return q}
 function detSign(A){let a=val(A),s=1;for(let i=0;i<a.length;i++){let k=i;for(let j=i+1;j<a.length;j++)if(Math.abs(a[j][i])>Math.abs(a[k][i]))k=j;if(k!==i){[a[k],a[i]]=[a[i],a[k]];s=-s}let v=a[i][i];if(Math.abs(v)<1e-10)throw Error("orientation");s*=Math.sign(v);for(let j=i+1;j<a.length;j++){let t=a[j][i]/v;for(let h=i+1;h<a.length;h++)a[j][h]-=t*a[i][h]}}return s}
 return {C,X,add,sub,neg,mul,div,sqrt,sin,cos,dot,norm,scale,minus,proj,unit,eye,tr,mm,mv,mat,val,givens,frame,detSign,work:()=>ops,charge:n=>ops+=n};
}
function peel(mask,n,count){let active=new Set(Array.from({length:n},(_,i)=>i+1)),path=[];for(let k=0;k<count;k++){let leaf=[...active].reverse().find(i=>[...active].filter(j=>mask[i][j]).length===1);if(leaf===undefined)throw Error("no leaf");let next=[...active].find(j=>mask[leaf][j]);if(k&&path.at(-1)!==leaf)throw Error("not chain");if(!k)path.push(leaf);path.push(next);active.delete(leaf)}return path}
function port(E,evaluate,c,theta,N){
 let {task,program,map,rho,sigma}=c.synth,ledger={numericOps:0},ev=evaluate(task,program,theta.map(x=>x.v),rho,sigma,ledger);E.charge(ledger.numericOps);
 let P=E.eye(N);
 for(let k=0;k<ev.rotations.length;k++){let q=ev.rotations[k],a=E.C(q.c),b=E.C(q.s);
  for(let j=0;j<theta.length;j++){let rate=ev.deps[j].find(z=>z[0]===k)?.[1]??0;for(let h=0;h<a.g.length;h++){a.g[h]-=q.s*rate*theta[j].g[h];b.g[h]+=q.c*rate*theta[j].g[h];E.charge(6)}}
  E.givens(P,map[q.i],map[q.j],a,b);
 }return P;
}
function reduced(E,p,c,P,depth,sign,spin,core,witnessU=null){
 let {C,tr,mm,mv,mat,unit,proj,dot,norm,scale,eye,frame,givens}=E,N=p.n+2,W=Array.from({length:p.n},(_,i)=>i+1).filter(i=>!c.proof.anchors.includes(i)),m=W.length;
 let path=peel(p.mask,p.n,depth),branch=[],den=[],dom=[],tar=[];
 let col=k=>P.map(r=>r[k]),restrict=v=>W.map(i=>v[i]),B=mat(c.B);
 for(let k of path){let v=proj(restrict(col(k)),dom);den.push(norm(v).v);dom.push(unit(v,"domain"))}
 if(witnessU)tar.push(mv(witnessU,dom[0]));else{
  let T=eye(m);for(let j=1;j<m;j++)givens(T,0,j,E.cos(spin[j-1]),E.sin(spin[j-1]));tar.push(T.map(r=>r[0]));
 }
 for(let k=0;k<depth;k++){
  let v=col(path[k]),z=restrict(v),out=v.slice();
  for(let i=0;i<m;i++)out[W[i]]=tar.reduce((a,t,j)=>E.add(a,E.mul(t[i],dot(dom[j],z))),C(0));
  let a=proj(restrict(mv(B,out)),tar);den.push(norm(a).v);
  let t=unit(a,"target");let sg=witnessU?Math.sign(dot(t,mv(witnessU,dom[k+1])).v):sign[k];tar.push(scale(t,C(sg)));
 }
 let D=frame(dom,m,branch),T=frame(tar,m,branch),fixed=depth+1;
 if(E.detSign(D)!==E.detSign(T))T[m-1]=scale(T[m-1],C(-1));
 let DD=tr(D),TT=tr(T);
 if(witnessU){
  let K=mm(mm(tr(TT),witnessU),DD);
  let Kc=eye(m);for(let i=fixed;i<m;i++)for(let j=fixed;j<m;j++)Kc[i][j]=K[i][j];
  TT=mm(TT,Kc);
 }else{let z=0;for(let i=fixed;i<m;i++)for(let j=i+1;j<m;j++){let a=core[z++];givens(TT,i,j,E.cos(a),E.sin(a))}}
 let U=mm(TT,tr(DD)),F=eye(N);for(let i=0;i<m;i++)for(let j=0;j<m;j++)F[W[i]][W[j]]=U[i][j];
 let Q=mm(F,P),A=mm(mm(tr(Q),B),Q);
 // Actual identity: projected B U P e_leaf perpendicular to mapped leaf and next axes is zero.
 let identity=0;
 for(let k=0;k<depth;k++){let v=mv(Q,colUnit(E,N,path[k])),z=restrict(mv(B,v));let q=proj(z,tar.slice(0,k+2));identity=Math.max(identity,...q.map(x=>Math.abs(x.v)/p.scale))}
 let leak=0;for(let [i,j] of c.proof.prune)leak=Math.max(leak,Math.abs(A[i][j].v)/p.scale);
 let O=mm(tr(Q),Q),orth=0;for(let i=0;i<N;i++)for(let j=0;j<N;j++)orth=Math.max(orth,Math.abs(O[i][j].v-+(i===j)));
 return {A,Q,U,identity,orth,leak,den,branch,work:E.work()};
}
function colUnit(E,N,k){return Array.from({length:N},(_,i)=>E.C(+(i===k)))}
function sample(p,c,evaluate,x,depth,sign,ad){
 let E=engine(ad?x.length:0),a=x.map((v,i)=>ad?E.X(v,i):E.C(v)),P=port(E,evaluate,c,a.slice(0,7),p.n+2);
 return reduced(E,p,c,P,depth,sign,a.slice(7,7+p.n-3),a.slice(7+p.n-3));
}
function pathMatrix(E,N,path){let Q=E.eye(N);for(let a of path)E.givens(Q,a.i,a.j,E.C(a.c),E.C(a.s));return Q}
function solve(H,b){let C=H.map((r,i)=>[...r,b[i]]),n=b.length;for(let i=0;i<n;i++){let k=i;for(let j=i+1;j<n;j++)if(Math.abs(C[j][i])>Math.abs(C[k][i]))k=j;[C[k],C[i]]=[C[i],C[k]];let v=C[i][i];if(Math.abs(v)<1e-25)return null;for(let j=i;j<=n;j++)C[i][j]/=v;for(let k=0;k<n;k++)if(k!==i){let a=C[k][i];for(let j=i;j<=n;j++)C[k][j]-=a*C[i][j]}}return C.map(r=>r[n])}
function fitPort(p,c,evaluate,target,rng){
 const {task,program,map,rho,sigma}=c.synth,labels=Object.keys(map).map(Number),N=p.n+2;
 let desired=[0,N-1].map((k,h)=>{let norm=Math.hypot(...c.B[k].slice(1,N-1));if(!h)norm*=Math.sign(c.B[k][c.proof.anchors[0]]);return labels.map(j=>target[k][map[j]]/norm)}).flat();
 function model(x){let ev=evaluate(task,program,x,rho,sigma),a=ev.r.flatMap(row=>labels.map(j=>row[j]));let r=a.map((z,i)=>z.v-desired[i]);return {loss:r.reduce((s,z)=>s+z*z,0),r,J:a.map(z=>z.g)}}
 let best={loss:Infinity};
 for(let restart=0;restart<24;restart++){let x=Array.from({length:7},(_,i)=>restart?(rng()-.5)*2*Math.PI:(i%2?-1:1)*Math.PI/4),mu=1e-3;
  try{let a=model(x);for(let k=0;k<120;k++){if(a.loss<best.loss)best={loss:a.loss,x:x.slice(),restart,k};if(a.loss<1e-29)return best;
    let H=Array.from({length:7},(_,i)=>Array.from({length:7},(_,j)=>a.J.reduce((s,row)=>s+row[i]*row[j],i===j?mu:0))),b=Array.from({length:7},(_,i)=>a.J.reduce((s,row,j)=>s-row[i]*a.r[j],0)),dx=solve(H,b);if(!dx)break;
    let h=Math.hypot(...dx),y=x.map((v,i)=>v+dx[i]*Math.min(1,1/h)),z=model(y);if(z.loss<a.loss){x=y;a=z;mu=Math.max(1e-14,mu/3)}else mu*=10;if(mu>1e12)break;
  }}catch(e){if(!String(e).includes("singular dependent"))throw e}
 }return best;
}
function witness(p,g,c,evaluate,depth,rng,fit){
 let E=engine(0),N=p.n+2,W=Array.from({length:p.n},(_,i)=>i+1).filter(i=>!c.proof.anchors.includes(i)),m=W.length;
 let R=E.tr(E.mm(pathMatrix(E,N,g.canonicalPath),pathMatrix(E,N,c.path)));
 let P;if(fit){P=port(E,evaluate,c,fit.x.map(E.C),N)}else{
  let S=E.eye(N);for(let i=0;i<m;i++)for(let j=i+1;j<m;j++){let a=(rng()-.5)*2;E.givens(S,W[i],W[j],E.C(Math.cos(a)),E.C(Math.sin(a)))}P=E.mm(E.tr(S),R);
 }
 let F=E.mm(R,E.tr(P)),U=W.map(i=>W.map(j=>F[i][j])),anchorError=0;
 for(let i=0;i<N;i++)for(let j=0;j<N;j++)if(!W.includes(i)||!W.includes(j))anchorError=Math.max(anchorError,Math.abs(F[i][j].v-+(i===j)));
 let z=reduced(E,p,c,P,depth,[],[],[],U),error=Math.max(...z.A.flatMap((row,i)=>row.map((a,j)=>Math.abs(a.v-g.target[i][j])/p.scale)));
 return {error,anchorError,identity:z.identity,orth:z.orth,leak:z.leak,den:z.den,pass:error<=1e-12&&anchorError<=1e-12&&z.orth<=1e-12&&z.leak<=1e-12};
}
function run(f,evaluate,lib,ids){let rows=[];for(let seed of ids){
 let p=f.problem(seed),g=f.generate(seed),id=f.chosen(lib,g.type,"FIRST"),c=f.compile(p,f.ledger(),"SYN",f.item(lib,g.type,id)),rng=f.rng(seed+140000),fit=fitPort(p,c,evaluate,g.target,rng);
 for(let depth of [1,2]){let m=p.n-2,d=7+m-1+(m-depth-1)*(m-depth-2)/2,conditional,actual;
  try{conditional=witness(p,g,c,evaluate,depth,rng,null)}catch(e){conditional={errorMessage:String(e),pass:false}}
  try{actual=fit.loss<1e-24?witness(p,g,c,evaluate,depth,rng,fit):{pass:false,reason:"port fit"} }catch(e){actual={errorMessage:String(e),pass:false}}
  let samples=[];for(let k=0;k<4;k++){let x=Array.from({length:d},()=>.15+1.1*rng()),sign=[k&1?-1:1,k&2?-1:1];
   try{let z=sample(p,c,evaluate,x,depth,sign,true),err=0,boundary=false;
    for(let j=0;j<d;j++){let a=x.slice(),b=x.slice();a[j]+=1e-6;b[j]-=1e-6;let plus=sample(p,c,evaluate,a,depth,sign,false),minus=sample(p,c,evaluate,b,depth,sign,false);if(String(z.branch)!==String(plus.branch)||String(z.branch)!==String(minus.branch))boundary=true;
     for(let i=0;i<p.n+2;i++)for(let h=0;h<p.n+2;h++)err=Math.max(err,Math.abs((plus.A[i][h].v-minus.A[i][h].v)/2e-6-z.A[i][h].g[j])/p.scale)}
    samples.push({k,sign,err,boundary,identity:z.identity,orth:z.orth,leak:z.leak,den:z.den,adWork:z.work,primalWork:sample(p,c,evaluate,x,depth,sign,false).work,pass:!boundary&&err<=1e-8&&Math.max(z.identity,z.orth,z.leak)<=1e-12});
   }catch(e){samples.push({k,sign,pass:false,errorMessage:String(e)})}
  }rows.push({seed,n:p.n,id,depth,d,path:peel(p.mask,p.n,depth),fit:{loss:fit.loss,restart:fit.restart,k:fit.k},conditional,actual,samples});
 }
 }return rows}
module.exports={load,run};
if(require.main===module){let fs=require("node:fs"),{f,evaluate}=load(fs.readFileSync("rotation_quality.cjs","utf8"),fs.readFileSync("discover_givens.cjs","utf8")),lib=JSON.parse(fs.readFileSync("results/rotation_quality_library.json"));fs.writeFileSync("results/rotation_peel_reproduced.json",JSON.stringify(run(f,evaluate,lib,Array.from({length:32},(_,i)=>83000+i)),null,2))}
