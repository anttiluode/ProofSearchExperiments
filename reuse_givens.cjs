// Generic macro reuse over 8's symbolic grammar; no target prefix hints.
const targets=[
 {name:"double34",u:[0,1,2],v:[0,1,3,4],a:0,b:1},
 {name:"double44",u:[0,1,2,5],v:[0,1,3,4],a:0,b:1},
 {name:"triple44",u:[0,1,2,3],v:[0,1,2,4],a:0,b:1}
];
function mismatch(st,t){let z=0;for(let h=0;h<2;h++)for(let i=0;i<st.r[h].length;i++)if(!!st.r[h][i].size!==(h?t.v:t.u).includes(i))z++;return z}
function sig(st){return st.r.map(a=>a.map(x=>+!!x.size).join("")).join("/")}
function sourceLibrary(prior){let names=["disjoint22","nested13","singleton22","double33"],out=names.map(name=>({id:name+"-A",...prior.library[name]}));
 let b=prior.rows.find(x=>x.name==="double33"&&!x.guided&&x.success);out.push({id:"double33-B",task:prior.library.double33.task,program:b.program,free:b.free});return out}
function run(t,mode,grammar,source,cap=200000){
 let l={...grammar.count(),mapping:0,replay:0,priority:0},d=grammar.dim(t),limit=d+1,root=grammar.initial(t),n=root.r[0].length;
 let serial=0,expanded=0,peak=0,seen=new Set(),heap=[],queue=[],head=0,macroCount=0,checks=0;
 function charge(k){if(l.candidates>=cap)return false;l.candidates++;if(k)l[k]++;return true}
 function less(a,b){l.priority++;return a.score<b.score||a.score===b.score&&(a.st.program.length>b.st.program.length||a.st.program.length===b.st.program.length&&a.serial<b.serial)}
 function put(st,macro=null){let key=JSON.stringify(st.program);if(seen.has(key))return;seen.add(key);let item={st,macro,score:mismatch(st,t)+(d-st.free),serial:serial++};
 if(mode==="BFS")queue.push(item);else{let i=heap.length;heap.push(item);while(i){let p=(i-1)>>1;if(!less(heap[i],heap[p]))break;[heap[i],heap[p]]=[heap[p],heap[i]];i=p}}
 peak=Math.max(peak,mode==="BFS"?queue.length-head:heap.length)}
 function pop(){if(mode==="BFS"){let x=queue[head];queue[head++]=null;return x}let x=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){let j=2*i+1;if(j>=heap.length)break;if(j+1<heap.length&&less(heap[j+1],heap[j]))j++;if(!less(heap[j],heap[i]))break;[heap[i],heap[j]]=[heap[j],heap[i]];i=j}}return x}
 function result(success,more={}){return {name:t.name,mode,success,ledger:l,expanded,peak,macroCount,checks,...more}}
 put(root);
 if(mode==="REUSE"){
 for(let src of source){if(!!src.task.disjoint!==!!t.disjoint)continue;
 let ns=Math.max(...src.task.u,...src.task.v)+1,map=Array(ns).fill(-1);map[src.task.a]=t.a;map[src.task.b]=t.b;
 function compatible(i,j){return (!src.task.u.includes(i)||t.u.includes(j))&&(!src.task.v.includes(i)||t.v.includes(j))}
 function rec(i){
 if(i===ns){if(!charge("mapping"))return;let st=root;
 for(let f of src.program){if(!charge("replay"))return;let a={...f,i:map[f.i],j:map[f.j]};if(f.kind==="dep")a.zero=map[f.zero];st=grammar.advance(st,a,l);
 if(!st||st.free>d||st.program.length-st.free>1||st.program.length>limit)return;
 put(st,{source:src.id,map:map.slice(),length:st.program.length});macroCount++}
 return}
 if(map[i]>=0){if(compatible(i,map[i]))rec(i+1);return}
 for(let j=0;j<n;j++){if(!charge("mapping"))return;if(map.includes(j)||!compatible(i,j))continue;map[i]=j;rec(i+1);map[i]=-1}
 }
 rec(0);
 }
 }
 while((mode==="BFS"?head<queue.length:heap.length)){
 let {st,macro}=pop();
 if(st.free===d&&mismatch(st,t)===0){checks++;let proof=grammar.check(st,t,l);if(proof)return result(true,{program:st.program,free:st.free,proof,macro})}
 if(st.program.length>=limit)continue;
 expanded++;
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
 let acts=[];if(st.free<d)acts.push({kind:"free",i,j});if(st.program.length===st.free)for(let row=0;row<2;row++)for(let zero of [i,j])acts.push({kind:"dep",i,j,row,zero});
 for(let a of acts){if(!charge())return result(false,{reason:"candidate cap"});
 if(a.kind==="free"&&!st.r.some(r=>r[i].size||r[j].size))continue;
 let prev=st.program.at(-1);if(a.kind==="free"&&prev?.kind==="free"&&((prev.i===i&&prev.j===j)||(prev.i===j&&prev.j===i)))continue;
 let z=grammar.advance(st,a,l);if(!z||a.kind==="dep"&&sig(z)===sig(st)||z.free+limit-z.program.length<d)continue;put(z,macro)}
 }
 }
 return result(false,{reason:"frontier exhausted"})
}
function discover(grammar,prior){let source=sourceLibrary(prior),rows=[],library={};for(let t of targets){for(let mode of ["BFS","BEST","REUSE"]){let z=run(t,mode,grammar,source);rows.push(z);if(mode==="REUSE"&&z.success)library[t.name]={task:t,program:z.program,free:z.free,proof:z.proof}}}return {source,rows,library}}
module.exports={targets,run,discover,sourceLibrary};
if(require.main===module){let fs=require("node:fs"),g=require("./discover_givens.cjs"),p=JSON.parse(fs.readFileSync("results/rotation_discovery_library.json"));let r=discover(g,p);fs.writeFileSync("results/rotation_reuse_library.json",JSON.stringify(r,null,2));console.log(JSON.stringify(r.rows.map(x=>({name:x.name,mode:x.mode,success:x.success,ledger:x.ledger,macro:x.macro,reason:x.reason})),null,2))}
