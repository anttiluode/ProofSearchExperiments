function operatorPilot(){
const I="1", M=(a,b)=>["m",a,b], V=a=>["v",a], eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b), op=t=>Array.isArray(t)?t[0]:"atom", size=t=>Array.isArray(t)?1+t.slice(1).reduce((s,x)=>s+size(x),0):1;
const axioms={
 ar:"∀ a b c : A, mul (mul a b) c = mul a (mul b c)",
 al:"∀ a b c : A, mul (mul a b) c = mul a (mul b c)",
 li:"∀ a : A, mul one a = a",
 ri:"∀ a : A, mul a one = a",
 cl:"∀ a : A, mul (inv a) a = one",
 cr:"∀ a : A, mul a (inv a) = one",
 ip:"∀ a b : A, inv (mul a b) = mul (inv b) (inv a)",
 ii:"∀ a : A, inv (inv a) = a",
 io:"inv one = one"
};
const axnames=Object.keys(axioms).filter(x=>x!=="al");
function primitives(t){
 let a=t[1],b=t[2],r=[];
 if(op(t)==="m"){
  if(op(a)==="m")r.push(["ar",[a[1],a[2],b],M(a[1],M(a[2],b))]);
  if(op(b)==="m")r.push(["al",[a,b[1],b[2]],M(M(a,b[1]),b[2])]);
  if(a===I)r.push(["li",[b],b]);if(b===I)r.push(["ri",[a],a]);
  if(op(a)==="v"&&eq(a[1],b))r.push(["cl",[b],I]);if(op(b)==="v"&&eq(a,b[1]))r.push(["cr",[a],I]);
 }else if(op(t)==="v"){
  if(op(a)==="m")r.push(["ip",[a[1],a[2]],M(V(a[2]),V(a[1]))]);
  if(op(a)==="v")r.push(["ii",[a[1]],a[1]]);
  if(a===I)r.push(["io",[],I]);
 }return r
}
function get(t,p){for(let i of p)t=t[i];return t}
function put(t,p,x){if(!p.length)return x;let z=t.slice();z[p[0]]=put(z[p[0]],p.slice(1),x);return z}
function word(t,flip=false,a=[]){if(t===I)return a;if(op(t)==="m"){word(t[flip?2:1],flip,a);word(t[flip?1:2],flip,a)}else if(op(t)==="v")word(t[1],!flip,a);else {let v=[t,flip],last=a[a.length-1];if(last&&last[0]===t&&last[1]!==flip)a.pop();else a.push(v)}return a}
function canonical(t){let a=word(t).map(([v,f])=>f?V(v):v);return a.length?a.reduceRight((b,x)=>M(x,b)):I}
function atoms(t,a=[]){if(Array.isArray(t))t.slice(1).forEach(x=>atoms(x,a));else if(t!==I&&!a.includes(t))a.push(t);return a}
function subst(t,b){return Array.isArray(t)?[t[0],...t.slice(1).map(x=>subst(x,b))]:Object.hasOwn(b,t)?b[t]:t}
function match(p,t,b,ledger){ledger.match++;if(typeof p==="string"&&p.startsWith("$")){if(Object.hasOwn(b,p))return eq(b[p],t);b[p]=t;return true}if(!Array.isArray(p))return p===t;if(!Array.isArray(t)||p[0]!==t[0])return false;return p.slice(1).every((x,i)=>match(x,t[i+1],b,ledger))}
const newLedger=()=>({visit:0,match:0,primitive:0,macro:0,replay:0,extract:0,index:0});
function normalize(input,lib=[]){
 let t=input,steps=[],ledger=newLedger(),expanded=0,by={m:lib.filter(x=>op(x.lhs)==="m"),v:lib.filter(x=>op(x.lhs)==="v")};
 function apply(p,rule,args,out,macro=null){t=put(t,p,out);steps.push({p:p.slice(),rule,args,out:t});if(macro){ledger.macro++;expanded+=macro.trace.length}else{ledger.primitive++;expanded++}}
 function primitive(p,id){let q=primitives(get(t,p)).find(x=>x[0]===id);if(!q)throw Error("missing "+id+" "+JSON.stringify(get(t,p)));apply(p,...q)}
 function walk(p,depth=0){
  if(depth>400||steps.length>5000)throw Error("normalization runaway");ledger.visit++;let x=get(t,p);if(!Array.isArray(x))return;
  for(let m of by[op(x)]||[]){ledger.index++;let b={};if(match(m.lhs,x,b,ledger)){let out=subst(m.rhs,b);if(size(out)<size(x)){apply(p,m.name,m.vars.map(v=>b[v]),out,m);walk(p,depth+1);return}}}
  if(op(x)==="v"){
   let q=primitives(x).find(a=>["ip","ii","io"].includes(a[0]));if(q){apply(p,...q);walk(p,depth+1);return}
   walk([...p,1],depth+1);x=get(t,p);q=primitives(x).find(a=>["ip","ii","io"].includes(a[0]));if(q){apply(p,...q);walk(p,depth+1)}return
  }
  walk([...p,1],depth+1);walk([...p,2],depth+1);
  while(op(get(t,p))==="m"&&op(get(t,p)[1])==="m"){primitive(p,"ar");walk([...p,2],depth+1)}
  x=get(t,p);if(op(x)!=="m")return;let q=primitives(x).find(a=>["li","ri","cl","cr"].includes(a[0]));if(q){apply(p,...q);return}
  let a=x[1],b=x[2];if(op(b)==="m"&&((op(a)==="v"&&eq(a[1],b[1]))||(op(b[1])==="v"&&eq(a,b[1][1])))){
   primitive(p,"al");primitive([...p,1],op(a)==="v"?"cl":"cr");primitive(p,"li");
  }
 }
 walk([]);if(!eq(t,canonical(input)))throw Error("not normalized "+JSON.stringify([input,t,canonical(input)]));
 return {input,out:t,steps,ledger,expanded}
}
function verify(input,steps,lib=[],ledger=null){let t=input;for(let s of steps){if(ledger)ledger.replay++;let old=get(t,s.p),q=primitives(old).find(x=>x[0]===s.rule&&eq(x[1],s.args)),out;if(q)out=q[2];else{let m=lib.find(x=>x.name===s.rule);if(!m)throw Error("unknown rule");let b=Object.fromEntries(m.vars.map((v,i)=>[v,s.args[i]]));if(!eq(old,subst(m.lhs,b)))throw Error("macro premise mismatch");out=subst(m.rhs,b)}t=put(t,s.p,out);if(!eq(t,s.out))throw Error("trace mismatch")}return t}
function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function problem(seed,target){
 let r=rng(seed),a=Array.from({length:12},(_,i)=>"a"+seed+"_"+i),[g,x,y,z,h,k]=a,C=(g,x)=>M(M(V(g),x),g),prod=(arr)=>arr.reduce((x,y)=>M(x,y));
 let family=seed%3,t;
 if(!target){t=family===0?M(C(g,x),C(g,y)):family===1?V(M(V(x),V(y))):M(M(x,y),M(V(y),V(x)))}
 else if(family===0){t=M(C(g,x),M(C(g,y),C(g,z)));if(seed%2)t=M(h,M(t,V(h)))}
 else if(family===1){t=M(V(M(V(x),V(y))),M(C(g,z),C(g,h)));if(seed%2)t=V(M(V(t),V(k)))}
 else{function random(d){if(!d||r()<.32)return a[Math.floor(r()*a.length)];return r()<.35?V(random(d-1)):M(random(d-1),random(d-1))}t=M(random(3),M(random(3),V(random(2))))}
 return {seed,family,target,t}
}
let source=[],groups=new Map(),development=newLedger();
for(let seed=21000;seed<21048;seed++){
 let p=problem(seed,false),r=normalize(p.t);verify(p.t,r.steps,[],r.ledger);source.push({seed,family:p.family,steps:r.steps.length,ledger:r.ledger});
 for(let k in r.ledger)development[k]+=r.ledger[k];let aa=atoms(p.t),vars=aa.map((_,i)=>"$"+i),b=Object.fromEntries(aa.map((v,i)=>[v,vars[i]])),lhs=subst(p.t,b),rhs=subst(r.out,b),trace=r.steps.map(s=>({...s,args:s.args.map(t=>subst(t,b)),out:subst(s.out,b)})),key=JSON.stringify([lhs,rhs]);development.extract+=size(lhs)+size(rhs)+trace.reduce((n,s)=>n+size(s.out),0);
 if(!groups.has(key))groups.set(key,{lhs,rhs,trace,vars,count:0});groups.get(key).count++;
}
let lib=[...groups.values()].filter(x=>x.count>=2&&x.trace.length>=2&&size(x.rhs)<size(x.lhs)).sort((a,b)=>b.trace.length-a.trace.length).slice(0,24).map((m,i)=>({...m,name:"macro"+i}));
for(let m of lib){if(!eq(verify(m.lhs,m.trace,[],development),m.rhs))throw Error("invalid schema");if(!eq(word(m.lhs),word(m.rhs)))throw Error("schema oracle")}
function search(input,goal,cap=256){let seen=new Set([JSON.stringify(input)]),q=[input],probes=0,generated=0,expanded=0,found=eq(input,goal);
 function neighbors(t,p=[],root=t,a=[]){probes++;for(let [id,args,x] of primitives(t)){generated++;a.push(put(root,p,x))}if(Array.isArray(t))for(let i=1;i<t.length;i++)neighbors(t[i],[...p,i],root,a);return a}
 for(let i=0;i<q.length&&expanded<cap&&!found;i++){expanded++;for(let n of neighbors(q[i])){let key=JSON.stringify(n);if(seen.has(key))continue;seen.add(key);if(eq(n,goal)){found=true;break}q.push(n)}}return {found,expanded,probes,generated,states:seen.size}}
function leanTerm(t){return t===I?"one":!Array.isArray(t)?t.startsWith("$")?"v"+t.slice(1):t:op(t)==="m"?"(mul "+leanTerm(t[1])+" "+leanTerm(t[2])+")":"(inv "+leanTerm(t[1])+")"}
function theorem(name,input,steps,macros=[]){
 let aa=atoms(input).map(leanTerm),end=steps.length?steps.at(-1).out:input,lines=[`theorem ${name} (A : Type) (mul : A → A → A) (inv : A → A) (one : A)`,...axnames.map(k=>`    (${k} : ${axioms[k]})`),`    (${aa.join(" ")} : A) : ${leanTerm(input)} = ${leanTerm(end)} := by`];
 if(!steps.length){lines.push("  rfl","");return lines.join("\n")}
 lines.push("  calc");let t=input;
 for(let s of steps){let id=s.rule,args=s.args.map(leanTerm).join(" "),proof;
  if(id.startsWith("macro"))proof=`(${id} A mul inv one ${axnames.join(" ")} ${args})`;
  else if(id==="al")proof=`(Eq.symm (ar ${args}))`;
  else proof=args?`(${id} ${args})`:id;
  if(s.p.length){let ctx=put(t,s.p,"holezz");proof=`(congrArg (fun holezz => ${leanTerm(ctx)}) ${proof})`}
  lines.push(`    ${leanTerm(t)} = ${leanTerm(s.out)} := ${proof}`);t=s.out
 }lines.push("");return lines.join("\n")
}
let lean=lib.map(m=>theorem(m.name,m.lhs,m.trace)),rows=[],replays=[];
for(let seed=31000;seed<31072;seed++){
 let p=problem(seed,true),goal=canonical(p.t),a=normalize(p.t),b=normalize(p.t,lib);for(let r of [a,b])if(!eq(verify(p.t,r.steps,lib,r.ledger),goal))throw Error("proof fail");let bad=M(goal,"fresh"+seed);if(eq(word(p.t),word(bad)))throw Error("negative oracle");
 let bfs=search(p.t,goal);let row={seed,family:p.family,input:p.t,goal,negative:bad,primitive:{steps:a.steps.length,expanded:a.expanded,ledger:a.ledger},learned:{steps:b.steps.length,expanded:b.expanded,ledger:b.ledger},bfs};rows.push(row);
 lean.push(theorem("primitive_"+seed,p.t,a.steps),theorem("learned_"+seed,p.t,b.steps,lib));if(seed<31003)replays.push({seed,family:p.family,input:p.t,goal,primitive:a.steps,learned:b.steps})
}
const sum=o=>Object.values(o).reduce((s,x)=>s+x,0),avg=(a,f)=>a.reduce((s,x)=>s+f(x),0)/a.length;
let summary=[0,1,2,"all"].map(f=>{let a=rows.filter(x=>f==="all"||x.family===f);return {family:f,n:a.length,primitiveSteps:avg(a,x=>x.primitive.steps),learnedSteps:avg(a,x=>x.learned.steps),primitiveWork:avg(a,x=>sum(x.primitive.ledger)),learnedWork:avg(a,x=>sum(x.learned.ledger)),macroHits:a.reduce((s,x)=>s+x.learned.ledger.macro,0),bfsSolved:a.filter(x=>x.bfs.found).length,bfsProbes:avg(a,x=>x.bfs.probes),bfsGenerated:avg(a,x=>x.bfs.generated)}});
let all=summary.at(-1),delta=all.primitiveWork-all.learnedWork;
return {source,lib,rows,summary,development,breakEven:delta>0?Math.ceil(sum(development)/delta):null,lean:lean.join("\n"),replays}
}
const fs=require('node:fs');const r=operatorPilot();fs.mkdirSync('results',{recursive:true});fs.writeFileSync('results/OperatorCertificates.lean',r.lean);delete r.lean;fs.writeFileSync('results/operator_raw.json',JSON.stringify(r));fs.writeFileSync('results/operator_data.js','window.OPERATOR_DATA='+JSON.stringify({summary:r.summary,lib:r.lib,development:r.development,breakEven:r.breakEven,replays:r.replays})+';');console.log(JSON.stringify({summary:r.summary,development:r.development,breakEven:r.breakEven},null,2));
