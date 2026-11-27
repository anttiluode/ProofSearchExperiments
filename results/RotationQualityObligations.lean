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

def triple55_0 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 7 0 1 false) 1 4 0) 0 1 1 1 0) 0 2 2) 0 1 3) 2 3 4) 0 2 5) 3 6 6) 4 5 7
theorem triple55_0_zero_0_4 : entryZero triple55_0 0 4 = true := by decide
theorem triple55_0_zero_0_5 : entryZero triple55_0 0 5 = true := by decide
theorem triple55_0_zero_1_3 : entryZero triple55_0 1 3 = true := by decide
theorem triple55_0_zero_1_6 : entryZero triple55_0 1 6 = true := by decide

def triple55_4 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 7 0 1 false) 1 2 0) 0 2 1 1 2) 1 4 2) 0 1 3) 2 3 4) 0 2 5) 3 6 6) 4 5 7
theorem triple55_4_zero_0_4 : entryZero triple55_4 0 4 = true := by decide
theorem triple55_4_zero_0_5 : entryZero triple55_4 0 5 = true := by decide
theorem triple55_4_zero_1_3 : entryZero triple55_4 1 3 = true := by decide
theorem triple55_4_zero_1_6 : entryZero triple55_4 1 6 = true := by decide

def triple55_8 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 7 0 1 false) 1 4 0) 0 1 1 1 1) 1 2 2) 0 1 3) 2 3 4) 0 2 5) 3 6 6) 4 5 7
theorem triple55_8_zero_0_4 : entryZero triple55_8 0 4 = true := by decide
theorem triple55_8_zero_0_5 : entryZero triple55_8 0 5 = true := by decide
theorem triple55_8_zero_1_3 : entryZero triple55_8 1 3 = true := by decide
theorem triple55_8_zero_1_6 : entryZero triple55_8 1 6 = true := by decide

def triple55_12 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 7 0 1 false) 1 2 0) 2 4 1) 0 2 2 1 2) 0 1 3) 2 3 4) 0 2 5) 3 6 6) 4 5 7
theorem triple55_12_zero_0_4 : entryZero triple55_12 0 4 = true := by decide
theorem triple55_12_zero_0_5 : entryZero triple55_12 0 5 = true := by decide
theorem triple55_12_zero_1_3 : entryZero triple55_12 1 3 = true := by decide
theorem triple55_12_zero_1_6 : entryZero triple55_12 1 6 = true := by decide

def triple55_16 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 7 0 1 false) 1 4 0) 1 2 1) 0 2 2 1 2) 0 1 3) 2 3 4) 0 2 5) 3 6 6) 4 5 7
theorem triple55_16_zero_0_4 : entryZero triple55_16 0 4 = true := by decide
theorem triple55_16_zero_0_5 : entryZero triple55_16 0 5 = true := by decide
theorem triple55_16_zero_1_3 : entryZero triple55_16 1 3 = true := by decide
theorem triple55_16_zero_1_6 : entryZero triple55_16 1 6 = true := by decide

def quad55_0 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 6 0 1 false) 1 5 0) 0 1 1 1 0) 0 2 2) 0 1 3) 2 3 4) 0 2 5) 3 4 6) 0 3 7
theorem quad55_0_zero_0_5 : entryZero quad55_0 0 5 = true := by decide
theorem quad55_0_zero_1_4 : entryZero quad55_0 1 4 = true := by decide

def quad55_2 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 6 0 1 false) 1 2 0) 0 2 1 1 2) 1 5 2) 0 1 3) 2 3 4) 0 2 5) 3 4 6) 0 3 7
theorem quad55_2_zero_0_5 : entryZero quad55_2 0 5 = true := by decide
theorem quad55_2_zero_1_4 : entryZero quad55_2 1 4 = true := by decide

def quad55_4 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 6 0 1 false) 1 5 0) 0 1 1 1 1) 1 2 2) 0 1 3) 2 3 4) 0 2 5) 3 4 6) 0 3 7
theorem quad55_4_zero_0_5 : entryZero quad55_4 0 5 = true := by decide
theorem quad55_4_zero_1_4 : entryZero quad55_4 1 4 = true := by decide

def quad55_6 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 6 0 1 false) 1 2 0) 2 5 1) 0 2 2 1 2) 0 1 3) 2 3 4) 0 2 5) 3 4 6) 0 3 7
theorem quad55_6_zero_0_5 : entryZero quad55_6 0 5 = true := by decide
theorem quad55_6_zero_1_4 : entryZero quad55_6 1 4 = true := by decide

def quad55_8 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (freeRot (depRot (freeRot (freeRot (initial 6 0 1 false) 1 5 0) 1 2 1) 0 2 2 1 2) 0 1 3) 2 3 4) 0 2 5) 3 4 6) 0 3 7
theorem quad55_8_zero_0_5 : entryZero quad55_8 0 5 = true := by decide
theorem quad55_8_zero_1_4 : entryZero quad55_8 1 4 = true := by decide
