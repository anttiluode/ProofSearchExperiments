-- Algebraic composition of nested orthogonal-conjugation programs.
-- Abstract associative multiplication and transpose reversal; no numerical matrix claims.
def conjOp {A : Type} (mul : A → A → A) (tr : A → A) (r m : A) : A :=
  mul (tr r) (mul m r)

theorem nested_conjugation (A : Type) (mul : A → A → A) (tr : A → A)
    (assoc : ∀ a b c : A, mul (mul a b) c = mul a (mul b c))
    (tr_mul : ∀ a b : A, tr (mul a b) = mul (tr b) (tr a))
    (r1 r2 m : A) :
    conjOp mul tr r2 (conjOp mul tr r1 m) = conjOp mul tr (mul r1 r2) m := by
  simp only [conjOp, tr_mul, assoc]

theorem rational_rotation_345 : (3 : Int)^2 + 4^2 = 5^2 := by decide
theorem rational_rotation_51213 : (5 : Int)^2 + 12^2 = 13^2 := by decide
