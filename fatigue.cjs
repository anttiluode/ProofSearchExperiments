function fatigueExperiment(){
const N=12, RULES=4, FULL=(1<<N)-1, modes=["A","B1","B2","C","D","F","J"], families=["sparse","dense","parity"], caps=[256,1024];
function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function bits(m){let a=[];while(m){let b=m&-m;a.push(31-Math.clz32(b));m^=b}return a}
function graph(f,seed,neg){
 let r=rng(seed+families.indexOf(f)*99173),L=3+(seed%3),winner=Math.floor(r()*RULES), rules=[];
 for(let j=0;j<RULES;j++){
  let parity=Array.from({length:L},()=>Math.floor(r()*2));
  if(f==="parity"){let v=parity.slice(0,-1).reduce((a,b)=>a^b,0);parity[L-1]=v^(j===winner?0:1)}
  let rel=[];
  for(let k=0;k<L;k++){let edges=[];for(let x=0;x<N;x++)for(let y=0;y<N;y++){
   let yes=f==="parity"?((x^y)&1)===parity[k]&&r()<.8:r()<(f==="sparse"?.13:.34);
   if(yes)edges.push([x,y])
  }rel.push(edges)}
  if(neg){if(f==="parity"){if(j===winner)rel[L-1]=[]; // flip final parity, using full opposite support
    if(j===winner)for(let x=0;x<N;x++)for(let y=0;y<N;y++)if(((x^y)&1)!==parity[L-1])rel[L-1].push([x,y])
  }else{rel[0]=rel[0].filter(e=>e[1]<N/2);rel[1]=rel[1].filter(e=>e[0]>=N/2)}}
  rules.push(rel)
 }
 return {f,seed,neg,L,rules}
}
function oracle(p){ // independent Boolean matrix multiplication, no scheduler
 for(let j=0;j<RULES;j++){
  let reach=Array.from({length:N},(_,x)=>Array.from({length:N},(_,y)=>x===y));
  for(let edges of p.rules[j]){
   let next=Array.from({length:N},()=>Array(N).fill(false));
   for(let [a,b] of edges)for(let x=0;x<N;x++)if(reach[x][a])next[x][b]=true;
   reach=next
  }
  if(reach.some((row,x)=>row[x]))return true
 }return false
}
function verify(p,cert){return cert&&cert.a.length===p.L&&cert.a.every((x,k)=>p.rules[cert.rule][k].some(([a,b])=>a===x&&b===cert.a[(k+1)%p.L]))}
function solve(p,mode,cap,trace=false){
 let ledger={index:0,lanes:0,inspect:0,probe:0,and:0,stack:0,reg:0,verify:0},idx=p.rules.map(rel=>rel.map(edges=>{let out=Array(N).fill(0),inc=Array(N).fill(0);for(let [x,y] of edges){out[x]|=1<<y;inc[y]|=1<<x;ledger.index+=2}return {out,inc}}));
 let lanes=[];for(let j=0;j<RULES;j++)for(let x=0;x<N;x++){lanes.push({j,x,stack:[{a:[x],mask:null}],done:false});ledger.lanes++}
 let active=lanes.length,steps=0,conflicts=0,cert=null,events=[],nextRule=0,nextLane=Array(RULES).fill(0),states=new Map(),rand=rng(p.seed+9001+Number(p.neg)*137);
 function score(l){let s=l.stack[l.stack.length-1].a.length; if(mode==="C"||mode==="D"||mode==="F"){let key=mode==="C"?l.j:l.j*N+l.x,v=states.get(key);ledger.reg++;if(v)s-=3*v.v*Math.pow(.985,steps-v.t)}return s}
 function select(){
  if(mode==="B1"){for(let n=0;n<RULES;n++){let j=(nextRule+n)%RULES;for(let k=0;k<N;k++){let x=(nextLane[j]+k)%N,l=lanes[j*N+x];ledger.inspect++;if(!l.done){nextRule=(j+1)%RULES;nextLane[j]=(x+1)%N;return l}}}}
  if(mode==="B2"){let target=Math.floor(rand()*active);for(let l of lanes){ledger.inspect++;if(!l.done&&target--===0)return l}}
  let best=null,hi=-Infinity;for(let l of lanes){ledger.inspect++;if(l.done)continue;if(mode==="J")return l;let s=score(l);if(s>hi){hi=s;best=l}}return best
 }
 function pulse(l){if(!["C","D","F"].includes(mode))return;let key=mode==="C"?l.j:l.j*N+l.x,v=states.get(key),z=(v?v.v*Math.pow(.985,steps-v.t):0)+.25;states.set(key,{v:mode==="F"?z:Math.min(1,z),t:steps});ledger.reg++}
 while(active&&steps<cap&&!cert){
  let l=select();if(!l)throw Error("scheduler lost lane");let frame=l.stack[l.stack.length-1],a=frame.a,depth=a.length,kind="";
  if(frame.mask===null){
   frame.mask=idx[l.j][depth-1].out[a[depth-1]];ledger.probe++;
   if(depth===p.L-1){frame.mask &= idx[l.j][p.L-1].inc[l.x];ledger.probe++;ledger.and++}
   if(!frame.mask){conflicts++;pulse(l);kind="conflict"}
  }
  if(frame.mask){
   let b=frame.mask&-frame.mask,y=31-Math.clz32(b);frame.mask^=b;
   if(depth===p.L-1){cert={rule:l.j,a:[...a,y]};kind="proof";ledger.verify+=p.L;if(!verify(p,cert))throw Error("invalid certificate")}
   else{l.stack.push({a:[...a,y],mask:null});ledger.stack++;kind="extend"}
  }else{l.stack.pop();ledger.stack++;if(!kind)kind="backtrack";if(!l.stack.length){l.done=true;active--}}
  steps++;if(trace)events.push({step:steps,rule:l.j,x:l.x,depth,kind,active,conflicts})
 }
 return {mode,cap,steps,conflicts,cert,exhausted:!active,ledger,total:Object.values(ledger).reduce((s,x)=>s+x,0)+steps,events:trace?events:undefined}
}
let rows=[],cases=[],replay=[],lean=["-- Coupled Horn certificate terms: exact variable identity across cyclic premises.",""];
for(let f of families)for(let seed=11000;seed<11040;seed++)for(let neg of [false,true]){
 let p=graph(f,seed,neg),truth=oracle(p);if(neg&&truth)throw Error("negative oracle");
 let id=f+"_"+seed+"_"+(neg?1:0);cases.push({id,f,seed,neg,L:p.L,truth,edges:p.rules.flat().reduce((s,a)=>s+a.length,0)});
 let certs=new Map();
 for(let cap of caps)for(let mode of modes){
  let t=solve(p,mode,cap,seed===11000&&!neg&&cap===256);
  if(t.cert&&!truth||t.exhausted&&truth&&!t.cert)throw Error("oracle disagreement");
  if(t.cert)certs.set(JSON.stringify(t.cert),t.cert);
  if(t.events)replay.push({id,mode,events:t.events});delete t.events;rows.push({id,f,seed,neg,truth,L:p.L,...t})
 }
 // Also check a complete exact search even if every budgeted arm timed out.
 let full=solve(p,"J",1000000);if(Boolean(full.cert)!==truth||!full.cert&&!full.exhausted)throw Error("complete oracle disagreement");
 if(full.cert)certs.set(JSON.stringify(full.cert),full.cert);
 let num=0;for(let c of certs.values()){
  if(!verify(p,c))throw Error("certificate");
  let name=`case_${id}_${num++}`;
  lean.push(`theorem ${name} (Goal : Prop)`);
  for(let k=0;k<p.L;k++)lean.push(`    (R${k} : Nat → Nat → Prop)`);
  let vars=Array.from({length:p.L},(_,k)=>`x${k}`),preds=vars.map((v,k)=>`R${k} ${v} ${vars[(k+1)%p.L]}`);
  lean.push(`    (rule : ∀ ${vars.join(" ")} : Nat, ${preds.join(" → ")} → Goal)`);
  for(let k=0;k<p.L;k++)lean.push(`    (h${k} : R${k} ${c.a[k]} ${c.a[(k+1)%p.L]})`);
  lean.push(`    : Goal := rule ${c.a.join(" ")} ${vars.map((_,k)=>"h"+k).join(" ")}`,"")
 }
}
let summary=[];
const mean=(a,k)=>a.length?a.reduce((s,x)=>s+x[k],0)/a.length:null;
for(let f of [...families,"all"])for(let cap of caps)for(let mode of modes){
 let a=rows.filter(x=>(f==="all"||x.f===f)&&x.cap===cap&&x.mode===mode),pos=a.filter(x=>x.truth),neg=a.filter(x=>!x.truth),success=pos.filter(x=>x.cert),base=rows.filter(x=>(f==="all"||x.f===f)&&x.cap===cap&&x.mode==="A");
 let by=new Map(base.map(x=>[x.id,x])),win=0,loss=0,both=0,w=0,l=0;for(let x of pos){let y=by.get(x.id);if(x.cert&&!y.cert)win++;if(!x.cert&&y.cert)loss++;if(x.cert&&y.cert){both++;if(x.total<y.total)w++;if(x.total>y.total)l++}}
 summary.push({f,cap,mode,n:a.length,positive:pos.length,negative:neg.length,solved:success.length,falsePositive:neg.filter(x=>x.cert).length,negativeExhausted:neg.filter(x=>x.exhausted).length,meanSteps:mean(a,"steps"),meanTotal:mean(a,"total"),positiveMeanSteps:mean(pos,"steps"),positiveMeanTotal:mean(pos,"total"),solvedMeanSteps:mean(success,"steps"),win,loss,both,totalWin:w,totalLoss:l,ledger:Object.fromEntries(Object.keys(a[0].ledger).map(k=>[k,a.reduce((s,x)=>s+x.ledger[k],0)/a.length]))})
}
return {summary,rows,cases,replay,lean:lean.join("\n"),certificates:lean.filter(x=>x.startsWith("theorem ")).length}
}
const fs=require('node:fs');const r=fatigueExperiment();fs.mkdirSync('results',{recursive:true});fs.writeFileSync('results/FatigueCertificates.lean',r.lean);delete r.lean;fs.writeFileSync('results/fatigue_summary.json',JSON.stringify({summary:r.summary,certificates:r.certificates},null,2));fs.writeFileSync('results/fatigue_rows.json',JSON.stringify({rows:r.rows,cases:r.cases}));fs.writeFileSync('results/fatigue_replay.js','window.FATIGUE_DATA='+JSON.stringify({summary:r.summary,replay:r.replay,cases:r.cases,certificates:r.certificates})+';');console.log('Fatigue pilot: '+r.certificates+' distinct case/certificate pairs');
