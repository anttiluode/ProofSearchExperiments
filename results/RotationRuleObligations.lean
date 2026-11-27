-- Experiment 7i: conditional scalar lemmas and concrete exact-integer premises.
-- These lemmas are not a full formalization of the real orthogonal orbit.
theorem nonmixing {R : Type} (z : R) (add mul : R → R → R)
    (mz : ∀ a, mul a z = z) (az : add z z = z)
    (a b x y : R) (hx : x = z) (hy : y = z) :
    add (mul a x) (mul b y) = z := by
  simp only [hx, hy, mz, az]

theorem coupledCancellation {R : Type} (mul : R → R → R)
    (assoc : ∀ a b c, mul (mul a b) c = mul a (mul b c))
    (comm : ∀ a b, mul a b = mul b a)
    (rho t invh : R) :
    mul rho (mul t invh) = mul t (mul rho invh) := by
  calc
    mul rho (mul t invh) = mul (mul rho t) invh := (assoc rho t invh).symm
    _ = mul (mul t rho) invh := congrArg (fun z => mul z invh) (comm rho t)
    _ = mul t (mul rho invh) := assoc t rho invh

def gramDot : List Int → List Int → Int
  | x :: xs, y :: ys => x * y + gramDot xs ys
  | _, _ => 0

def gramDet (u v : List Int) : Int :=
  gramDot u u * gramDot v v - gramDot u v * gramDot u v

def overlapCount (u v : List Nat) : Nat :=
  (u.filter (fun x => v.contains x)).length

theorem negative_78100 : gramDot ([3,0,0,0,0,0] : List Int) ([3,0,0,0,0,0] : List Int) > 0 ∧ gramDot ([2,4,0,0,0,0] : List Int) ([2,4,0,0,0,0] : List Int) > 0 ∧ overlapCount ([1,2] : List Nat) ([3,4] : List Nat) = 0 ∧ gramDot ([3,0,0,0,0,0] : List Int) ([2,4,0,0,0,0] : List Int) ≠ 0 := by decide
theorem negative_78101 : gramDot ([0,3,0,0,0,0,0] : List Int) ([0,3,0,0,0,0,0] : List Int) > 0 ∧ gramDot ([0,2,0,0,0,0,4] : List Int) ([0,2,0,0,0,0,4] : List Int) > 0 ∧ overlapCount ([1,6] : List Nat) ([2,7] : List Nat) = 0 ∧ gramDot ([0,3,0,0,0,0,0] : List Int) ([0,2,0,0,0,0,4] : List Int) ≠ 0 := by decide
theorem negative_78102 : gramDot ([0,0,0,0,0,0,3,0] : List Int) ([0,0,0,0,0,0,3,0] : List Int) > 0 ∧ gramDot ([0,0,0,0,0,4,2,0] : List Int) ([0,0,0,0,0,4,2,0] : List Int) > 0 ∧ overlapCount ([6,7] : List Nat) ([3,8] : List Nat) = 0 ∧ gramDot ([0,0,0,0,0,0,3,0] : List Int) ([0,0,0,0,0,4,2,0] : List Int) ≠ 0 := by decide
theorem negative_78103 : gramDot ([0,0,3,0,0,0] : List Int) ([0,0,3,0,0,0] : List Int) > 0 ∧ gramDot ([0,0,2,4,0,0] : List Int) ([0,0,2,4,0,0] : List Int) > 0 ∧ overlapCount ([1,2] : List Nat) ([3,4] : List Nat) = 0 ∧ gramDot ([0,0,3,0,0,0] : List Int) ([0,0,2,4,0,0] : List Int) ≠ 0 := by decide
theorem negative_78104 : gramDot ([0,0,0,0,0,0,3] : List Int) ([0,0,0,0,0,0,3] : List Int) > 0 ∧ gramDot ([0,4,0,0,0,0,2] : List Int) ([0,4,0,0,0,0,2] : List Int) > 0 ∧ overlapCount ([2,7] : List Nat) ([3,4] : List Nat) = 0 ∧ gramDot ([0,0,0,0,0,0,3] : List Int) ([0,4,0,0,0,0,2] : List Int) ≠ 0 := by decide
theorem negative_78105 : gramDot ([0,0,0,3,0,0,0,0] : List Int) ([0,0,0,3,0,0,0,0] : List Int) > 0 ∧ gramDot ([0,0,0,2,4,0,0,0] : List Int) ([0,0,0,2,4,0,0,0] : List Int) > 0 ∧ overlapCount ([6,8] : List Nat) ([4,5] : List Nat) = 0 ∧ gramDot ([0,0,0,3,0,0,0,0] : List Int) ([0,0,0,2,4,0,0,0] : List Int) ≠ 0 := by decide
theorem negative_78106 : gramDot ([0,0,3,0,0,0] : List Int) ([0,0,3,0,0,0] : List Int) > 0 ∧ gramDot ([0,0,0,0,0,4] : List Int) ([0,0,0,0,0,4] : List Int) > 0 ∧ overlapCount ([3,4] : List Nat) ([4,6] : List Nat) = 1 ∧ gramDot ([0,0,3,0,0,0] : List Int) ([0,0,0,0,0,4] : List Int) = 0 := by decide
theorem negative_78107 : gramDot ([0,0,0,3,0,0,0] : List Int) ([0,0,0,3,0,0,0] : List Int) > 0 ∧ gramDot ([0,0,0,0,0,0,4] : List Int) ([0,0,0,0,0,0,4] : List Int) > 0 ∧ overlapCount ([3,7] : List Nat) ([3,4] : List Nat) = 1 ∧ gramDot ([0,0,0,3,0,0,0] : List Int) ([0,0,0,0,0,0,4] : List Int) = 0 := by decide
theorem negative_78108 : gramDot ([0,0,0,0,0,0,0,3] : List Int) ([0,0,0,0,0,0,0,3] : List Int) > 0 ∧ gramDot ([0,0,0,4,0,0,0,0] : List Int) ([0,0,0,4,0,0,0,0] : List Int) > 0 ∧ overlapCount ([1,8] : List Nat) ([1,4] : List Nat) = 1 ∧ gramDot ([0,0,0,0,0,0,0,3] : List Int) ([0,0,0,4,0,0,0,0] : List Int) = 0 := by decide
theorem negative_78109 : gramDot ([0,0,0,0,3,0] : List Int) ([0,0,0,0,3,0] : List Int) > 0 ∧ gramDot ([0,0,4,0,0,0] : List Int) ([0,0,4,0,0,0] : List Int) > 0 ∧ overlapCount ([1,3] : List Nat) ([1,5] : List Nat) = 1 ∧ gramDot ([0,0,0,0,3,0] : List Int) ([0,0,4,0,0,0] : List Int) = 0 := by decide
theorem negative_78110 : gramDot ([0,3,0,0,0,0,0] : List Int) ([0,3,0,0,0,0,0] : List Int) > 0 ∧ gramDot ([0,0,4,0,0,0,0] : List Int) ([0,0,4,0,0,0,0] : List Int) > 0 ∧ overlapCount ([2,6] : List Nat) ([3,6] : List Nat) = 1 ∧ gramDot ([0,3,0,0,0,0,0] : List Int) ([0,0,4,0,0,0,0] : List Int) = 0 := by decide
theorem negative_78111 : gramDot ([0,0,0,0,0,0,0,3] : List Int) ([0,0,0,0,0,0,0,3] : List Int) > 0 ∧ gramDot ([0,0,0,0,4,0,0,0] : List Int) ([0,0,0,0,4,0,0,0] : List Int) > 0 ∧ overlapCount ([5,6] : List Nat) ([6,8] : List Nat) = 1 ∧ gramDot ([0,0,0,0,0,0,0,3] : List Int) ([0,0,0,0,4,0,0,0] : List Int) = 0 := by decide
theorem negative_78112 : gramDot ([2,0,0,2,0,0] : List Int) ([2,0,0,2,0,0] : List Int) > 0 ∧ gramDot ([4,0,0,4,0,0] : List Int) ([4,0,0,4,0,0] : List Int) > 0 ∧ gramDet ([2,0,0,2,0,0] : List Int) ([4,0,0,4,0,0] : List Int) = 0 ∧ ([1,4] : List Nat) ≠ ([3,4,6] : List Nat) := by decide
theorem negative_78113 : gramDot ([2,0,0,2,0,0,0] : List Int) ([2,0,0,2,0,0,0] : List Int) > 0 ∧ gramDot ([4,0,0,4,0,0,0] : List Int) ([4,0,0,4,0,0,0] : List Int) > 0 ∧ gramDet ([2,0,0,2,0,0,0] : List Int) ([4,0,0,4,0,0,0] : List Int) = 0 ∧ ([3,4,7] : List Nat) ≠ ([1,4] : List Nat) := by decide
theorem negative_78114 : gramDot ([0,0,2,0,0,0,0,2] : List Int) ([0,0,2,0,0,0,0,2] : List Int) > 0 ∧ gramDot ([0,0,4,0,0,0,0,4] : List Int) ([0,0,4,0,0,0,0,4] : List Int) > 0 ∧ gramDet ([0,0,2,0,0,0,0,2] : List Int) ([0,0,4,0,0,0,0,4] : List Int) = 0 ∧ ([3,8] : List Nat) ≠ ([1,5,8] : List Nat) := by decide
theorem negative_78115 : gramDot ([0,0,0,2,0,2] : List Int) ([0,0,0,2,0,2] : List Int) > 0 ∧ gramDot ([0,0,0,4,0,4] : List Int) ([0,0,0,4,0,4] : List Int) > 0 ∧ gramDet ([0,0,0,2,0,2] : List Int) ([0,0,0,4,0,4] : List Int) = 0 ∧ ([1,5,6] : List Nat) ≠ ([4,6] : List Nat) := by decide
theorem negative_78116 : gramDot ([0,2,2,0,0,0,0] : List Int) ([0,2,2,0,0,0,0] : List Int) > 0 ∧ gramDot ([0,4,4,0,0,0,0] : List Int) ([0,4,4,0,0,0,0] : List Int) > 0 ∧ gramDet ([0,2,2,0,0,0,0] : List Int) ([0,4,4,0,0,0,0] : List Int) = 0 ∧ ([2,3] : List Nat) ≠ ([3,5,6] : List Nat) := by decide
theorem negative_78117 : gramDot ([2,0,2,0,0,0,0,0] : List Int) ([2,0,2,0,0,0,0,0] : List Int) > 0 ∧ gramDot ([4,0,4,0,0,0,0,0] : List Int) ([4,0,4,0,0,0,0,0] : List Int) > 0 ∧ gramDet ([2,0,2,0,0,0,0,0] : List Int) ([4,0,4,0,0,0,0,0] : List Int) = 0 ∧ ([3,6,8] : List Nat) ≠ ([1,3] : List Nat) := by decide
