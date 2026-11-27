-- Must fail: last premise returns to 4, not the initial witness 1.
example (R S T : Nat → Nat → Prop)
    (h0 : R 1 2) (h1 : S 2 3) (h2 : T 3 4)
    (rule : ∀ x y z : Nat, R x y → S y z → T z x → False) : False :=
  rule 1 2 3 h0 h1 h2
