function phaseFollowup(){
function hash(x){x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return (x^(x>>>16))>>>0}
function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function ports(n,k,win,r){let q=new Set();while(q.size<3*k)q.add(Math.floor(r()*n));let [a,b,c,...rest]=q;let out=[[a,b],[a,c],win?[a,rest[0]]:[b,c]];let pos=1;for(let p of out)while(p.length<k)p.push(rest[pos++]);return out}
const re=[1,0,-1,0],im=[0,1,0,-1];
function codebook(N,B,R){let codes=[];for(let j=0;j<R;j++){let a=new Uint16Array(N),b=new Uint8Array(N),c=new Uint8Array(N);for(let w=0;w<N;w++){a[w]=hash(w^hash(100+j*17))%B;b[w]=hash(w^hash(200+j*31))&3;c[w]=hash(w^hash(300+j*47))&3}codes.push([a,b,c])}return codes}
function estimate(ps,B,R,codes){let phase=0,count=0;for(let j=0;j<R;j++){let [a,b,c]=codes[j];let x=Array.from({length:3},()=>new Int32Array(B)),y=Array.from({length:3},()=>new Int32Array(B)),n=Array.from({length:3},()=>new Int32Array(B));for(let p=0;p<3;p++)for(let w of ps[p]){let h=a[w],q=p===0?b[w]:p===1?c[w]:(8-b[w]-c[w])&3;x[p][h]+=re[q];y[p][h]+=im[q];n[p][h]++}for(let h=0;h<B;h++){let ar=x[0][h],ai=y[0][h],br=x[1][h],bi=y[1][h],cr=x[2][h],ci=y[2][h];phase+=(ar*br-ai*bi)*cr-(ar*bi+ai*br)*ci;count+=n[0][h]*n[1][h]*n[2][h]}}return [phase/R,count/R]}
let result=[];
for(let N of [512,2048])for(let k of [2,4,8,16,32,64]){let cases=[];for(let seed=10000;seed<10128;seed++){let r=rng(seed+N*19+k*701),winner=seed%8,sets=Array.from({length:8},(_,j)=>ports(N,k,j===winner,r));let negative=ports(N,k,false,r);for(let j=0;j<9;j++){let p=j===8?negative:sets[j],count=p[0].filter(w=>p[1].includes(w)&&p[2].includes(w)).length;if(count!==+(j===winner))throw Error("bad truth")}cases.push({seed,winner,sets,negative})}
for(let B of [16,32,64,128,256]){let R=256/B,codes=codebook(N,B,R),rows=[];for(let c of cases){let scores=c.sets.map(p=>estimate(p,B,R,codes));let neg=estimate(c.negative,B,R,codes);let tops=[0,1].map(i=>scores.reduce((best,p,j)=>p[i]>scores[best][i]?j:best,0));rows.push({seed:c.seed,winner:c.winner,tops,scores,neg})}result.push({N,k,B,R,rows})}}
return result}
const fs=require('node:fs');fs.mkdirSync('results',{recursive:true});fs.writeFileSync('results/phase_buckets_raw.json',JSON.stringify(phaseFollowup()));
