-- Must fail: the same witness is required in both premises.
example (R S : Nat → Nat → Prop) (h : R 16 1) (g : S 16 2)
    (rule : ∀ m : Nat, R 16 m → S 16 m → False) : False :=
  rule 1 h g
