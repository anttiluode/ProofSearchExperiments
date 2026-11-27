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

function eliminate(p){
 let ledger={index:0,rows:0,ors:0,tests:0,reconstruct:0,verify:0};
 for(let j=0;j<RULES;j++){
  let out=p.rules[j].map(edges=>{let a=Array(N).fill(0);for(let [x,y] of edges){a[x]|=1<<y;ledger.index++}return a});
  let s=Array(p.L);s[p.L-1]=out[p.L-1];
  for(let k=p.L-2;k>=0;k--){s[k]=Array(N).fill(0);for(let x=0;x<N;x++){ledger.rows++;for(let y of bits(out[k][x])){s[k][x]|=s[k+1][y];ledger.ors++}}}
  for(let x=0;x<N;x++){ledger.tests++;if(s[0][x]&(1<<x)){
   let a=[x];for(let k=0;k<p.L-1;k++){let found=false;for(let y of bits(out[k][a[k]])){ledger.reconstruct++;if(s[k+1][y]&(1<<x)){a.push(y);found=true;break}}if(!found)throw Error('reconstruction')}
   let cert={rule:j,a};ledger.verify+=p.L;if(!verify(p,cert))throw Error('invalid DP certificate');return {cert,ledger,total:Object.values(ledger).reduce((a,b)=>a+b,0)}
  }}
 }return {cert:null,ledger,total:Object.values(ledger).reduce((a,b)=>a+b,0)}
}
let rows=[],lean=["-- Exact suffix elimination certificates."];
for(let f of families)for(let seed=11000;seed<11040;seed++)for(let neg of [false,true]){
 let p=graph(f,seed,neg),truth=oracle(p),r=eliminate(p);if(Boolean(r.cert)!==truth)throw Error('DP disagreement');rows.push({f,seed,neg,truth,...r});
 if(r.cert){let c=r.cert,vars=Array.from({length:p.L},(_,k)=>'x'+k),preds=vars.map((v,k)=>'R'+k+' '+v+' '+vars[(k+1)%p.L]);
 lean.push('theorem dp_'+f+'_'+seed+' (Goal : Prop)');
 for(let k=0;k<p.L;k++)lean.push('    (R'+k+' : Nat → Nat → Prop)');
 lean.push('    (rule : ∀ '+vars.join(' ')+' : Nat, '+preds.join(' → ')+' → Goal)');
 for(let k=0;k<p.L;k++)lean.push('    (h'+k+' : R'+k+' '+c.a[k]+' '+c.a[(k+1)%p.L]+')');
 lean.push('    : Goal := rule '+c.a.join(' ')+ ' '+vars.map((_,k)=>'h'+k).join(' '),'');
 }
}
let summary=[...families,'all'].map(f=>{let a=rows.filter(x=>f==='all'||x.f===f);return {f,n:a.length,solved:a.filter(x=>x.cert).length,negative:a.filter(x=>!x.truth).length,meanTotal:a.reduce((s,x)=>s+x.total,0)/a.length,positiveMeanTotal:a.filter(x=>x.truth).reduce((s,x)=>s+x.total,0)/a.filter(x=>x.truth).length}});
return {rows,summary,lean:lean.join('\n')}
}

const fs=require('node:fs');const r=fatigueExperiment();fs.writeFileSync('results/FatigueDP.lean',r.lean);delete r.lean;fs.writeFileSync('results/fatigue_dp.json',JSON.stringify(r));console.log('Exact suffix elimination checked against oracle.');
