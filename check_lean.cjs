const {spawnSync}=require('node:child_process');
function lean(path){const r=spawnSync('lean',[path],{encoding:'utf8'});if(r.error)throw r.error;return r}
const ok=lean('results/CompactCertificates.lean');if(ok.status!==0)throw Error(ok.stdout+ok.stderr);
const bad=lean('results/WrongWitness.lean');if(bad.status===0||!/type mismatch/i.test(bad.stdout+bad.stderr))throw Error('wrong witness control did not fail as expected: '+bad.stdout+bad.stderr);
console.log('Lean accepted 64 compact graph certificates and 2 generic macros; rejected wrong witness.');
