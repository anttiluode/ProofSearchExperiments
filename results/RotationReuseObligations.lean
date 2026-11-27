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

def double34 : List (List Poly) := freeRot (freeRot (freeRot (depRot (freeRot (initial 5 0 1 false) 1 3 0) 0 1 1 1 0) 0 2 2) 0 1 3) 3 4 4
theorem double34_zero_0_3 : entryZero double34 0 3 = true := by decide
theorem double34_zero_0_4 : entryZero double34 0 4 = true := by decide
theorem double34_zero_1_2 : entryZero double34 1 2 = true := by decide

def double44 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 6 0 1 false) 1 3 0) 0 1 1 1 0) 0 2 2) 0 1 3) 2 5 4) 3 4 5
theorem double44_zero_0_3 : entryZero double44 0 3 = true := by decide
theorem double44_zero_0_4 : entryZero double44 0 4 = true := by decide
theorem double44_zero_1_2 : entryZero double44 1 2 = true := by decide
theorem double44_zero_1_5 : entryZero double44 1 5 = true := by decide

def triple44 : List (List Poly) := freeRot (freeRot (freeRot (freeRot (depRot (freeRot (initial 5 0 1 false) 1 4 0) 0 1 1 1 0) 0 2 2) 0 1 3) 2 3 4) 0 2 5
theorem triple44_zero_0_4 : entryZero triple44 0 4 = true := by decide
theorem triple44_zero_1_3 : entryZero triple44 1 3 = true := by decide
