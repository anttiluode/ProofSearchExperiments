// Corrected accounting for the pilot's deliberately simplified motif model.
const fs=require('node:fs');const raw=JSON.parse(fs.readFileSync('results/raw.json','utf8'));
let specific=[],generic=[],rows=[];
for(const m of raw.motifs){const l=m.expanded.length;const key=m.type;let idx=specific.indexOf(key),g=generic.indexOf(l);const stat=2*l-1;
rows.push({t:m.t,l,static:stat,scan:(idx<0?specific.length+stat+1:idx+1+l+1),keyed:(idx<0?1+stat+1:1+l+1),generic:(g<0?1+stat+1:1+l+1)});if(idx<0)specific.push(key);if(g<0)generic.push(l);}
const avg=(a,k)=>a.reduce((s,x)=>s+x[k],0)/a.length;
const motif=[rows.slice(0,30),rows.slice(30)].map(a=>Object.fromEntries(["static","scan","keyed","generic"].map(k=>[k,avg(a,k)])));
const k=raw.policy.policyK,means=(a)=>k.map((_,i)=>a.reduce((s,x)=>s+x[i],0)/a.length),source=means(raw.policy.source),target=means(raw.policy.target);
const src=source.indexOf(Math.min(...source));const arms=[{name:"blank",chosen:0},{name:"source winner",chosen:src},{name:"source notebook",chosen:src}].map(a=>({...a,k:k[a.chosen],targetMean:target[a.chosen]}));
fs.writeFileSync('results/accounting_audit.json',JSON.stringify({motif,rows,policy:{source,target,k,arms,note:"Degenerate proxy: same source and target optimum, blank policy is k=0. One equal target evaluation per arm, no AI optimizer, cannot identify SIM effect."}},null,2));
