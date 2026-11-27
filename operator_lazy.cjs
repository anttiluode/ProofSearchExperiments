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
function followup(frozen,oldDev){
 const X="$0",Y="$1",Z="$2";
 const base=[["ar",M(M(X,Y),Z),M(X,M(Y,Z)),[X,Y,Z]],["al",M(X,M(Y,Z)),M(M(X,Y),Z),[X,Y,Z]],["li",M(I,X),X,[X]],["ri",M(X,I),X,[X]],["cl",M(V(X),X),I,[X]],["cr",M(X,V(X)),I,[X]],["ip",V(M(X,Y)),M(V(Y),V(X)),[X,Y]],["ii",V(V(X)),X,[X]],["io",V(I),I,[]]].map(([name,lhs,rhs,vars])=>({name,lhs,rhs,vars}));
 const L=()=>({visit:0,indexBuild:0,encode:0,probe:0,match:0,equality:0,substitution:0,size:0,copy:0,path:0,primitive:0,macro:0,replay:0,extract:0,pending:0,sort:0});
 function same(a,b,l){l.equality++;return a===b||Array.isArray(a)&&Array.isArray(b)&&a[0]===b[0]&&a.length===b.length&&a.slice(1).every((x,i)=>same(x,b[i+1],l))}
 function bind(p,t,b,l){l.match++;if(typeof p==="string"&&p.startsWith("$")){if(Object.hasOwn(b,p))return same(b[p],t,l);b[p]=t;return true}return Array.isArray(p)?Array.isArray(t)&&p[0]===t[0]&&p.slice(1).every((x,i)=>bind(x,t[i+1],b,l)):p===t}
 function sub(t,b,l){l.substitution++;return Array.isArray(t)?[t[0],...t.slice(1).map(x=>sub(x,b,l))]:Object.hasOwn(b,t)?b[t]:t}
 function sz(t,l){l.size++;return Array.isArray(t)?1+t.slice(1).reduce((a,x)=>a+sz(x,l),0):1}
 function at(t,p,l){for(let i of p){l.path++;t=t[i]}return t}
 function replace(t,p,x,l,i=0){if(i===p.length)return x;l.copy++;let z=t.slice();z[p[i]]=replace(z[p[i]],p,x,l,i+1);return z}
 function tokens(t,l,pat=false,a=[]){l.encode++;let i=a.length,k=Array.isArray(t)?t[0]:pat&&t.startsWith("$")?"*":t===I?"1":"atom";a.push({k,end:0});if(Array.isArray(t))for(let v of t.slice(1))tokens(v,l,pat,a);a[i].end=a.length;return a}
 function index(rules,mode,l){
  let root={edges:new Map(),out:[]},bucket=new Map();
  for(let r of rules){l.indexBuild++;let k=op(r.lhs);if(!bucket.has(k))bucket.set(k,[]);bucket.get(k).push(r);if(mode==="scan")continue;let n=root;for(let tok of tokens(r.lhs,l,true)){l.indexBuild++;if(!n.edges.has(tok.k))n.edges.set(tok.k,{edges:new Map(),out:[]});n=n.edges.get(tok.k)}n.out.push(r)}
  return (t,allowed,l)=>{let candidates=[];if(mode==="scan"){for(let r of bucket.get(op(t))||[]){l.probe++;candidates.push(r)}}else{let a=tokens(t,l),stack=[[root,0]];while(stack.length){let [n,i]=stack.pop();l.probe++;if(i===a.length){for(let r of n.out){l.probe++;candidates.push(r)}continue}for(let [k,j] of [[a[i].k,i+1],["*",a[i].end]]){l.probe++;let c=n.edges.get(k);if(c)stack.push([c,j])}}}
  candidates=candidates.filter(allowed).sort((a,b)=>rules.indexOf(a)-rules.indexOf(b));let out=[];for(let r of candidates){l.probe++;let b={};if(bind(r.lhs,t,b,l))out.push({r,b})}return out};
 }

 function splitIndex(rules,mode,l){
  const rank=new Map(rules.map((r,i)=>[r.name,i])), indexes=new Map();
  const groups={macro:rules.filter(r=>r.name.startsWith("macro")),inverse:rules.filter(r=>["ip","ii","io"].includes(r.name)),cancel:rules.filter(r=>["li","ri","cl","cr"].includes(r.name))};
  for(let id of ["ar","al","cl","cr","li"])groups[id]=rules.filter(r=>r.name===id);
  for(let [group,rs] of Object.entries(groups)){
   let root={edges:new Map(),out:[]},bucket=new Map();
   for(let r of rs){l.indexBuild++;let k=op(r.lhs);if(!bucket.has(k))bucket.set(k,[]);bucket.get(k).push(r);if(mode==="scan")continue;let n=root;for(let tok of tokens(r.lhs,l,true)){l.indexBuild++;if(!n.edges.has(tok.k))n.edges.set(tok.k,{edges:new Map(),out:[]});n=n.edges.get(tok.k)}n.out.push(r)}
   indexes.set(group,{root,bucket,rs});
  }
  return (t,group,l)=>{
   let {root,bucket,rs}=indexes.get(group),candidates=[];
   if(mode==="scan"){for(let r of bucket.get(op(t))||[]){l.probe++;candidates.push(r)}}
   else if(mode==="eager"){let a=tokens(t,l),stack=[[root,0]];while(stack.length){let [n,i]=stack.pop();l.probe++;if(i===a.length){for(let r of n.out){l.probe++;candidates.push(r)}continue}for(let [k,j] of [[a[i].k,i+1],["*",a[i].end]]){l.probe++;let c=n.edges.get(k);if(c)stack.push([c,j])}}}
   else {function cell(t,next){l.pending++;return {t,next}}let stack=[[root,cell(t,null)]];while(stack.length){let [n,p]=stack.pop();l.probe++;if(!p){for(let r of n.out){l.probe++;candidates.push(r)}continue}
    l.probe++;let wild=n.edges.get("*");if(wild)stack.push([wild,p.next]);
    l.probe++;l.encode++;let x=p.t,key=Array.isArray(x)?x[0]:x===I?"1":"atom",exact=n.edges.get(key);
    if(exact){let next=p.next;if(Array.isArray(x))for(let i=x.length-1;i>=1;i--)next=cell(x[i],next);stack.push([exact,next])}
   }}
   candidates.sort((a,b)=>{l.sort++;return rank.get(a.name)-rank.get(b.name)});let out=[];
   for(let r of candidates){l.probe++;let b={};if(bind(r.lhs,t,b,l))out.push({r,b})}
   let expected=[];for(let r of rs){let b={};if(bind(r.lhs,t,b,L()))expected.push({r,b})}
   if(!eq(out.map(x=>[x.r.name,x.b]),expected.map(x=>[x.r.name,x.b])))throw Error("index query mismatch "+group);
   auditQueries++;return out;
  }
 }
 let auditQueries=0;
 let dev=L(),variant=null;
 function flatten(t,a=[]){dev.visit++;if(op(t)==="m"){flatten(t[1],a);flatten(t[2],a)}else a.push(t);return a}
 for(let m of frozen){let a=m.lhs[1],b=m.lhs[2];if(op(m.lhs)!=="m"||op(a)!=="m"||op(b)!=="m"||op(a[1])!=="m"||op(b[1])!=="m")continue;let first=a[1][1],last=a[2];if(!same(first,b[1][1],dev)||!same(last,b[2],dev))continue;
  let fs=flatten(m.rhs);dev.extract+=fs.length;if(fs.length<3||!same(fs[0],first,dev)||!same(fs.at(-1),last,dev))continue;
  let desired=M(M(first,fs.slice(1,-1).reduceRight((z,x)=>M(x,z))),last);
  let q=[{t:m.rhs,trace:[]}],seen=new Set([JSON.stringify(m.rhs)]),found=null,ix=index(base,"trie",dev);
  for(let i=0;i<q.length&&i<256&&!found;i++){let state=q[i];function visit(t,p){dev.visit++;for(let {r,b} of ix(t,r=>r.name==="ar"||r.name==="al",dev)){let next=replace(state.t,p,sub(r.rhs,b,dev),dev),key=JSON.stringify(next);if(seen.has(key))continue;seen.add(key);let trace=[...state.trace,{p,rule:r.name,args:r.vars.map(v=>b[v]),out:next}];if(same(next,desired,dev)){found=trace;return}q.push({t:next,trace})}if(Array.isArray(t))for(let k=1;k<t.length&&!found;k++)visit(t[k],[...p,k])}visit(state.t,[])}
  if(found){variant={...m,name:"macro3",rhs:desired,trace:[...m.trace,...found],parent:m.name};break}
 }
 if(!variant)throw Error("no variant");
 function replay(input,steps,rules,l){let t=input,map=new Map(rules.map(r=>[r.name,r]));for(let s of steps){l.replay++;let r=map.get(s.rule),b={};if(!r||!bind(r.lhs,at(t,s.p,l),b,l)||!r.vars.every((v,i)=>same(b[v],s.args[i],l)))throw Error("bad replay");t=replace(t,s.p,sub(r.rhs,b,l),l);if(!same(t,s.out,l))throw Error("replay mismatch")}return t}
 for(let m of [...frozen,variant])if(!same(replay(m.lhs,m.trace,base,dev),m.rhs,dev)||!eq(word(m.lhs),word(m.rhs)))throw Error("schema invalid");
 function run(input,lib,mode,prepass,reuse=true){
  let l=L(),steps=[],t=input,expanded=0,chain=new Map(),maxChain=0,all=[...lib,...base],idx=splitIndex(all,mode,l);
  const macro=r=>r.name.startsWith("macro");
  function choose(p,group){return idx(at(t,p,l),group,l)[0]}
  function fire(p,q,prepared){let old=at(t,p,l),out=prepared===undefined?sub(q.r.rhs,q.b,l):prepared;if(macro(q.r)){l.macro++;expanded+=q.r.trace.length;let n=1;for(let child of [old[1],old[2]])if(Array.isArray(child))n=Math.max(n,1+(chain.get(child)||0));chain.set(out,n);maxChain=Math.max(maxChain,n)}else{l.primitive++;expanded++}t=replace(t,p,out,l);steps.push({p:p.slice(),rule:q.r.name,args:q.r.vars.map(v=>q.b[v]),out:t})}
  function one(p,id){let q=choose(p,id);if(!q)throw Error("missing "+id);fire(p,q)}
  function pre(p,d=0){if(d>400)throw Error("prepass");l.visit++;let x=at(t,p,l);if(!Array.isArray(x))return;for(let i=1;i<x.length;i++)pre([...p,i],d+1);for(let i=0;i<100;i++){let q=choose(p,"macro");if(!q)return;let old=at(t,p,l),out=sub(q.r.rhs,q.b,l);if(sz(out,l)>=sz(old,l))return;fire(p,q,reuse?out:undefined)}throw Error("prepass loop")}
  function walk(p,d=0){if(d>500||steps.length>5000)throw Error("runaway");l.visit++;let x=at(t,p,l);if(!Array.isArray(x))return;
   if(op(x)==="v"){let q=choose(p,"inverse");if(q){fire(p,q);walk(p,d+1);return}walk([...p,1],d+1);q=choose(p,"inverse");if(q){fire(p,q);walk(p,d+1)}return}
   walk([...p,1],d+1);walk([...p,2],d+1);
   while(op(at(t,p,l))==="m"&&op(at(t,p,l)[1])==="m"){one(p,"ar");walk([...p,2],d+1)}
   x=at(t,p,l);if(op(x)!=="m")return;let q=choose(p,"cancel");if(q){fire(p,q);return}
   let a=x[1],b=x[2];if(op(b)==="m"&&((op(a)==="v"&&same(a[1],b[1],l))||(op(b[1])==="v"&&same(a,b[1][1],l)))){one(p,"al");one([...p,1],op(a)==="v"?"cl":"cr");one(p,"li")}
  }
  if(prepass)pre([]);walk([]);if(!eq(t,canonical(input)))throw Error("canonical mismatch");if(!same(replay(input,steps,all,l),t,l))throw Error("end");return {steps,ledger:l,expanded,maxChain,out:t}
 }
 let comp=frozen.map(m=>m.name===variant.parent?variant:m),libs={PS:[],CS:comp,PE:[],CE:comp,PL:[],CL:comp,CD:comp},rows=[],stress=[],lean=[...frozen,variant].map(m=>theorem(m.name,m.lhs,m.trace));
 function test(p,dest,tag){let goal=canonical(p.t);for(let mode of Object.keys(libs)){let r=run(p.t,libs[mode],["PS","CS","CD"].includes(mode)?"scan":["PE","CE"].includes(mode)?"eager":"lazy",mode.startsWith("C"),mode!=="CD");if(!eq(r.out,goal))throw Error("oracle");dest.push({seed:p.seed,family:p.family,mode,steps:r.steps.length,expanded:r.expanded,macroHits:r.ledger.macro,maxChain:r.maxChain,ledger:r.ledger});lean.push(theorem(tag+"_"+mode+"_"+p.seed,p.t,r.steps,libs[mode]))}}
 for(let seed=31000;seed<31072;seed++)test(problem(seed,true),rows,"indexcase");
 for(let n=2;n<=12;n++){let g="g"+n,items=Array.from({length:n},(_,i)=>M(M(V(g),"x"+n+"_"+i),g)),t=items.reduceRight((b,a)=>M(a,b));test({seed:n,family:"chain",t},stress,"chaincase")}
 const sum=x=>Object.values(x).reduce((s,v)=>s+v,0),avg=(a,f)=>a.reduce((s,x)=>s+f(x),0)/a.length;
 let summary=[];for(let family of [0,1,2,"all"])for(let mode of Object.keys(libs)){let a=rows.filter(x=>x.mode===mode&&(family==="all"||x.family===family));summary.push({family,mode,n:a.length,steps:avg(a,x=>x.steps),work:avg(a,x=>sum(x.ledger)),workWithoutBuild:avg(a,x=>sum(x.ledger)-x.ledger.indexBuild),hits:a.reduce((s,x)=>s+x.macroHits,0),maxChain:Math.max(...a.map(x=>x.maxChain))})}
 return {summary,rows,stress,variant,derivation:dev,oldDev,auditQueries,lean:lean.join("\n")};
}
function checkTraces(current,previous){function th(s){return new Map(s.split(/(?=^theorem )/m).filter(x=>x.startsWith("theorem ")).map(x=>[x.match(/^theorem (\S+)/)[1],x.replace(/^theorem \S+/,"theorem _").trim()]))}let b=th(previous),a=th(current);for(let [k,v] of a){let target=k.replace(/_(PS|PE|PL|CS|CE|CL|CD)_/,(_,m)=>m.startsWith("C")?"_CS_":"_PS_");if(b.get(target)!==v)throw Error("Lean trace differs "+k)}return a.size}
const fs=require('node:fs');const old=JSON.parse(fs.readFileSync('results/operator_raw.json','utf8'));const r=followup(old.lib,old.development);const original=fs.readFileSync('operator_index.cjs','utf8').split('\nconst fs=require')[0];const ref=new Function('lib','dev',original+'\nreturn followup(lib,dev);')(old.lib,old.development);r.identicalTheorems=checkTraces(r.lean,ref.lean);delete r.lean;fs.writeFileSync('results/operator_lazy.json',JSON.stringify(r));console.log(JSON.stringify({summary:r.summary,auditQueries:r.auditQueries,identicalTheorems:r.identicalTheorems},null,2));
