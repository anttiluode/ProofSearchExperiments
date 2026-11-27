// Static profiles and multi-generation reuse. No optimization outcomes used.
const targets=[{name:"triple55",u:[0,1,2,3,6],v:[0,1,2,4,5],a:0,b:1},{name:"quad55",u:[0,1,2,3,4],v:[0,1,2,3,5],a:0,b:1}];
const key=f=>JSON.stringify([f.kind,f.i,f.j,f.row??-1,f.zero??-1]);
const commute=(a,b)=>a.i!==b.i&&a.i!==b.j&&a.j!==b.i&&a.j!==b.j;
function normal(program){let remaining=program.map((f,i)=>({f,i})),out=[];while(remaining.length){let ready=remaining.filter((x,i)=>remaining.slice(0,i).every(y=>commute(x.f,y.f)));ready.sort((a,b)=>key(a.f).localeCompare(key(b.f))||a.i-b.i);let a=ready[0];out.push(key(a.f));remaining=remaining.filter(x=>x.i!==a.i)}return JSON.stringify(out)}
function spectrumSame(a,b){return a.length===b.length&&a.every((x,i)=>Math.abs(x-b[i])<=1e-8*Math.max(1,Math.abs(x),Math.abs(b[i])))}
function profile(g,condition,t,p){
 let cond=condition(g,t,p),seed=98123,r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296},l={numericOps:0},fan=[],margin=[];
 for(let sample=0;sample<12;sample++){let rho=(sample%2?1:-1)*(.15+.7*r()),sigma=Math.sqrt(1-rho*rho),angles=Array.from({length:p.free},()=>.15+1.1*r()),ev=g.evalProgram(t,p.program,angles,rho,sigma,l),n=9;
 let a=Array(n).fill(0),b=a.slice();a[t.a]=1;b[t.a]=rho;b[t.b]=sigma;
 let hmin=Infinity;
 for(let k=0;k<p.program.length;k++){let f=p.program[k],q=ev.rotations[k];if(f.kind==="dep"){let row=f.row?b:a;hmin=Math.min(hmin,Math.hypot(row[q.i],row[q.j]));l.numericOps+=3}
 for(let row of [a,b]){let x=row[q.i],y=row[q.j];row[q.i]=q.c*x+q.s*y;row[q.j]=q.c*y-q.s*x;l.numericOps+=6}}
 margin.push(hmin);
 function count(i,j,start){let u=Array(n).fill(0),v=u.slice();u[i]=1;v[j]=1;
 for(let q of ev.rotations.slice(start))for(let row of [u,v]){let x=row[q.i],y=row[q.j];row[q.i]=q.c*x+q.s*y;row[q.j]=q.c*y-q.s*x;l.numericOps+=6}
 let c=0;for(let x=0;x<n;x++)for(let y=x+1;y<n;y++){l.numericOps+=3;if(Math.abs(u[x]*v[y]-u[y]*v[x])>1e-12)c++}return c}
 let inner=Array.from({length:n},(_,i)=>i).filter(i=>i!==t.a&&i!==t.b),sum=0;
 for(let i=0;i<inner.length;i++)for(let j=i+1;j<inner.length;j++)sum+=count(inner[i],inner[j],0);
 for(let dep of ev.deps)for(let [k,w] of dep)if(Math.abs(w)>1e-12){let q=ev.rotations[k];sum+=count(q.i,q.j,k+1)}
 fan.push(sum);
 }
 let meanFan=fan.reduce((a,b)=>a+b,0)/12,max=Math.max(...cond.values);
 return {condition:cond,meanFan,max,margin:Math.min(...margin),score:cond.mean*Math.sqrt(max)*(1+meanFan/100),ledger:l}
}
function reflect(t,p){let map=Array.from({length:Math.max(...t.u,...t.v)+1},(_,i)=>i),groups=[t.u.filter(i=>t.v.includes(i)),t.u.filter(i=>!t.v.includes(i)),t.v.filter(i=>!t.u.includes(i))];
 for(let a of groups){let b=a.filter(i=>i!==t.a&&i!==t.b);b.forEach((v,i)=>map[v]=b[b.length-1-i])}
 return p.map(f=>({...f,i:map[f.i],j:map[f.j],...(f.kind==="dep"?{zero:map[f.zero]}:{})}))
}
function develop(g,reuse,condition,prior){
 let parentClusters=[],parentReceipts=[];
 for(let p of prior.parents){let k=normal(p.program),match=parentClusters.find(x=>x.normal===k);if(match){parentReceipts.push({id:p.id,exactDuplicateOf:match.id});continue}let spectrum=parentClusters.find(x=>spectrumSame(x.spectrum,p.condition.values));parentReceipts.push({id:p.id,spectrumCluster:spectrum?.id??p.id});parentClusters.push({id:p.id,normal:k,spectrum:p.condition.values})}
 let groups={},receipts=[];
 for(let t of targets){let candidates=[],seen=new Set();for(let x of parentClusters){let id=x.id;for(let parentName of (t.name==="triple55"?["triple44","triple45"]:["triple44"])){
 let parent={...prior.children[id][parentName],id:id+":"+parentName},z=reuse.run(t,"REUSE",g,[parent]);receipts.push({target:t.name,parent:parent.id,...z});if(!z.success||z.macro?.source!==parent.id)continue;
 for(let [variant,program] of [["base",z.program],["reflected",reflect(t,z.program)]]){
 let label=id+":"+parentName+":"+variant,k=JSON.stringify(program);if(seen.has(k))continue;seen.add(k);
 let l=g.count(),st=g.initial(t);for(let f of program){st=g.advance(st,f,l);if(!st)break}let proof=st&&g.check(st,t,l);if(!proof){receipts.push({target:t.name,parent:parent.id,variant,success:false,reason:"reflection audit",ledger:l});continue}
 let p={id:label,task:t,program,free:z.free,proof,parent:parent.id,variant,auditLedger:l};p.normal=normal(program);p.profile=profile(g,condition,t,p);candidates.push(p)
 }
 }}
 let representatives=[],clusters=[];for(let p of candidates){let q=representatives.find(x=>x.normal===p.normal),reason="commuting";if(!q){q=representatives.find(x=>spectrumSame(x.profile.condition.values,p.profile.condition.values));reason="sampled spectrum"}if(q)clusters.push({id:p.id,representative:q.id,reason});else{representatives.push(p);clusters.push({id:p.id,representative:p.id,reason:"new"})}}
 let ranked=representatives.slice().sort((a,b)=>a.profile.score-b.profile.score||a.id.localeCompare(b.id));
 let a=candidates.find(x=>x.id==="A:triple44:base"),c=candidates.find(x=>x.id==="C:triple44:base");
 if(ranked.length<2||!a||!c)throw Error("insufficient "+t.name);
 let seed=t.name==="triple55"?11383:11491,random=representatives[(Math.imul(seed,1664525)+1013904223>>>0)%representatives.length];
 groups[t.name]={candidates,clusters,representatives:representatives.map(x=>x.id),ranked:ranked.map(x=>x.id),policy:{TOP:ranked[0].id,NEXT:ranked[1].id,WORST:ranked.at(-1).id,FIRST:representatives[0].id,RANDOM:random.id,A:a.id,C:c.id}};
 }
 return {parentReceipts,groups,receipts}
}
module.exports={targets,normal,spectrumSame,profile,develop};
if(require.main===module){let fs=require("node:fs"),g=require("./discover_givens.cjs"),reuse=require("./reuse_givens.cjs"),lineage=require("./lineage_givens.cjs"),prior=JSON.parse(fs.readFileSync("results/rotation_lineage_library.json"));fs.writeFileSync("results/rotation_quality_library.json",JSON.stringify(develop(g,reuse,lineage.condition,prior),null,2))}
