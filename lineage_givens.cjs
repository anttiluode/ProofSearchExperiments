// Harvest parent variants without looking at numerical solver performance.
const tasks=[
 {name:"double34",u:[0,1,2],v:[0,1,3,4],a:0,b:1},
 {name:"double44",u:[0,1,2,5],v:[0,1,3,4],a:0,b:1},
 {name:"triple44",u:[0,1,2,3],v:[0,1,2,4],a:0,b:1},
 {name:"triple45",u:[0,1,2,3],v:[0,1,2,4,5],a:0,b:1}
];
function sig(st){return st.r.map(a=>a.map(x=>+!!x.size).join("")).join("/")}
function depSig(p){let a=p.find(x=>x.kind==="dep");return a?JSON.stringify(a):"none"}
function key(p){return JSON.stringify(p)}
function harvest(g,prior){
 let t=prior.library.double33.task,l=g.count(),accepted=[],root=g.initial(t);
 function walk(st){
 if(st.program.length===4){let p=g.check(st,t,l);if(p)accepted.push({task:t,program:st.program,free:st.free,proof:p});return}
 for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
 let acts=[];if(st.free<3)acts.push({kind:"free",i,j});if(st.program.length===st.free)for(let row=0;row<2;row++)for(let zero of [i,j])acts.push({kind:"dep",i,j,row,zero});
 for(let a of acts){l.candidates++;if(a.kind==="free"&&!st.r.some(r=>r[i].size||r[j].size))continue;
 let prev=st.program.at(-1);if(a.kind==="free"&&prev?.kind==="free"&&prev.i===i&&prev.j===j)continue;
 let z=g.advance(st,a,l);if(!z||a.kind==="dep"&&sig(z)===sig(st)||z.free+4-z.program.length<3)continue;walk(z)}
 }}
 walk(root);
 let b=prior.rows.find(x=>x.name==="double33"&&!x.guided&&x.success),parents=[{...prior.library.double33},{task:t,program:b.program,free:b.free,proof:b.proof}];
 let ks=new Set(parents.map(x=>key(x.program))),ds=new Set(parents.map(x=>depSig(x.program)));
 for(let phase of [0,1])for(let x of accepted){if(parents.length>=6)break;if(ks.has(key(x.program))||phase===0&&ds.has(depSig(x.program)))continue;parents.push(x);ks.add(key(x.program));ds.add(depSig(x.program))}
 if(parents.length!==6)throw Error("harvest too small");
 return {parents:parents.map((x,i)=>({...x,id:String.fromCharCode(65+i)})),accepted,ledger:l};
}
function condition(g,t,p){
 let seed=98123,r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296},values=[],ledger={numericOps:0};
 for(let k=0;k<12;k++){let rho=(k%2?1:-1)*(.15+.7*r()),sigma=Math.sqrt(1-rho*rho),angles=Array.from({length:p.free},()=>.15+1.1*r()),ev=g.evalProgram(t,p.program,angles,rho,sigma,ledger),flat=ev.r.flat(),d=p.free;
 let H=Array.from({length:d},(_,i)=>Array.from({length:d},(_,j)=>flat.reduce((s,x)=>{ledger.numericOps+=2;return s+x.g[i]*x.g[j]},0)));
 for(let it=0;it<100;it++){let a=0,b=1;for(let i=0;i<d;i++)for(let j=i+1;j<d;j++){ledger.numericOps++;if(Math.abs(H[i][j])>Math.abs(H[a][b])){a=i;b=j}}
 if(Math.abs(H[a][b])<1e-14)break;
 let theta=.5*Math.atan2(2*H[a][b],H[b][b]-H[a][a]),c=Math.cos(theta),s=Math.sin(theta),x=H[a][a],y=H[b][b],z=H[a][b];ledger.numericOps+=20;
 for(let j=0;j<d;j++)if(j!==a&&j!==b){let u=H[a][j],v=H[b][j];H[a][j]=H[j][a]=c*u-s*v;H[b][j]=H[j][b]=s*u+c*v;ledger.numericOps+=6}
 H[a][a]=c*c*x-2*c*s*z+s*s*y;H[b][b]=s*s*x+2*c*s*z+c*c*y;H[a][b]=H[b][a]=0;
 }let eig=H.map((a,i)=>a[i]);values.push(Math.sqrt(Math.max(...eig)/Math.max(1e-30,Math.min(...eig))))}
 return {mean:values.reduce((s,x)=>s+x,0)/values.length,values,ledger};
}
function develop(g,reuse,prior){
 let h=harvest(g,prior),children={},receipts=[];
 for(let p of h.parents){let l=g.count(),st=g.initial(p.task);for(let f of p.program)st=g.advance(st,f,l);let proof=g.check(st,p.task,l);if(!proof)throw Error("parent audit");p.proof=proof;p.terms=proof.polynomials.flat().reduce((s,a)=>s+a.length,0);p.condition=condition(g,p.task,p);p.auditLedger=l;children[p.id]={};
 for(let t of tasks){let r=reuse.run(t,"REUSE",g,[p]);receipts.push({...r,parent:p.id});if(r.success&&r.macro?.source===p.id)children[p.id][t.name]={task:t,program:r.program,free:r.free,proof:r.proof}}}
 return {...h,children,receipts};
}
module.exports={tasks,harvest,condition,develop};
if(require.main===module){let fs=require("node:fs"),g=require("./discover_givens.cjs"),reuse=require("./reuse_givens.cjs"),prior=JSON.parse(fs.readFileSync("results/rotation_discovery_library.json"));let r=develop(g,reuse,prior);fs.writeFileSync("results/rotation_lineage_library.json",JSON.stringify(r,null,2))}
