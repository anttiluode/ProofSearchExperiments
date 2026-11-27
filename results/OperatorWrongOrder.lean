-- Must reject: abstract operators are not commutative.
example (A : Type) (mul : A → A → A) (a b : A) : mul a b = mul b a := rfl
