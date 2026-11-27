// Generic symbolic Givens program search. No topology-specific factors.
const tasks=[
 {name:"disjoint22",u:[0,2],v:[1,3],a:0,b:1,disjoint:true},
 {name:"nested13",u:[0],v:[0,1,2],a:0,b:1},
 {name:"singleton22",u:[0,1],v:[0,2],a:0,b:1},
 {name:"double33",u:[0,1,2],v:[0,1,3],a:0,b:1},
 {name:"double34",u:[0,1,2],v:[0,1,3,4],a:0,b:1,prefix:"double33"},
 {name:"double44",u:[0,1,2,5],v:[0,1,3,4],a:0,b:1,prefix:"double34"}
];
const rng=s=>()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296};
const count=()=>({candidates:0,polyAdd:0,polyMul:0,numericChecks:0,numericOps:0});
const zero=()=>new Map(),one=()=>new Map([["",1]]),variable=x=>new Map([[x,1]]);
function add(a,b,l,sign=1){let out=new Map(a);for(let [k,v] of b){l.polyAdd++;let x=(out.get(k)??0)+sign*v;if(x)out.set(k,x);else out.delete(k)}return out}
function mul(a,b,l){let out=zero();for(let [x,v] of a)for(let [y,w] of b){l.polyMul++;let k=[...x.split("*").filter(Boolean),...y.split("*").filter(Boolean)].sort().join("*"),z=(out.get(k)??0)+v*w;if(z)out.set(k,z);else out.delete(k)}return out}
function neg(a){return new Map([...a].map(([k,v])=>[k,-v]))}
function guaranteed(a){return a.size===1&&[...a.keys()][0].split("*").every(x=>x===""||x==="rho"||x==="sigma"||/^h\d+$/.test(x))}
function initial(t){let n=Math.max(...t.u,...t.v)+1,r=Array.from({length:2},()=>Array.from({length:n},zero));r[0][t.a]=one();r[1][t.a]=t.disjoint?zero():variable("rho");r[1][t.b]=t.disjoint?one():variable("sigma");return {r,program:[],free:0}}
function advance(st,f,l){
 let {i,j}=f,k=st.program.length,c,s;
 if(f.kind==="free"){c=variable("c"+k);s=variable("s"+k)}
 else{let x=st.r[f.row][i],y=st.r[f.row][j];if(!guaranteed(x)&&!guaranteed(y))return null;if(!x.size||!y.size)return null;
 let h=variable("h"+k);c=mul(f.zero===i?y:x,h,l);s=mul(f.zero===i?neg(x):y,h,l)}
 let r=st.r.map(a=>{let b=a.slice();b[i]=add(mul(c,a[i],l),mul(s,a[j],l),l);b[j]=add(mul(c,a[j],l),mul(s,a[i],l),l,-1);return b});
 return {r,program:[...st.program,f],free:st.free+(f.kind==="free"?1:0)}
}
function mismatch(st,t){let z=0;for(let h=0;h<2;h++)for(let i=0;i<st.r[h].length;i++)if(!!st.r[h][i].size!==(h?t.v:t.u).includes(i))z++;return z}
function signature(st){return st.r.map(a=>a.map(x=>+!!x.size).join("")).join("/")}
function dim(t){return t.u.length+t.v.length-2-(t.disjoint?0:1)}
function evalProgram(t,program,angles,rho,sigma,l={numericOps:0}){
 let d=angles.length,n=Math.max(...t.u,...t.v)+1,Z=()=>Array(d).fill(0);
 let r=Array.from({length:2},()=>Array.from({length:n},()=>({v:0,g:Z()})));
 r[0][t.a].v=1;r[1][t.a].v=rho;r[1][t.b].v=sigma;
 let rotations=[],deps=Array.from({length:d},()=>[]),fi=0;
 function plus(a,b,sg=1){l.numericOps+=1+d;return {v:a.v+sg*b.v,g:a.g.map((x,k)=>x+sg*b.g[k])}}
 function times(a,b){l.numericOps+=1+3*d;return {v:a.v*b.v,g:a.g.map((x,k)=>x*b.v+a.v*b.g[k])}}
 for(let f of program){let {i,j}=f,c,s;
 if(f.kind==="free"){let g=angles[fi],cv=Math.cos(g),sv=Math.sin(g),cg=Z(),sg=Z();cg[fi]=-sv;sg[fi]=cv;fi++;l.numericOps+=2;c={v:cv,g:cg};s={v:sv,g:sg}}
 else{let x=r[f.row][i],y=r[f.row][j],h=Math.hypot(x.v,y.v);if(!(h>1e-14))throw Error("singular dependent factor");
 let a=f.zero===i?y:x,b=f.zero===i?{v:-x.v,g:x.g.map(z=>-z)}:y;
 let hg=x.g.map((z,k)=>(x.v*z+y.v*y.g[k])/h);l.numericOps+=10+9*d;
 c={v:a.v/h,g:a.g.map((z,k)=>(z-a.v/h*hg[k])/h)};
 s={v:b.v/h,g:b.g.map((z,k)=>(z-b.v/h*hg[k])/h)}}
 let at=rotations.length;rotations.push({i,j,c:c.v,s:s.v});
 for(let k=0;k<d;k++){let q=c.v*s.g[k]-s.v*c.g[k];l.numericOps+=3;if(q!==0)deps[k].push([at,q])}
 for(let a of r){let x=a[i],y=a[j];a[i]=plus(times(c,x),times(s,y));a[j]=plus(times(c,y),times(s,x),-1)}
 }return {r,rotations,deps}
}
function rank(cols,l){let qs=[];for(let c of cols){let v=c.slice();for(let q of qs){let z=v.reduce((s,x,i)=>s+x*q[i],0);v=v.map((x,i)=>x-z*q[i]);l.numericOps+=4*v.length}let h=Math.hypot(...v);l.numericOps+=2*v.length;if(h>1e-8)qs.push(v.map(x=>x/h))}return qs.length}
function check(st,t,l){
 if(st.free!==dim(t)||mismatch(st,t))return null;
 let r=rng(98123),max=0,minRank=Infinity,minRequired=Infinity,maxLeak=0;
 for(let k=0;k<12;k++){let rho=t.disjoint?0:(k%2?1:-1)*(.15+.7*r()),sigma=Math.sqrt(1-rho*rho),angles=Array.from({length:st.free},()=>.15+1.1*r());l.numericChecks++;
 let ev=evalProgram(t,st.program,angles,rho,sigma,l),flat=ev.r.flat(),cols=angles.map((_,j)=>flat.map(x=>x.g[j]));minRank=Math.min(minRank,rank(cols,l));
 for(let h=0;h<2;h++)for(let i=0;i<ev.r[h].length;i++){let x=Math.abs(ev.r[h][i].v);if((h?t.v:t.u).includes(i))minRequired=Math.min(minRequired,x);else maxLeak=Math.max(maxLeak,x)}
 for(let j=0;j<angles.length;j++){let a=angles.slice(),b=angles.slice();a[j]+=1e-6;b[j]-=1e-6;let x=evalProgram(t,st.program,a,rho,sigma,l).r.flat(),y=evalProgram(t,st.program,b,rho,sigma,l).r.flat();for(let i=0;i<flat.length;i++)max=Math.max(max,Math.abs((x[i].v-y[i].v)/2e-6-flat[i].g[j]))}
 }
 if(minRank!==st.free||max>1e-8||minRequired<1e-9||maxLeak>1e-12)return null;
 return {minRank,maxDerivative:max,minRequired,maxLeak,polynomials:st.r.map(a=>a.map(p=>[...p].sort()))}
}
function search(t,prefix=[],guided=true){
 let l=count(),root=initial(t);for(let f of prefix){root=advance(root,f,l);if(!root)throw Error("prefix")}
 let frontier=[root],n=root.r[0].length,limit=prefix.length?prefix.length+1:4,expanded=0,peak=1;
 for(let depth=prefix.length;depth<=limit;depth++){
  let next=[];
  for(let st of frontier){let proof=check(st,t,l);if(proof)return {name:t.name,success:true,program:st.program,free:st.free,proof,ledger:l,expanded,peak,guided};
   if(depth===limit)continue;expanded++;
   for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    let actions=[];if(st.free<dim(t))actions.push({kind:"free",i,j});
    for(let row=0;row<2;row++)for(let z of [i,j])actions.push({kind:"dep",i,j,row,zero:z});
    for(let f of actions){if(l.candidates>=200000)return {name:t.name,success:false,reason:"candidate cap",ledger:l,expanded,peak,guided};l.candidates++;
     let a=advance(st,f,l);if(!a||f.kind==="free"&&signature(a)===signature(st)||a.free+limit-depth-1<dim(t))continue;
     // Exact same support after a dependent step is redundant for this bounded grammar.
     if(f.kind==="dep"&&signature(a)===signature(st))continue;
     next.push(a)}
   }
  }
  if(guided){next.sort((a,b)=>mismatch(a,t)-mismatch(b,t)||b.free-a.free);next=next.slice(0,512)}
  peak=Math.max(peak,next.length);frontier=next;
 }
 return {name:t.name,success:false,reason:"depth exhausted",ledger:l,expanded,peak,guided}
}
function discover(){let library={},rows=[];for(let t of tasks){let prefix=t.prefix?library[t.prefix]?.program:[];if(!prefix){rows.push({name:t.name,success:false,reason:"missing prefix"});continue}
 let g=search(t,prefix,true),b=search(t,prefix,false);rows.push(g,b);if(g.success)library[t.name]={task:t,program:g.program,free:g.free,proof:g.proof}}
 return {library,rows}
}
module.exports={tasks,search,discover,evalProgram,initial,advance,count,check,dim};
if(require.main===module){let fs=require("node:fs"),r=discover();fs.writeFileSync("results/rotation_discovery_library.json",JSON.stringify(r,null,2));console.log(JSON.stringify(r.rows.map(x=>({name:x.name,guided:x.guided,success:x.success,program:x.program,ledger:x.ledger})),null,2))}
