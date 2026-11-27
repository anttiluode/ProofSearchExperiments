function main(){
function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function shuffle(a,r){for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function sample(n,k,r){return shuffle(Array.from({length:n},(_,i)=>i),r).slice(0,k)}
function ports(n,k,win,r){let q=sample(n,3*k,r),[a,b,c]=q;let out=[[a,b],[a,c],win?[a,q[3]]:[b,c]];let pos=4;for(let p of out)while(p.length<k)p.push(q[pos++]);return out}
function common(p){return p[0].filter(x=>p[1].includes(x)&&p[2].includes(x))}
function graph(w,r){let N=16,adj=Array.from({length:N+1},()=>[]),anchor=N;
function node(){adj.push([]);return adj.length-1}
function edge(a,b){if(!adj[a].includes(b))adj[a].push(b)}
for(let end of w){let x=anchor,depth=3+Math.floor(r()*3);for(let i=1;i<depth;i++){let y=node();edge(x,y);if(x!==anchor)edge(y,x);x=y}edge(x,end)}
let dead=Array.from({length:18},node);
for(let x of dead){for(let j=0;j<3;j++)edge(x,dead[Math.floor(r()*dead.length)])}
for(let x of [anchor,...Array.from({length:adj.length-1-anchor-18},(_,i)=>anchor+1+i)])for(let j=0;j<2;j++)edge(x,dead[Math.floor(r()*dead.length)]);
for(let a of adj)shuffle(a,r);
return {adj,anchor,w}}
function bfs(g){let q=[g.anchor],par=new Map([[g.anchor,-1]]),ops=0;for(let i=0;i<q.length;i++)for(let y of g.adj[q[i]]){ops++;if(!par.has(y)){par.set(y,q[i]);q.push(y)}}let w=Array.from(par.keys()).filter(x=>x<16);return {w,par,ops}}
function wave(g){let a=new Map([[g.anchor,1]]),hits=Array(16).fill(0),ops=0;for(let t=0;t<5;t++){let b=new Map();for(let [x,v] of a)for(let y of g.adj[x]){ops++;b.set(y,(b.get(y)||0)+.7*v)}for(let [y,v] of b)if(y<16)hits[y]+=v;a=b}return {hits,ops}}
function path(g,p,m){let a=[m];while(a[a.length-1]!==g.anchor){let x=p.get(a[a.length-1]);if(x===undefined||a.length>g.adj.length)throw Error("broken path");a.push(x)}a.reverse();if(!a.slice(1).every((x,i)=>g.adj[a[i]].includes(x)))throw Error("bad edge");return a}
function closure(g){let seen=new Set([g.anchor]);for(let t=0;t<g.adj.length;t++){let before=seen.size;for(let x=0;x<g.adj.length;x++)if(seen.has(x))for(let y of g.adj[x])seen.add(y);if(seen.size===before)break}return [...seen].filter(x=>x<16)}
let lean=["-- Generated exact proof terms; run lean MultiHop.lean to check.",""];
function certificate(gs,r,m,paths,seed){let lines=[`theorem case_${seed} (Goal : Prop)`];let names=[];for(let j=0;j<gs.length;j++)for(let p=0;p<3;p++){let g=gs[j][p],tag=`_${j}_${p}`;lines.push(`    (R${tag} : Nat → Nat → Prop)`,`    (join${tag} : ∀ {a b c : Nat}, R${tag} a b → R${tag} b c → R${tag} a c)`);for(let x=0;x<g.adj.length;x++)for(let y of g.adj[x])lines.push(`    (h${tag}_${x}_${y} : R${tag} ${x} ${y})`);}
for(let j=0;j<gs.length;j++)lines.push(`    (rule_${j} : ∀ m : Nat, R_${j}_0 16 m → R_${j}_1 16 m → R_${j}_2 16 m → Goal)`);
for(let p=0;p<3;p++){let a=paths[p],tag=`_${r}_${p}`,term=`h${tag}_${a[0]}_${a[1]}`;for(let i=2;i<a.length;i++)term=`(join${tag} ${term} h${tag}_${a[i-1]}_${a[i]})`;names.push(term)}
lines.push(`    : Goal := rule_${r} ${m} ${names.join(" ")}`,"");lean.push(...lines)}
let multi=[];
for(let seed=0;seed<64;seed++)for(let neg of [false,true]){let r=rng(40001+seed),winner=seed%8,gs=Array.from({length:8},(_,j)=>ports(16,2,j===winner&&!neg,r).map(w=>graph(w,r)));let oracle=gs.map(ps=>common(ps.map(closure)));if(oracle.filter(x=>x.length).length!==+!neg||(!neg&&oracle[winner].length!==1))throw Error("oracle");
let costs=gs.map(ps=>ps.map(bfs));let base=Array.from({length:8},(_,i)=>i);let waves=gs.map(ps=>ps.map(wave));let score=waves.map(ps=>ps[0].hits.reduce((s,v,i)=>s+v*ps[1].hits[i]*ps[2].hits[i],0));let order=base.slice().sort((a,b)=>score[b]-score[a]);let waveOps=waves.flat().reduce((s,x)=>s+x.ops,0);
function solve(ord){let ops=0,joins=0,checked=0;for(let j of ord){let b=costs[j];ops+=b.reduce((s,x)=>s+x.ops,0);joins+=2;checked++;let c=common(b.map(x=>x.w));if(c.length){let m=c[0],paths=gs[j].map((g,p)=>path(g,b[p].par,m));if(!oracle[j].includes(m))throw Error("wrong witness");return {rule:j,m,paths,ops,joins,checked,proofEdges:paths.reduce((s,x)=>s+x.length-1,0)}}}return {rule:null,ops,joins,checked,proofEdges:0}}
let blind=solve(base),guided=solve(order),fullOps=costs.flat().reduce((s,x)=>s+x.ops,0);if((blind.rule!==null)!==!neg||(guided.rule!==null)!==!neg)throw Error("coverage");if(!neg)certificate(gs,blind.rule,blind.m,blind.paths,seed);
multi.push({seed,neg,winner:neg?null:winner,top:order[0],shadowWitness:waves[order[0]][0].hits.map((v,i)=>v*waves[order[0]][1].hits[i]*waves[order[0]][2].hits[i]).reduce((b,v,i,a)=>v>a[b]?i:b,0),waveOps,fullOps,blind,guided,score})}
let phase=[];
for(let N of [512,2048])for(let D of [64,256]){let r=rng(N*100+D),th=new Float64Array(N*D),ph=new Float64Array(N*D);for(let i=0;i<th.length;i++){th[i]=r()*Math.PI*2;ph[i]=r()*Math.PI*2}
let keys=Array.from({length:3},()=>[new Float64Array(N*D),new Float64Array(N*D)]);for(let i=0;i<th.length;i++){let a=[th[i],ph[i],-th[i]-ph[i]];for(let p=0;p<3;p++){keys[p][0][i]=Math.cos(a[p]);keys[p][1][i]=Math.sin(a[p])}}
function estimate(ps){let sums=ps.map((ws,p)=>{let re=new Float64Array(D),im=new Float64Array(D);for(let w of ws)for(let d=0;d<D;d++){re[d]+=keys[p][0][w*D+d];im[d]+=keys[p][1][w*D+d]}return [re,im]});let s=0;for(let d=0;d<D;d++){let [a,b]=[sums[0][0][d],sums[0][1][d]],[c,e]=[sums[1][0][d],sums[1][1][d]],[f,g]=[sums[2][0][d],sums[2][1][d]];s+=(a*c-b*e)*f-(a*e+b*c)*g}return s/D}
for(let k of [2,4,8,16,32,64]){let rows=[];for(let seed=0;seed<64;seed++){let t=rng(90000+seed+1000*k+N),winner=seed%8;let sets=Array.from({length:8},(_,j)=>ports(N,k,j===winner,t));let scores=sets.map(estimate);let top=scores.indexOf(Math.max(...scores));let negative=ports(N,k,false,t);if(sets.some((p,j)=>common(p).length!==+(j===winner))||common(negative).length)throw Error("phase truth");rows.push({seed,winner,top,scores,negative:estimate(negative)})}phase.push({N,D,k,rows,top:rows.filter(x=>x.winner===x.top).length,codebookBytes:3*2*N*D*8,encodingAdds:8*3*k*D*2})}}
let motifs=[],library=new Set();let mr=rng(812);for(let t=0;t<60;t++){let type=t<12?t:Math.floor(mr()*12),length=3+type%2;let pattern=Array.from({length},(_,i)=>`P${type}_${i}`),key=pattern.join("/");let edges=pattern.map((p,i)=>({p,a:t*10+i,b:t*10+i+1}));let check=edges.every((e,i)=>e.p===pattern[i]&&(!i||edges[i-1].b===e.a));if(!check)throw Error("motif certificate");let list=[...library],i=list.indexOf(key),hit=library.has(key);motifs.push({t,type,hit,static:2*length-1,scan:(hit?i+1:list.length)+ (hit?1:2*length-1),keyed:1+(hit?1:2*length-1),expanded:edges});library.add(key)}
// Proxy: source single rule graphs versus eight-rule target. Each policy chooses
// how many candidates to wave-score first; exact fallback always visits every rule as needed.
let policyK=[0,1,2,4,8];let source=[],target=[];
for(let seed=0;seed<64;seed++){let r=rng(81111+seed),gs=Array.from({length:8},(_,j)=>ports(16,2,j===seed%8,r).map(w=>graph(w,r)));let b=gs.map(ps=>ps.map(bfs)),w=gs.map(ps=>ps.map(wave));function cost(k,limit){let order=Array.from({length:limit},(_,i)=>i);let pre=order.slice(0,k);let waveCost=pre.reduce((s,j)=>s+w[j].reduce((a,v)=>a+v.ops,0),0);let score=j=>w[j][0].hits.reduce((s,v,i)=>s+v*w[j][1].hits[i]*w[j][2].hits[i],0);pre.sort((a,b)=>score(b)-score(a));let work=waveCost;for(let j of [...pre,...order.slice(k)]){work+=b[j].reduce((s,x)=>s+x.ops,0);if(common(b[j].map(x=>x.w)).length)break}return work}source.push(policyK.map(k=>cost(k,1)));target.push(policyK.map(k=>cost(k,8)))}
let policy={policyK,source,target, note:"All source single-rule cases except winner=0 are negatives; no AI optimizer. Notebook records wave overhead as measured independently of exact fallback."};
return {multi,phase,motifs,policy,lean:lean.join("\n")}}
const result=main();
const fs=require('node:fs');
fs.mkdirSync('results',{recursive:true});
fs.writeFileSync('results/MultiHop.lean',result.lean);delete result.lean;
fs.writeFileSync('results/raw.json',JSON.stringify(result));
console.log('Wrote results/raw.json and results/MultiHop.lean');
