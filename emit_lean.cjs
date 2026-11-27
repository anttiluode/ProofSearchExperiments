function emit(raw){
let lines=["-- Compact proof terms from independently checked directed paths.","-- All used graph edges are local hypotheses. Unused hypotheses can be added by weakening.",""];
for(let c of raw.multi.filter(x=>!x.neg)){
 let proof=c.blind,terms=[];
 lines.push(`theorem case_${c.seed} (Goal : Prop)`);
 for(let p=0;p<3;p++){
  lines.push(`    (R${p} : Nat → Nat → Prop)`,`    (join${p} : ∀ {a b c : Nat}, R${p} a b → R${p} b c → R${p} a c)`);
  let a=proof.paths[p];
  if(a[0]!==16||a[a.length-1]!==proof.m)throw Error("path endpoints");
  let term=`h${p}_0`;
  for(let i=0;i<a.length-1;i++){lines.push(`    (h${p}_${i} : R${p} ${a[i]} ${a[i+1]})`);if(i)term=`(join${p} ${term} h${p}_${i})`}
  terms.push(term)
 }
 lines.push(`    (rule : ∀ m : Nat, R0 16 m → R1 16 m → R2 16 m → Goal) : Goal :=`,`  rule ${proof.m} ${terms.join(" ")}`,"")
}
lines.push("-- Generic arity-level composition controls for the motif experiment.",
"theorem macro3 {A : Type} (P Q R : A → A → Prop) {a b c d : A}",
"    (h0 : P a b) (h1 : Q b c) (h2 : R c d) :",
"    ∃ x y, P a x ∧ Q x y ∧ R y d := ⟨b, c, h0, h1, h2⟩","",
"theorem macro4 {A : Type} (P Q R S : A → A → Prop) {a b c d e : A}",
"    (h0 : P a b) (h1 : Q b c) (h2 : R c d) (h3 : S d e) :",
"    ∃ x y z, P a x ∧ Q x y ∧ R y z ∧ S z e := ⟨b, c, d, h0, h1, h2, h3⟩","");
return lines.join("\n")
}
const fs=require('node:fs');const raw=JSON.parse(fs.readFileSync('results/raw.json','utf8'));fs.writeFileSync('results/CompactCertificates.lean',emit(raw));
