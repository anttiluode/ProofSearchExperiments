// Gate 14a-fast: sparse forward tangents and local frame continuation.
// No changes to the frozen reference or numerical solver.
function load(a,b,c){
 const m={exports:{}},g={exports:{}},r={exports:{}};
 new Function("module","require",c)(g,{});
 new Function("module","require",b+"\nObject.assign(module.exports,{compile,rng,rotate,endpoint,residualH,modelH,diag,block,dot,trialChart,value,leak,work});")(m,{});
 m.exports.setEvaluator(g.exports.evalProgram);
 new Function("module","require",a+"\nObject.assign(module.exports,{engine,port,reduced,sample,fitPort,witness});")(r,{});
 // Reuse the exact reference construction up to Q, without differentiating audits or A.
 let s=a,old="let Q=mm(F,P),A=mm(mm(tr(Q),B),Q);";
 if(s.split(old).length!==2)throw Error("reference anchor");
 s=s.replace(old,"let Q=mm(F,P);return {Q,U,D,T,den,branch};");
 let k={exports:{}};new Function("module","require",s+"\nObject.assign(module.exports,{reduced});")(k,{});
 return {f:m.exports,evaluate:g.exports.evalProgram,ref:r.exports,reduce:k.exports.reduced};
}
function sparse(dim,l,local=null){
 const C=v=>({v,g:new Map()}),X=(v,i)=>({v,g:new Map([[i,1]])});
 const zero=a=>a.v===0&&a.g.size===0;
 function add(a,b){if(zero(a))return b;if(zero(b))return a;l.arithmetic++;let g=new Map(a.g);
  for(let [i,v] of b.g){l.key++;if(g.has(i)){l.arithmetic++;g.set(i,g.get(i)+v)}else g.set(i,v)}return {v:a.v+b.v,g}}
 function neg(a){l.arithmetic+=1+a.g.size;return {v:-a.v,g:new Map([...a.g].map(([i,v])=>[i,-v]))}}
 function mul(a,b){if(zero(a)||zero(b))return C(0);l.arithmetic++;let g=new Map();
  if(b.v!==0)for(let [i,v] of a.g){l.arithmetic++;g.set(i,v*b.v)}
  if(a.v!==0)for(let [i,v] of b.g){l.arithmetic++;l.key++;let t=v*a.v;if(g.has(i)){l.arithmetic++;t+=g.get(i)}g.set(i,t)}
  return {v:a.v*b.v,g}}
 function div(a,b){l.arithmetic++;let v=a.v/b.v,g=new Map();for(let [i,z] of a.g){l.arithmetic++;g.set(i,z/b.v)}if(v!==0)for(let [i,z] of b.g){l.arithmetic+=2;l.key++;let t=-v*z/b.v;if(g.has(i)){l.arithmetic++;t+=g.get(i)}g.set(i,t)}return {v,g}}
 function sqrt(a){l.arithmetic++;let v=Math.sqrt(a.v);return {v,g:new Map([...a.g].map(([i,z])=>{l.arithmetic+=2;return [i,z/(2*v)]}))}}
 function sin(a){l.angles+=2;let v=Math.sin(a.v),c=Math.cos(a.v);return {v,g:new Map([...a.g].map(([i,z])=>{l.arithmetic++;return [i,c*z]}))}}
 function cos(a){l.angles+=2;let v=Math.cos(a.v),s=-Math.sin(a.v);return {v,g:new Map([...a.g].map(([i,z])=>{l.arithmetic++;return [i,s*z]}))}}
 const sub=(a,b)=>add(a,neg(b)),dot=(a,b)=>a.reduce((s,x,i)=>add(s,mul(x,b[i])),C(0)),norm=a=>sqrt(dot(a,a)),scale=(a,b)=>a.map(x=>mul(x,b)),minus=(a,b)=>a.map((x,i)=>sub(x,b[i]));
 const proj=(v,qs)=>qs.reduce((a,q)=>minus(a,scale(q,dot(a,q))),v);
 const unit=(v,tag)=>{let h=norm(v);if(!(h.v>1e-12))throw Error("singular "+tag+" "+h.v);return v.map(x=>div(x,h))};
 const eye=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>C(+(i===j))));
 const tr=A=>A[0].map((_,j)=>A.map(r=>r[j])),mm=(A,B)=>{let t=tr(B);return A.map(r=>t.map(c=>dot(r,c)))},mv=(A,v)=>A.map(r=>dot(r,v));
 const mat=A=>A.map(r=>r.map(C)),val=A=>A.map(r=>r.map(x=>x.v));
 function givens(A,i,j,c,s){for(let row of A){let a=row[i],b=row[j];row[i]=add(mul(a,c),mul(b,s));row[j]=sub(mul(b,c),mul(a,s))}return A}
 let frameNo=0,completionMin=Infinity;
 function frame(prefix,m,branch){let q=prefix.slice(),e=eye(m),ref=local?.[frameNo++];while(q.length<m){
   let v,i;if(ref){i=q.length;v=proj(ref[i].map(C),q)}else{
    // Pivot selection needs values only, not derivatives of rejected candidates.
    let qs=q.map(a=>a.map(x=>C(x.v))),cand=e.map(v=>proj(v,qs)),ns=cand.map(v=>dot(v,v).v);i=ns.indexOf(Math.max(...ns));l.selection+=m;v=proj(e[i],q);
   }
   branch.push(i);let h=norm(v).v;completionMin=Math.min(completionMin,h);q.push(unit(v,"completion"))
 }return q}
 function detSign(A){let a=val(A),s=1;for(let i=0;i<a.length;i++){let k=i;for(let j=i+1;j<a.length;j++){l.selection++;if(Math.abs(a[j][i])>Math.abs(a[k][i]))k=j}if(k!==i){[a[k],a[i]]=[a[i],a[k]];s=-s}let v=a[i][i];if(Math.abs(v)<1e-10)throw Error("orientation");s*=Math.sign(v);for(let j=i+1;j<a.length;j++){let t=a[j][i]/v;l.arithmetic++;for(let h=i+1;h<a.length;h++){a[j][h]-=t*a[i][h];l.arithmetic+=2}}}return s}
 return {C,X,add,sub,neg,mul,div,sqrt,sin,cos,dot,norm,scale,minus,proj,unit,eye,tr,mm,mv,mat,val,givens,frame,detSign,completionMin:()=>completionMin,charge:n=>l.arithmetic+=n};
}
function port(E,evaluate,c,theta,N,l){
 let {task,program,map,rho,sigma}=c.synth,ledger={numericOps:0},ev=evaluate(task,program,theta.map(x=>x.v),rho,sigma,ledger);l.arithmetic+=ledger.numericOps;
 let P=E.eye(N);
 for(let k=0;k<ev.rotations.length;k++){let q=ev.rotations[k],a=E.C(q.c),b=E.C(q.s);
  for(let j=0;j<theta.length;j++){let rate=ev.deps[j].find(z=>z[0]===k)?.[1]??0;if(!rate)continue;for(let [h,v] of theta[j].g){a.g.set(h,-q.s*rate*v);b.g.set(h,q.c*rate*v);l.arithmetic+=4;l.key+=2}}
  E.givens(P,map[q.i],map[q.j],a,b);
 }return P;
}
function numericMM(A,B,l){let n=A.length,m=B[0].length,k=B.length;return Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>{let v=0;for(let t=0;t<k;t++)if(A[i][t]!==0&&B[t][j]!==0){v+=A[i][t]*B[t][j];l.arithmetic+=2}return v}))}
const tr=A=>A[0].map((_,j)=>A.map(r=>r[j]));
function chart(api,p,c,x,depth,sign,ad,local,l){
 let E=sparse(ad?x.length:0,l,local),a=x.map((v,i)=>ad?E.X(v,i):E.C(v)),P=port(E,api.evaluate,c,a.slice(0,7),p.n+2,l);
 let z=api.reduce(E,p,c,P,depth,sign,a.slice(7,7+p.n-3),a.slice(7+p.n-3)),Q=E.val(z.Q),BQ=numericMM(c.B,Q,l),A=numericMM(tr(Q),BQ,l);
 return {Q,BQ,A,dQ:z.Q,frames:[E.val(z.D),E.val(z.T)],branch:z.branch,den:z.den,completionMin:E.completionMin(),U:E.val(z.U)};
}
// Each selected entry gets a sparse pullback, equivalent to [A, Q^T dQ].
function entry(z,i,j,d,l){
 let g=Array(d).fill(0);for(let k=0;k<z.Q.length;k++){
  for(let [h,v] of z.dQ[k][i].g){g[h]+=v*z.BQ[k][j];l.arithmetic+=2;l.deriv++}
  for(let [h,v] of z.dQ[k][j].g){g[h]+=v*z.BQ[k][i];l.arithmetic+=2;l.deriv++}
 }return g;
}
function residualModel(f,p,c,z,d,smooth,l){
 let res=f.residualH(z.A,p,c,true,smooth,l),r=res.values;
 let get=e=>entry(z,e.i,e.j,d,l).map(v=>{l.jacobian++;l.arithmetic++;return v/p.scale});
 let dm=!smooth&&res.mx/10>1e-6?get(res.r[res.im]).map(v=>{l.arithmetic+=2;return Math.sign(res.r[res.im].x)*v/10}):Array(d).fill(0);
 let rows=[...res.f.map(get),...res.r.map(e=>{
   if(smooth||res.floor<=Math.abs(e.x))return Array(d).fill(0);
   return get(e).map((v,i)=>{l.arithmetic+=2;return dm[i]-Math.sign(e.x)*v})
 })];
 l.cache++;return {J:tr(rows),r,g:null,h:null,G:[]};
}
function maxDiff(A,B,scale){return Math.max(...A.flatMap((r,i)=>r.map((v,j)=>Math.abs(v-B[i][j])/scale)))}
function checks(api,p,c,x,depth,sign){
 let f=api.f,l=f.ledger(),z=chart(api,p,c,x,depth,sign,true,null,l),old=api.ref.sample(p,c,api.evaluate,x,depth,sign,true),err=0,lieErr=0,skew=0,d=x.length,N=p.n+2;
 let test=f.ledger(),oldA=old.A.map(r=>r.map(a=>a.v));
 for(let k=0;k<d;k++){let dq=z.dQ.map(r=>r.map(a=>a.g.get(k)??0)),o=numericMM(tr(z.Q),dq,test),left=numericMM(z.A,o,test),right=numericMM(o,z.A,test);
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){skew=Math.max(skew,Math.abs(o[i][j]+o[j][i]));lieErr=Math.max(lieErr,Math.abs(left[i][j]-right[i][j]-old.A[i][j].g[k])/p.scale)}
 }
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){let g=entry(z,i,j,d,test);for(let k=0;k<d;k++)err=Math.max(err,Math.abs(g[k]-old.A[i][j].g[k])/p.scale)}
 let same=maxDiff(z.A,oldA,p.scale),local=chart(api,p,c,x,depth,sign,true,z.frames,f.ledger()),localErr=0;
 for(let k=0;k<d;k++){let a=x.slice(),b=x.slice();a[k]+=1e-6;b[k]-=1e-6;let plus=chart(api,p,c,a,depth,sign,false,z.frames,f.ledger()),minus=chart(api,p,c,b,depth,sign,false,z.frames,f.ledger());
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){let v=entry(local,i,j,d,test)[k];localErr=Math.max(localErr,Math.abs((plus.A[i][j]-minus.A[i][j])/2e-6-v)/p.scale)}
 }
 return {z,record:{err,lieErr,skew,same,branchMatch:String(z.branch)===String(old.branch),localErr,localBase:maxDiff(z.A,local.A,p.scale),work:f.work(l),pass:Math.max(err,lieErr,same)<=1e-12&&localErr<=1e-8}};
}
function finite(api,p,c,x,depth,sign,z,rng){
 let f=api.f,v=x.map(()=>2*rng()-1),h=Math.hypot(...v);v=v.map(a=>a*.5/h);
 let old=z,local=z,min=Infinity,oldSwitch=0,oldJump=0,localJump=0,orth=0,leak=0;
 try{for(let k=1;k<=20;k++){let a=x.map((t,i)=>t+v[i]*k/20),q=chart(api,p,c,a,depth,sign,false,null,f.ledger()),r=chart(api,p,c,a,depth,sign,false,z.frames,f.ledger());
    if(String(q.branch)!==String(old.branch))oldSwitch++;oldJump=Math.max(oldJump,maxDiff(q.A,old.A,p.scale));localJump=Math.max(localJump,maxDiff(r.A,local.A,p.scale));min=Math.min(min,r.completionMin);
    let O=numericMM(tr(r.Q),r.Q,f.ledger());for(let i=0;i<O.length;i++)for(let j=0;j<O.length;j++)orth=Math.max(orth,Math.abs(O[i][j]-+(i===j)));
    for(let [i,j] of c.proof.prune)leak=Math.max(leak,Math.abs(r.A[i][j])/p.scale);old=q;local=r;
   }
   let end=x.map((t,i)=>t+v[i]),reb=chart(api,p,c,end,depth,sign,false,local.frames,f.ledger()),rebase=maxDiff(reb.A,local.A,p.scale);
   return {oldSwitch,oldJump,localJump,min,orth,leak,rebase,pass:rebase<=1e-12&&orth<=1e-12&&leak<=1e-12};
 }catch(e){return {oldSwitch,oldJump,localJump,min,pass:false,error:String(e)}}
}
function clipped(f,m,l){f.diag(m,l);let d=m.J.length,delta=f.block(m,Array.from({length:d},(_,i)=>i),1e-3,l);if(!delta)throw Error("factor");let h=Math.sqrt(f.dot(delta,delta,l));l.linear++;let s=h>.5?.5/h:1;return delta.map(x=>{l.linear++;return x*s})}
function cost(api,p,c,x,depth,sign,z,smooth){
 let f=api.f,init=f.ledger(),model=f.ledger(),trial=f.ledger(),baseModel=f.ledger(),baseTrial=f.ledger(),aux=f.ledger(),d=x.length,N=p.n+2;
 let initial=chart(api,p,c,x,depth,sign,false,z.frames,init);f.metric(initial.A,p,init);
 model.iterations++;model.cache++;let a=chart(api,p,c,x,depth,sign,true,z.frames,model),m=residualModel(f,p,c,a,d,smooth,model),dx=clipped(f,m,model);
 let b=chart(api,p,c,x.map((v,i)=>{trial.linear++;return v+dx[i]}),depth,sign,false,z.frames,trial);b.m=f.metric(b.A,p,trial);f.leak(b,c,p,trial);f.value(b,p,c,true,smooth,trial);trial.frontier++;
 // Same endpoint, express it in the old base/port coordinates. This preparation is excluded from step costs.
 let W=Array.from({length:p.n},(_,i)=>i+1).filter(i=>!c.proof.anchors.includes(i)),U=Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>+(i===j)));
 for(let i=0;i<W.length;i++)for(let j=0;j<W.length;j++)U[W[i]][W[j]]=z.U[i][j];
 let B=numericMM(numericMM(tr(U),c.B,aux),U,aux),cur=f.endpoint(B,[],x.slice(0,7),c,p,aux),match=maxDiff(cur.A,z.A,p.scale);
 baseModel.iterations++;baseModel.cache++;let old=f.modelH(cur,p,c,true,true,smooth,[],baseModel),dd=clipped(f,old,baseModel);
 let t=f.trialChart(cur,dd,c,p,baseTrial);f.leak(t,c,p,baseTrial);f.value(t,p,c,true,smooth,baseTrial);baseTrial.frontier++;
 return {smooth,match,initial:f.work(init),model:f.work(model),trial:f.work(trial),total:f.work(model)+f.work(trial),baseModel:f.work(baseModel),baseTrial:f.work(baseTrial),baseTotal:f.work(baseModel)+f.work(baseTrial),ledger:{model,trial,baseModel,baseTrial}};
}
function run(api,lib,ids){let rows=[];for(let seed of ids){
 let f=api.f,p=f.problem(seed),g=f.generate(seed),id=f.chosen(lib,g.type,"FIRST"),c=f.compile(p,f.ledger(),"SYN",f.item(lib,g.type,id)),rng=f.rng(seed+140000),fit=api.ref.fitPort(p,c,api.evaluate,g.target,rng);
 for(let depth of [1,2]){api.ref.witness(p,g,c,api.evaluate,depth,rng,null); // consumes exactly the frozen reference RNG stream
 let m=p.n-2,d=7+m-1+(m-depth-1)*(m-depth-2)/2;
 for(let k=0;k<4;k++){let x=Array.from({length:d},()=>.15+1.1*rng()),sign=[k&1?-1:1,k&2?-1:1],{z,record}=checks(api,p,c,x,depth,sign),index=(seed-83000)*8+(depth-1)*4+k;
   let finiteRow=index%2===0&&index<200?finite(api,p,c,x,depth,sign,z,f.rng(seed+190000+index)):null;
   let costs=p.n===9&&depth===2?[true,false].map(s=>{try{return cost(api,p,c,x,depth,sign,z,s)}catch(e){return {smooth:s,error:String(e)}}}):null;
   rows.push({seed,n:p.n,depth,k,sign,d,x,...record,finite:finiteRow,costs})
 }
 }
 }return rows}
module.exports={load,run};
if(require.main===module){let fs=require("node:fs"),a=load(...["rotation_peel_diagnostic.cjs","rotation_quality.cjs","discover_givens.cjs"].map(p=>fs.readFileSync(p,"utf8"))),lib=JSON.parse(fs.readFileSync("results/rotation_quality_library.json"));fs.writeFileSync("results/rotation_peel_fast_reproduced.json",JSON.stringify(run(a,lib,Array.from({length:32},(_,i)=>83000+i)),null,2))}
