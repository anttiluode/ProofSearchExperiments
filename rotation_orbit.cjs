function rotationPilot(){
function rng(s){return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
const ledger=()=>({actions:0,arithmetic:0,gcd:0,key:0,frontier:0,angle:0,cost:0});
function gcd(a,b,l){a=a<0n?-a:a;b=b<0n?-b:b;while(b){l.gcd++;[a,b]=[b,a%b]}return a}
function reduce(A,d,l){let g=d;for(let row of A)for(let x of row){if(g===1n)break;g=gcd(g,x,l)}if(g>1n){d/=g;l.arithmetic++;for(let row of A)for(let j=0;j<row.length;j++){row[j]/=g;l.arithmetic++}}return {A,d}}
function rot(S,r,l){l.actions++;let {i,j,c,s,h}=r,n=S.A.length;let A=S.A.map(row=>row.map(x=>{l.arithmetic++;return x*h}));for(let k=0;k<n;k++){let x=S.A[k][i],y=S.A[k][j];A[k][i]=c*x+s*y;A[k][j]=-s*x+c*y;l.arithmetic+=6}
 let B=A.map(row=>row.map(x=>{l.arithmetic++;return x*h}));for(let k=0;k<n;k++){let x=A[i][k],y=A[j][k];B[i][k]=c*x+s*y;B[j][k]=-s*x+c*y;l.arithmetic+=6}
 l.arithmetic+=2;return reduce(B,S.d*h*h,l)}
function cost(S,l){let e=0;for(let i=0;i<S.A.length;i++)for(let j=i+1;j<S.A.length;j++){l.cost++;if(S.A[i][j]!==0n)e++}return e}
function key(S,l){let a=[String(S.d)];for(let row of S.A)for(let x of row){l.key++;a.push(String(x))}return a.join(",")}
function actions(n){let out=[];for(let i=1;i<n-1;i++)for(let j=i+1;j<n-1;j++)for(let [c,s,h] of [[3n,4n,5n],[3n,-4n,5n],[5n,12n,13n],[5n,-12n,13n]])out.push({i,j,c,s,h});return out}
function gen(seed,dense){let r=rng(seed),n=6+seed%3,A=Array.from({length:n},()=>Array(n).fill(0n));for(let i=0;i<n;i++)A[i][i]=BigInt(12+Math.floor(r()*9));for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(dense||j===i+1){let v=BigInt(1+Math.floor(r()*7));A[i][j]=A[j][i]=v}let base={A,d:1n},start=base,scramble=[],a=actions(n);if(!dense)for(let k=0;k<2+seed%2;k++){let x=a[Math.floor(r()*a.length)];scramble.push(x);start=rot(start,x,ledger())}return {seed,dense,start,base,scramble,a}}
function sqrt(n,l){if(n<2n)return n;let x=1n<<BigInt(Math.ceil(n.toString(2).length/2));while(true){let y=(x+n/x)/2n;l.angle+=3;if(y>=x)return x;x=y}}
function angles(S,l){let a=[],n=S.A.length,seen=new Set();for(let i=1;i<n-1;i++)for(let j=i+1;j<n-1;j++)for(let k=0;k<n;k++){if(k===i||k===j)continue;l.angle++;let x=S.A[k][i],y=S.A[k][j];if(!x||!y)continue;let h=sqrt(x*x+y*y,l);l.angle+=5;if(h*h!==x*x+y*y)continue;let g=gcd(gcd(x,y,l),h,l);let c=x/g,s=y/g,d=h/g;l.angle+=3;if(c<0n){c=-c;s=-s}let key=[i,j,c,s,d].join(",");if(!seen.has(key)){seen.add(key);a.push({i,j,c,s,h:d})}}return a}
function solve(p,mode){let l=ledger(),root={S:p.start,e:cost(p.start,l),path:[],curve:[]},best=root,frontier=[root],seen=new Map([[key(root.S,l),0]]),cap=384;
function improve(x,y){l.frontier++;return x.e<y.e||x.e===y.e&&x.path.length<y.path.length}
while(frontier.length&&l.actions<cap){let cur;if(mode==="best"){let b=0;for(let j=1;j<frontier.length;j++)if(improve(frontier[j],frontier[b]))b=j;cur=frontier.splice(b,1)[0]}else cur=frontier.shift();if(cur.path.length>=3&&["best","bfs"].includes(mode))continue;let next=null;
 let aa=mode==="givens"?angles(cur.S,l):p.a;
 for(let a of aa){if(l.actions>=cap)break;let S=rot(cur.S,a,l),e=cost(S,l),path=[...cur.path,a],x={S,e,path,curve:[...cur.curve,e]},k=key(S,l);if(seen.has(k)&&seen.get(k)<=path.length)continue;seen.set(k,path.length);if(improve(x,best))best=x;
 if(mode==="greedy"||mode==="givens"){if(e<cur.e&&(!next||improve(x,next)))next=x}else frontier.push(x)}
 if(mode==="greedy"||mode==="givens"){if(next)frontier.push(next)}
}return {best,l}}
function mul(A,B){return A.map(row=>B[0].map((_,j)=>row.reduce((s,x,k)=>s+x*B[k][j],0n)))}
function tr(A){return A[0].map((_,j)=>A.map(row=>row[j]))}
function eye(n){return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1n:0n))}
function verify(p,b){let n=p.start.A.length,Q=eye(n),d=1n;for(let r of b.path){let T=eye(n).map(row=>row.map(x=>x*r.h));T[r.i][r.i]=T[r.j][r.j]=r.c;T[r.i][r.j]=-r.s;T[r.j][r.i]=r.s;if(r.c*r.c+r.s*r.s!==r.h*r.h||r.i<1||r.j>=n-1)throw Error("invalid angle");Q=mul(Q,T);d*=r.h}let qtq=mul(tr(Q),Q);for(let i=0;i<n;i++)for(let j=0;j<n;j++){if(qtq[i][j]!== (i===j?d*d:0n))throw Error("orthogonal");if((i===0||i===n-1)&&Q[i][j]!==(i===j?d:0n))throw Error("port");if(b.S.A[i][j]!==b.S.A[j][i])throw Error("asymmetry")}
let T=mul(mul(tr(Q),p.start.A),Q);for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(T[i][j]*b.S.d!==b.S.A[i][j]*p.start.d*d*d)throw Error("dense verification");return true}
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],neg=a=>[-a[0],-a[1]],cm=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],cd=(a,b)=>{let d=b[0]**2+b[1]**2;return cm(a,[b[0]/d,-b[1]/d])},abs=a=>Math.hypot(...a);
function response(S,w){let n=S.A.length,C=S.A.map((row,i)=>row.map((x,j)=>[Number(x)/Number(S.d)+(i===j&&i>0&&i<n-1?w:0),i===j&&(i===0||i===n-1)?-1:0]).concat([[i===0?1:0,0]]));for(let k=0;k<n;k++){let j=k;for(let i=k+1;i<n;i++)if(abs(C[i][k])>abs(C[j][k]))j=i;[C[k],C[j]]=[C[j],C[k]];let pivot=C[k][k];for(let q=k;q<=n;q++)C[k][q]=cd(C[k][q],pivot);for(let i=0;i<n;i++)if(i!==k){let v=C[i][k];for(let q=k;q<=n;q++)C[i][q]=add(C[i][q],neg(cm(v,C[k][q])))}}return [add([1,0],cm([0,2],C[0][n])),cm([0,-2],C[n-1][n])]}
let rows=[],cases=[];for(let dense of [false,true])for(let seed=dense?52000:51000;seed<(dense?52012:51024);seed++){
let p=gen(seed,dense),initial=cost(p.start,ledger()),reference=dense?null:cost(p.base,ledger());cases.push({seed,dense,n:p.start.A.length-2,initial,reference,start:p.start,scramble:p.scramble});
for(let mode of ["greedy","givens","best","bfs"]){let {best:b,l}=solve(p,mode);verify(p,b);let error=0;for(let w of [-2,-1,0,1,2]){let x=response(p.start,w),y=response(b.S,w);for(let i=0;i<2;i++)error=Math.max(error,abs(add(x[i],neg(y[i]))))}if(!Number.isFinite(error))throw Error("response");let nonmonotone=b.curve.some((e,i)=>e>=(i?b.curve[i-1]:initial));rows.push({seed,dense,n:p.start.A.length-2,mode,initial,reference,edges:b.e,stages:b.path.length,curve:b.curve,nonmonotone,error,ledger:l,path:b.path,output:b.S})}}
let summary=[];for(let dense of [false,true])for(let mode of ["greedy","givens","best","bfs"]){let a=rows.filter(x=>x.dense===dense&&x.mode===mode),mean=f=>a.reduce((s,x)=>s+f(x),0)/a.length;summary.push({dense,mode,n:a.length,improved:a.filter(x=>x.edges<x.initial).length,referenceReached:dense?null:a.filter(x=>x.edges<=x.reference).length,meanEdges:mean(x=>x.edges),meanInitial:mean(x=>x.initial),meanStages:mean(x=>x.stages),nonmonotone:a.filter(x=>x.nonmonotone&&x.edges<x.initial).length,meanActions:mean(x=>x.ledger.actions),meanWork:mean(x=>Object.values(x.ledger).reduce((s,v)=>s+v,0)),maxError:Math.max(...a.map(x=>x.error))})}
return {summary,rows,cases}
}
const fs=require('node:fs');const r=rotationPilot();fs.writeFileSync('results/rotation_orbit.json',JSON.stringify(r,(_,v)=>typeof v==='bigint'?v.toString():v));console.log(JSON.stringify(r.summary,null,2));
