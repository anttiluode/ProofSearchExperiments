// Diagnostic observer: instrument a pinned version of the original solver.
// No observer operation is charged to the old ledger or used in its decisions.
function instrument(source){
 function patch(a,b){if(source.split(a).length!==2)throw Error("instrument anchor "+a);source=source.replace(a,b)}
 patch("function solveH(p,mode,budget=Infinity,lib={},startOffset=0,starts=8){","function solveH(p,mode,budget=Infinity,lib={},startOffset=0,starts=8,observe=()=>{}){");
 patch("l.restarts++;let limit=(restart-startOffset+1)*512,cur=seedState(c,p,restart,r,ra,l)","observe({event:'start',restart,work:work(raw),rotations:raw.rotations});l.restarts++;let limit=(restart-startOffset+1)*512,cur=seedState(c,p,restart,r,ra,l)");
 patch("consider(cur);let loss=value(cur,p,c,prune,smooth,l);","consider(cur);let loss=value(cur,p,c,prune,smooth,l);observe({event:'seed',restart,work:work(raw),rotations:raw.rotations,full:cur.m.loss,stage:loss,success:cur.m.success,...margin(cur,c,p)});");
 patch("smooth=false;loss=cur.m.loss;cache=null;mu=1e-3;telemetry.stageTransitions++","smooth=false;loss=cur.m.loss;cache=null;mu=1e-3;telemetry.stageTransitions++;observe({event:'transition',restart,it,work:work(raw),rotations:raw.rotations,full:cur.m.loss,stage:loss})");
 patch("l.iterations++;l.cache++;if(cache)","let before={event:'trial',restart,it,work0:work(raw),rot0:raw.rotations,full0:cur.m.loss,stage0:loss,mu0:mu,smooth,...margin(cur,c,p)};observe({...before,event:'attempt'});l.iterations++;l.cache++;if(cache)");
 patch("if(!delta.every(Number.isFinite))break;","if(!delta.every(Number.isFinite))break;\n let gg=m.g??[];before.gradNorm=Math.hypot(...gg);before.baseGrad=Math.hypot(...gg.slice(0,c.base.length));before.tailGrad=Math.hypot(...gg.slice(c.base.length));");
 patch("if(trial.m.success||val<loss){cur=trial;loss=val;cache=null;mu=Math.max(1e-12,mu/3);sa++;telemetry.accepted++}else{mu*=10;telemetry.rejected++}","let accepted=trial.m.success||val<loss;if(accepted){cur=trial;loss=val;cache=null;mu=Math.max(1e-12,mu/3);sa++;telemetry.accepted++}else{mu*=10;telemetry.rejected++}\n observe({...before,work:work(raw),rotations:raw.rotations,full:cur.m.loss,stage:loss,trialFull:trial.m.loss,trialStage:val,accepted,mu,success:cur.m.success,afterMargin:margin(cur,c,p)});");
 patch('}catch(e){if(e!==BUDGET)throw e;stop="work cap"}','}catch(e){if(e!==BUDGET)throw e;stop="work cap"}\n observe({event:"end",work:work(raw),rotations:raw.rotations,stop,success:best?.m.success});');
 let m={exports:{}};new Function("module","require","margin",source)(m,{},margin);return m.exports;
}
function margin(cur,c,p){
 if(!c.synth)return {hMin:null,minPort:null};
 let rows=c.proof.ports.map(port=>cur.B[port].slice()),norms=rows.map(r=>Math.hypot(...r.slice(1,p.n+1))),h=Infinity;
 for(let k=0;k<cur.ts.length;k++){let q=cur.ts[k],f=c.synth.program[k];if(f.kind==="dep")h=Math.min(h,Math.hypot(rows[f.row][q.i],rows[f.row][q.j])/norms[f.row]);for(let a of rows){let x=a[q.i],y=a[q.j];a[q.i]=q.c*x+q.s*y;a[q.j]=q.c*y-q.s*x}}
 let minPort=Infinity;for(let j=0;j<2;j++)for(let i of c.proof.supports[j])minPort=Math.min(minPort,Math.abs(rows[j][i])/norms[j]);
 return {hMin:Number.isFinite(h)?h:null,minPort}
}
function run(f,g,lib,ids){f.setEvaluator(g.evalProgram);let out=[];for(let seed of ids)for(let mode of ["FIRST","TOP"])for(let budget of [2000000,Infinity]){let p=f.problem(seed),type=f.generate(seed).type,id=f.chosen(lib,type,mode),events=[];let z=f.solveH(p,"SYN",budget,f.item(lib,type,id),0,8,e=>events.push(e));let {path,...r}=z;out.push({...r,mode,type,id,stages:path.length,events})}return out}
function starts(rows){let out=[];for(let r of rows){let s=null;function close(censored){if(!s)return;s.censored=censored;s.success=s.trials.some(x=>x.success)||!!s.seedEvent?.success;s.work=(s.trials.at(-1)?.work??s.seedEvent?.work??s.start.work)-s.start.work;s.rotations=(s.trials.at(-1)?.rotations??s.seedEvent?.rotations??s.start.rotations)-s.start.rotations;out.push(s)}
 for(let e of r.events){if(e.event==="start"){close(false);s={seed:r.seed,n:r.n,mode:r.mode,budget:r.budget,restart:e.restart,start:e,trials:[],transitions:[]}}else if(e.event==="seed"){s.seedEvent=e}else if(e.event==="trial"){s.trials.push(e)}else if(e.event==="transition"){s.transitions.push(e)}else if(e.event==="end"){close(e.stop==="work cap"&&!e.success);s=null}}
 }return out}
function med(a){if(!a.length)return null;let b=a.slice().sort((x,y)=>x-y),k=b.length>>1;return b.length%2?b[k]:(b[k-1]+b[k])/2}
function auc(a,b){if(!a.length||!b.length)return null;let s=0;for(let x of a)for(let y of b)s+=x>y?1:x===y?.5:0;return s/(a.length*b.length)}
function summarize(rows){
 let all=starts(rows),out=[];
 for(let n of [8,9])for(let mode of ["FIRST","TOP","both"]){
 let a=all.filter(x=>x.budget===null&&x.n===n&&(mode==="both"||x.mode===mode)),wins=a.filter(x=>x.success),fail=a.filter(x=>!x.success&&!x.censored);
 let pref=[];for(let k of [4,6,8]){let feature=s=>{let e=s.trials[k-1],z=s.seedEvent;return {progress:(Math.log(Math.max(z.full,1e-30))-Math.log(Math.max(e.full,1e-30)))/Math.max(1,e.work-z.work)*1e6,loss:-Math.log(Math.max(e.full,1e-30)),grad:-Math.log(Math.max(e.gradNorm,1e-30)),margin:e.afterMargin.hMin,port:e.afterMargin.minPort,work:e.work-s.start.work}};
 let wa=wins.filter(s=>s.trials.length>=k).map(feature),fa=fail.filter(s=>s.trials.length>=k).map(feature),fields={};for(let f of ["progress","loss","grad","margin","port","work"]){let x=wa.map(a=>a[f]).filter(Number.isFinite),y=fa.map(a=>a[f]).filter(Number.isFinite);fields[f]={win:med(x),fail:med(y),auc:auc(x,y)}}
 pref.push({k,wins:wa.length,fail:fa.length,excludedWins:wins.length-wa.length,excludedFail:fail.length-fa.length,fields})}
 let fixed=all.filter(x=>x.budget===2000000&&x.n===n&&(mode==="both"||x.mode===mode));
 out.push({n,mode,rotationOnly:{starts:a.length,wins:wins.length,fail:fail.length,winWork:med(wins.map(s=>s.work)),failWork:med(fail.map(s=>s.work)),winTrials:med(wins.map(s=>s.trials.length)),failTrials:med(fail.map(s=>s.trials.length)),winRotations:med(wins.map(s=>s.rotations)),failRotations:med(fail.map(s=>s.rotations)),winBeyond:[200,256,512].map(cap=>({cap,count:wins.filter(s=>s.rotations>cap).length})),winBeyond1M:wins.filter(s=>s.work>1e6).length,pref},fixed:{starts:fixed.length,wins:fixed.filter(x=>x.success).length,censored:fixed.filter(x=>x.censored).length,completedNonwinning:fixed.filter(x=>!x.success&&!x.censored).length}});
 }return out
}
module.exports={instrument,run,starts,summarize};
if(require.main===module){let fs=require("node:fs"),d=require("./discover_givens.cjs"),lib=JSON.parse(fs.readFileSync("results/rotation_quality_library.json")),f=instrument(fs.readFileSync("rotation_quality.cjs","utf8")),rows=run(f,d,lib,f.target);fs.writeFileSync("results/rotation_trajectory_reproduced.json",JSON.stringify({summary:summarize(rows),rows},null,2))}
