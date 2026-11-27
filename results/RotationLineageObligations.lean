-- Bounded symbolic program obligations. Formal polynomial symbols represent
-- free cosine/sine, rho/sigma and dependent inverse normalizations.
-- Does not prove real interpretation, denominator positivity or global coverage.
abbrev Mon := List Nat
abbrev Poly := List (Mon × Int)
def ins (x : Nat) : Mon → Mon
  | [] => [x]
  | y :: ys => if x ≤ y then x :: y :: ys else y :: ins x ys
def monMul (a b : Mon) : Mon := a.foldl (fun acc x => ins x acc) b
def pmul (a b : Poly) : Poly :=
  a.flatMap (fun x => b.map (fun y => (monMul x.1 y.1, x.2 * y.2)))
def pneg (a : Poly) : Poly := a.map (fun x => (x.1, -x.2))
def padd (a b : Poly) : Poly := a ++ b
def pvar (x : Nat) : Poly := [([x], 1)]
def pone : Poly := [([], 1)]
def coeff (a : Poly) (m : Mon) : Int :=
  a.foldl (fun s t => if t.1 == m then s + t.2 else s) 0
def pzero (a : Poly) : Bool := a.all (fun t => coeff a t.1 == 0)
def getP (a : List Poly) (i : Nat) : Poly := a[i]?.getD []
def setP (a : List Poly) (i : Nat) (v : Poly) : List Poly :=
  (a.zipIdx).map (fun t => if t.2 == i then v else t.1)
def rowRot (a : List Poly) (i j : Nat) (c s : Poly) : List Poly :=
  let x := getP a i
  let y := getP a j
  setP (setP a i (padd (pmul c x) (pmul s y))) j (padd (pmul c y) (pneg (pmul s x)))
def freeRot (r : List (List Poly)) (i j k : Nat) : List (List Poly) :=
  r.map (fun a => rowRot a i j (pvar (3*k+2)) (pvar (3*k+3)))
def depRot (r : List (List Poly)) (i j k h z : Nat) : List (List Poly) :=
  let a := r[h]?.getD []
  let x := getP a i
  let y := getP a j
  let inv := pvar (3*k+4)
  let c := pmul (if z == i then y else x) inv
  let s := pmul (if z == i then pneg x else y) inv
  r.map (fun a => rowRot a i j c s)
def initial (n a b : Nat) (disjoint : Bool) : List (List Poly) :=
  [ (List.range n).map (fun i => if i == a then pone else []),
    (List.range n).map (fun i => if i == a then (if disjoint then [] else pvar 0)
      else if i == b then (if disjoint then pone else pvar 1) else []) ]
def entryZero (r : List (List Poly)) (h i : Nat) : Bool := pzero (getP (r[h]?.getD []) i)

def A_parent : List (List Poly) := freeRot (freeRot (depRot (freeRot (initial 4 0 1 false) 1 3 0) 0 1 1 1 0) 0 2 2) 0 1 3
theorem A_parent_zero_0_3 : entryZero A_parent 0 3 = true := by decide
theorem A_parent_zero_1_2 : entryZero A_parent 1 2 = true := by decide

def A_double34 : List (List Poly) := freeRot (freeRot (freeRot (depRot (freeRot (initial 5 0 1 false) 1 3 0) 0 1 1 1 0) 0 2 2) 0 1 3) 3 4 4
theorem A_double34_zero_0_3 : entryZero A_double34 0 3 = true := by decide
theorem A_double34_zero_0_4 : entryZero A_double34 0 4 = true := by decide
theorem A_double34_zero_1_2 : entryZero A_double34 1 2 = true := by decide

def A_double44 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 6 0 1 false) 1 3 0) 0 1 1 1 0) 0 2 2) 0 1 3) 2 5 4) 3 4 5
theorem A_double44_zero_0_3 : entryZero A_double44 0 3 = true := by decide
theorem A_double44_zero_0_4 : entryZero A_double44 0 4 = true := by decide
theorem A_double44_zero_1_2 : entryZero A_double44 1 2 = true := by decide
theorem A_double44_zero_1_5 : entryZero A_double44 1 5 = true := by decide

def A_triple44 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 5 0 1 false) 1 4 0) 0 1 1 1 0) 0 2 2) 0 1 3) 2 3 4) 0 2 5
theorem A_triple44_zero_0_4 : entryZero A_triple44 0 4 = true := by decide
theorem A_triple44_zero_1_3 : entryZero A_triple44 1 3 = true := by decide

def A_triple45 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 6 0 1 false) 1 4 0) 0 1 1 1 0) 0 2 2) 0 1 3) 2 3 4) 0 2 5) 4 5 6
theorem A_triple45_zero_0_4 : entryZero A_triple45 0 4 = true := by decide
theorem A_triple45_zero_0_5 : entryZero A_triple45 0 5 = true := by decide
theorem A_triple45_zero_1_3 : entryZero A_triple45 1 3 = true := by decide

def B_parent : List (List Poly) := freeRot (freeRot (depRot (freeRot (initial 4 0 1 false) 1 2 0) 0 2 1 1 2) 1 3 2) 0 1 3
theorem B_parent_zero_0_3 : entryZero B_parent 0 3 = true := by decide
theorem B_parent_zero_1_2 : entryZero B_parent 1 2 = true := by decide

def B_double34 : List (List Poly) := freeRot (freeRot (freeRot (depRot (freeRot (initial 5 0 1 false) 1 2 0) 0 2 1 1 2) 1 3 2) 0 1 3) 3 4 4
theorem B_double34_zero_0_3 : entryZero B_double34 0 3 = true := by decide
theorem B_double34_zero_0_4 : entryZero B_double34 0 4 = true := by decide
theorem B_double34_zero_1_2 : entryZero B_double34 1 2 = true := by decide

def B_double44 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 6 0 1 false) 1 2 0) 0 2 1 1 2) 1 3 2) 0 1 3) 2 5 4) 3 4 5
theorem B_double44_zero_0_3 : entryZero B_double44 0 3 = true := by decide
theorem B_double44_zero_0_4 : entryZero B_double44 0 4 = true := by decide
theorem B_double44_zero_1_2 : entryZero B_double44 1 2 = true := by decide
theorem B_double44_zero_1_5 : entryZero B_double44 1 5 = true := by decide

def B_triple44 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 5 0 1 false) 1 2 0) 0 2 1 1 2) 1 4 2) 0 1 3) 2 3 4) 0 2 5
theorem B_triple44_zero_0_4 : entryZero B_triple44 0 4 = true := by decide
theorem B_triple44_zero_1_3 : entryZero B_triple44 1 3 = true := by decide

def B_triple45 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 6 0 1 false) 1 2 0) 0 2 1 1 2) 1 4 2) 0 1 3) 2 3 4) 0 2 5) 4 5 6
theorem B_triple45_zero_0_4 : entryZero B_triple45 0 4 = true := by decide
theorem B_triple45_zero_0_5 : entryZero B_triple45 0 5 = true := by decide
theorem B_triple45_zero_1_3 : entryZero B_triple45 1 3 = true := by decide

def C_parent : List (List Poly) := freeRot (freeRot (depRot (freeRot (initial 4 0 1 false) 1 3 0) 0 1 1 1 1) 1 2 2) 0 1 3
theorem C_parent_zero_0_3 : entryZero C_parent 0 3 = true := by decide
theorem C_parent_zero_1_2 : entryZero C_parent 1 2 = true := by decide

def C_double34 : List (List Poly) := freeRot (freeRot (freeRot (depRot (freeRot (initial 5 0 1 false) 1 3 0) 0 1 1 1 1) 1 2 2) 0 1 3) 3 4 4
theorem C_double34_zero_0_3 : entryZero C_double34 0 3 = true := by decide
theorem C_double34_zero_0_4 : entryZero C_double34 0 4 = true := by decide
theorem C_double34_zero_1_2 : entryZero C_double34 1 2 = true := by decide

def C_double44 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 6 0 1 false) 1 3 0) 0 1 1 1 1) 1 2 2) 0 1 3) 2 5 4) 3 4 5
theorem C_double44_zero_0_3 : entryZero C_double44 0 3 = true := by decide
theorem C_double44_zero_0_4 : entryZero C_double44 0 4 = true := by decide
theorem C_double44_zero_1_2 : entryZero C_double44 1 2 = true := by decide
theorem C_double44_zero_1_5 : entryZero C_double44 1 5 = true := by decide

def C_triple44 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 5 0 1 false) 1 4 0) 0 1 1 1 1) 1 2 2) 0 1 3) 2 3 4) 0 2 5
theorem C_triple44_zero_0_4 : entryZero C_triple44 0 4 = true := by decide
theorem C_triple44_zero_1_3 : entryZero C_triple44 1 3 = true := by decide

def C_triple45 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 6 0 1 false) 1 4 0) 0 1 1 1 1) 1 2 2) 0 1 3) 2 3 4) 0 2 5) 4 5 6
theorem C_triple45_zero_0_4 : entryZero C_triple45 0 4 = true := by decide
theorem C_triple45_zero_0_5 : entryZero C_triple45 0 5 = true := by decide
theorem C_triple45_zero_1_3 : entryZero C_triple45 1 3 = true := by decide

def D_parent : List (List Poly) := freeRot (depRot (freeRot (freeRot (initial 4 0 1 false) 1 2 0) 1 3 1) 0 2 2 1 2) 0 1 3
theorem D_parent_zero_0_3 : entryZero D_parent 0 3 = true := by decide
theorem D_parent_zero_1_2 : entryZero D_parent 1 2 = true := by decide

def D_double34 : List (List Poly) := freeRot (freeRot (depRot (freeRot (freeRot (initial 5 0 1 false) 1 2 0) 1 3 1) 0 2 2 1 2) 0 1 3) 3 4 4
theorem D_double34_zero_0_3 : entryZero D_double34 0 3 = true := by decide
theorem D_double34_zero_0_4 : entryZero D_double34 0 4 = true := by decide
theorem D_double34_zero_1_2 : entryZero D_double34 1 2 = true := by decide

def D_double44 : List (List Poly) := freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 6 0 1 false) 1 2 0) 1 3 1) 0 2 2 1 2) 0 1 3) 2 5 4) 3 4 5
theorem D_double44_zero_0_3 : entryZero D_double44 0 3 = true := by decide
theorem D_double44_zero_0_4 : entryZero D_double44 0 4 = true := by decide
theorem D_double44_zero_1_2 : entryZero D_double44 1 2 = true := by decide
theorem D_double44_zero_1_5 : entryZero D_double44 1 5 = true := by decide

def D_triple44 : List (List Poly) := freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 5 0 1 false) 1 2 0) 1 4 1) 0 2 2 1 2) 0 1 3) 2 3 4) 0 2 5
theorem D_triple44_zero_0_4 : entryZero D_triple44 0 4 = true := by decide
theorem D_triple44_zero_1_3 : entryZero D_triple44 1 3 = true := by decide

def D_triple45 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 6 0 1 false) 1 2 0) 1 4 1) 0 2 2 1 2) 0 1 3) 2 3 4) 0 2 5) 4 5 6
theorem D_triple45_zero_0_4 : entryZero D_triple45 0 4 = true := by decide
theorem D_triple45_zero_0_5 : entryZero D_triple45 0 5 = true := by decide
theorem D_triple45_zero_1_3 : entryZero D_triple45 1 3 = true := by decide

def E_parent : List (List Poly) := freeRot (depRot (freeRot (freeRot (initial 4 0 1 false) 1 2 0) 2 3 1) 0 2 2 1 2) 0 1 3
theorem E_parent_zero_0_3 : entryZero E_parent 0 3 = true := by decide
theorem E_parent_zero_1_2 : entryZero E_parent 1 2 = true := by decide

def E_double34 : List (List Poly) := freeRot (freeRot (depRot (freeRot (freeRot (initial 5 0 1 false) 1 2 0) 2 3 1) 0 2 2 1 2) 0 1 3) 3 4 4
theorem E_double34_zero_0_3 : entryZero E_double34 0 3 = true := by decide
theorem E_double34_zero_0_4 : entryZero E_double34 0 4 = true := by decide
theorem E_double34_zero_1_2 : entryZero E_double34 1 2 = true := by decide

def E_double44 : List (List Poly) := freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 6 0 1 false) 1 2 0) 2 3 1) 0 2 2 1 2) 0 1 3) 2 5 4) 3 4 5
theorem E_double44_zero_0_3 : entryZero E_double44 0 3 = true := by decide
theorem E_double44_zero_0_4 : entryZero E_double44 0 4 = true := by decide
theorem E_double44_zero_1_2 : entryZero E_double44 1 2 = true := by decide
theorem E_double44_zero_1_5 : entryZero E_double44 1 5 = true := by decide

def E_triple44 : List (List Poly) := freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 5 0 1 false) 1 2 0) 2 4 1) 0 2 2 1 2) 0 1 3) 2 3 4) 0 2 5
theorem E_triple44_zero_0_4 : entryZero E_triple44 0 4 = true := by decide
theorem E_triple44_zero_1_3 : entryZero E_triple44 1 3 = true := by decide

def E_triple45 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 6 0 1 false) 1 2 0) 2 4 1) 0 2 2 1 2) 0 1 3) 2 3 4) 0 2 5) 4 5 6
theorem E_triple45_zero_0_4 : entryZero E_triple45 0 4 = true := by decide
theorem E_triple45_zero_0_5 : entryZero E_triple45 0 5 = true := by decide
theorem E_triple45_zero_1_3 : entryZero E_triple45 1 3 = true := by decide

def F_parent : List (List Poly) := freeRot (depRot (freeRot (freeRot (initial 4 0 1 false) 1 3 0) 1 2 1) 0 2 2 1 2) 0 1 3
theorem F_parent_zero_0_3 : entryZero F_parent 0 3 = true := by decide
theorem F_parent_zero_1_2 : entryZero F_parent 1 2 = true := by decide

def F_double34 : List (List Poly) := freeRot (freeRot (depRot (freeRot (freeRot (initial 5 0 1 false) 1 3 0) 1 2 1) 0 2 2 1 2) 0 1 3) 3 4 4
theorem F_double34_zero_0_3 : entryZero F_double34 0 3 = true := by decide
theorem F_double34_zero_0_4 : entryZero F_double34 0 4 = true := by decide
theorem F_double34_zero_1_2 : entryZero F_double34 1 2 = true := by decide

def F_double44 : List (List Poly) := freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 6 0 1 false) 1 3 0) 1 2 1) 0 2 2 1 2) 0 1 3) 2 5 4) 3 4 5
theorem F_double44_zero_0_3 : entryZero F_double44 0 3 = true := by decide
theorem F_double44_zero_0_4 : entryZero F_double44 0 4 = true := by decide
theorem F_double44_zero_1_2 : entryZero F_double44 1 2 = true := by decide
theorem F_double44_zero_1_5 : entryZero F_double44 1 5 = true := by decide

def F_triple44 : List (List Poly) := freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 5 0 1 false) 1 4 0) 1 2 1) 0 2 2 1 2) 0 1 3) 2 3 4) 0 2 5
theorem F_triple44_zero_0_4 : entryZero F_triple44 0 4 = true := by decide
theorem F_triple44_zero_1_3 : entryZero F_triple44 1 3 = true := by decide

def F_triple45 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 6 0 1 false) 1 4 0) 1 2 1) 0 2 2 1 2) 0 1 3) 2 3 4) 0 2 5) 4 5 6
theorem F_triple45_zero_0_4 : entryZero F_triple45 0 4 = true := by decide
theorem F_triple45_zero_0_5 : entryZero F_triple45 0 5 = true := by decide
theorem F_triple45_zero_1_3 : entryZero F_triple45 1 3 = true := by decide
