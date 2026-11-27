# Proof Search Experiments — wave shadows, phase identity, and reuse

Continuation of [ProofSearchExperiment](https://github.com/anttiluode/ProofSearchExperiment). The parent established exact shared-witness gluing, a corrected scheduler, and a Lean interlock. This repo asks whether approximate readers can cheaply recognize a proof before constructing it.

## Results (first CPU run)

Protocols: [initial](PROTOCOL.md), [post-pilot phase follow-up](PHASE_FOLLOWUP_PROTOCOL.md). Raw rows and reproducible scripts are committed. No neural training, no GPU, no claim of general Lean performance.

### 1. Multi-hop wave shadow: correct, not economical

64 positive and 64 paired negative cases; eight candidate rules, three premise graphs each, two reachable witnesses per port, forks and cycles. All pair intersections are nonempty, but only one rule in each positive has a triple intersection. The positive bridge paths are 3–5 edges. The right port is represented as an outward search from its anchor (equivalently reversed traversal in the intended analogy); all three ports are modeled as directed anchor-to-witness relations in this pilot.

Five steps of positive linear diffusion with decay .7 identified the rule and exact witness on 64/64 positives. Exhaustive independent closure checks established the negative cases; exact BFS path checks found zero false proofs. The wave never prunes: exact fallback is mandatory.

| Mean positive work | Edge visits |
|---|---:|
| Blind rule-order BFS | 1011.69 |
| Wave preprocessing | 3699.28 |
| BFS after wave | 223.88 |
| Wave + BFS | 3923.16 |
| Full exact indexed reachability with stored parents | 1804.36 |

Negative blind BFS/full reachability: 1804.36; wave + BFS: 5503.64. Each checked rule also incurs two conceptual intersections; certificate lengths average 12.06 edges. Wave scores add floating arithmetic and dense witness products, not included in the edge-visit column. No wall-clock speed claim. Counters are deterministic replay counts: per-rule BFS and wave traces are computed before replaying each order, not measured as timed separate solver invocations. The specialized BFS control is not the original general bidirectional router; that integration remains untested. Winner position is balanced in deterministic rotation; witness and edge order are randomized. Graph structure, not the generator's witness labels, is the input to the readers.

**Efficiency gate failed.** At bounded depth, positive diffusion recovers reachability support; repeated walks through cycles cost more than visited-set BFS. It is not evidence that a wave outperforms proof search.

### 2. Phase reader: sparse support matters more than vocabulary size

For three port sets, the complex triple product estimates the intersection cardinality. The exact common witness contributes +1; off-diagonal terms create finite-width noise. At 2048 possible witnesses, 256 complex channels:

| Active witnesses per port | Original (64 cases) | Bucketed (128 fresh cases) |
|---:|---:|---:|
| 2 | 64 | 128 |
| 4 | 59 | 128 |
| 8 | 29 | 124 |
| 16 | 13 | 74 |
| 32 | 8 | 39 |
| 64 | 9 | 22 |

Bucketed configuration: 32 shared buckets x 8 repetitions, fixed 256 complex coordinates. All five bucket counts were tested; no claim that this configuration is optimized. Fourth-root phases replace continuous phases in the follow-up. Shared hashes isolate interactions; phase-free bucket counts are a control (70/128 at k=8 in this configuration). At k=8, the original and bucketed test sets are different; this is a follow-up, not a paired significance test. All exact set controls have a unique winning rule.

The unstructured reader uses O(kD) encoding work and precomputed O(ND) codebooks; the bucketed reader uses O(kR + D) operations, O(NR) precomputed address/phase codes (or could hash on demand). Each port carries D complex values; exact sparse lists can be much smaller locally. The result supports an approximate distributed sketch in sparse regimes, not a faster local join or exact decoding. No false proof can be permitted on the basis of a sketch score alone.

### 3. Crystallization: reuse needs indexing AND fair accounting

A 60-task motif stream, 12 named motifs, repeated typed path patterns of length 3–4. Initial accounting omitted premise retrieval on cache hits. The [audit](results/accounting_audit.json) charges leaf retrieval, library probes, macro application and insertion. These are modeled work units, not measured wall time.

| Mean modeled work | First 30 | Last 30 |
|---|---:|---:|
| Primitive assembly | 6.00 | 6.00 |
| Append-only scanning | 12.27 | 11.53 |
| Exact keyed motif cache | 6.50 | 5.50 |
| Generic arity cache | 5.67 | 5.50 |

A generic structural macro is a stronger control than a cache specialized to each predicate name. Two generic Lean macro definitions are supplied, not a demonstration of automatic lemma extraction from unrestricted Lean. No utility/decay weight or learned routing has been established. The warm keyed gain is only 0.5 modeled units and excludes kernel/runtime costs. 

### 4. Policy memory: degenerate proxy, no SIM finding

A deterministic proxy chooses how many candidate rules to wave-score first (0,1,2,4,8). Source uses one-rule graphs, often negative; target eight-rule graphs. Both have the same no-wave optimum, so blank, source-winner-only and source notebook select k=0 and tie (1013.28 target edge visits). One target evaluation per arm; no AI optimizer, no causal-memory intervention distinct from the source winner. This does not test Google's SIM claim; it is a null sanity check. The original source cycles router, five actual policy knobs and AI transfer are future work.

## Reproduce

Node.js 22 recommended; no npm dependencies.

```sh
node experiment.cjs
node phase_buckets.cjs
node accounting_audit.cjs
node emit_lean.cjs
```

[Initial summary](results/summary.json) · [Initial raw rows](results/raw.json) · [Bucket summary](results/phase_buckets_summary.json) · [Bucket raw rows](results/phase_buckets_raw.json) · [Accounting audit](results/accounting_audit.json)

The experiment also generates a large full-context Lean source locally. The compact committed [certificates](results/CompactCertificates.lean) include only used hypotheses, which are a subset of the input facts, and two generic macros. Python/JS-style graph verification is independent of Lean kernel acceptance. To actually check with elan and the pinned Lean version:

```sh
node check_lean.cjs
```

The checker must see Lean accept 64 compact terms and 2 generic macros, and reject the deliberately wrong witness with a type-mismatch diagnostic. Lean was unavailable in the initial execution environment. **The subsequent [GitHub Actions run](https://github.com/anttiluode/ProofSearchExperiments/actions/runs/45964571503) completed successfully:** the pinned Lean kernel accepted all 64 compact terms and 2 generic macros, and rejected the wrong-witness control. This is a check of compact certificates under their used hypotheses, not a verification of the full-context source or of general Lean search performance.

## Next useful gate

Move beyond graph reachability: coupled recursive rules with multiple unresolved variables, where exact closure is genuinely expensive. Compare compressed messages against sparse exact lists/bitsets at equal communication and compute budgets. Keep all verification exact, and do not give a learned head credit for a task already solved by a direct join.

The central question remains: can the reader recognize the shape of an expensive computation for less than it costs to perform that computation?

## Experiment 5 — coupled Horn strategy fatigue (November 27)

[Interactive replay](https://anttiluode.github.io/ProofSearchExperiments/) (also open `index.html` locally), [frozen protocol](FATIGUE_PROTOCOL.md), [suffix-elimination protocol](FATIGUE_DP_PROTOCOL.md). Lineage: [CombinatoryPlayClaude](https://github.com/anttiluode/CombinatoryPlayClaude), [CombinatoryPlaySol](https://github.com/anttiluode/CombinatoryPlaySol), [Sweep](https://github.com/anttiluode/Sweep), [AliveAI](https://github.com/anttiluode/AliveAI).

240 cases: 120 positive, 120 paired negative, 40 of each per sparse/dense/parity family; four competing rules, 3–5 variables and 12 possible values. Exact indexed DFS lanes retain a stack for each (rule, initial witness), with exact last-variable intersection. All arms use the same expansion and proof validation. A conflict is an empty next mask or empty closing intersection, not merely an unfinished proof. C/D use pre-selection penalty with lazy recovery; D's context is just the first bound witness. F's discounted failure count is the same update before clipping; it reproduced D here, not evidence for a distinct dynamical mechanism. B2 randomly chooses a live lane without discarding search state. No semantic embedding, actual learned routing, bidirectional recursion, macro extraction, or LLM proposer is implemented in this pilot.

| Arm | Positive solved @256 live steps | @1024 | Mean ledger @256 (all 240 cases) |
|---|---:|---:|---:|
| Static priority A | 93/120 | 106/120 | 8727 |
| Round-robin B1 | 120/120 | 120/120 | 2088 |
| Random B2 | 120/120 | 120/120 | 4741 |
| Global fatigue C | 120/120 | 120/120 | 10673 |
| Contextual fatigue D | 106/120 | 120/120 | 13249 |
| Discounted failure F | 106/120 | 120/120 | 13249 |
| Ordered indexed DFS J | 93/120 | 106/120 | 3609 |
| Exact suffix elimination (uncapped follow-up) | 120/120 | n/a | 845 |

Every scheduler has zero false certificates; 75/120 negatives are exhausted at 256, 93/120 at 1024. The oracle decides all negatives independently; timeout is not a proof of impossibility. On the difficult parity family A solved 13/40, C/B1/B2 40/40, D/F 26/40 at 256. C reduced mean live steps across all cases from 145 to 109 but paid for score evaluations and repeated lane inspections. Fairness won the complete modeled ledger. **Do not promote fatigue into Arm E on this evidence.** The direct suffix elimination follow-up decides every case, including all 120 negatives, without backtracking; cyclic binary joins have bounded treewidth. That control is structurally stronger than scheduler improvements in this grammar. Its ledger uses lazy per-rule index construction, unlike the scheduler's eager outgoing/incoming indexes, which is an honest implementation advantage but not a matched microbenchmark. The original arms scan lanes to select a score; a more optimized heap may alter absolute costs. Counts are heterogeneous modeled units, not timing; independent validation is charged per premise rather than each raw membership-loop iteration, and data generation/oracle cost is excluded. No claim of asymptotic superiority beyond this grammar.

Reproduce with Node.js:

```sh
node fatigue.cjs
node fatigue_dp.cjs
lean results/FatigueCertificates.lean
lean results/FatigueDP.lean
```

[Raw scheduler rows](results/fatigue_rows.json) · [Summary](results/fatigue_summary.json) · [Exact elimination rows](results/fatigue_dp.json) · [297 distinct scheduler/exact-DFS certificates](results/FatigueCertificates.lean) · [120 suffix-elimination certificates](results/FatigueDP.lean) · [Wrong-witness control](results/FatigueWrongWitness.lean). The initial JavaScript experiment checked every certificate against supplied facts and compared complete search to independent Boolean relation composition. Lean CI separately checks the compact terms using the used hypotheses. Replay traces are the first positive-labelled case in each family, not cherry-picked examples. Next gate: non-cycle joins with larger treewidth and nested rule derivations, compare optimized exact elimination/tabling before growing the library. SIM remains out of scope until the fast/medium layers earn their place.


## Experiment 6 — symbolic operator crystallization and TWC bridge

[Interactive operator laboratory](https://anttiluode.github.io/ProofSearchExperiments/operators.html) · [Frozen symbolic protocol](OPERATOR_PROTOCOL.md) · [TWC bridge protocol](OPERATOR_TWC_PROTOCOL.md) · [TWC ancestor](https://github.com/anttiluode/transientwavecompiler).

The engine uses noncommutative multiplication, inverse and identity. The primitive normalizer constructs exact rewrite traces, while an independent signed-word stack decides free-group equality. From 48 source expressions, whole-trace parameterization (renaming symbolic atoms to variables, preserving repeated identity) found three schemas, each seen 16 times. They are the product-of-conjugates identity (7 primitive steps), inverse cancellation (5), and inverse product of inverses (3). No hand-supplied composite rules, no induction, no arbitrary subtree anti-unification. The frozen target consists of 72 expressions with new atom names, longer conjugate products, mixed inverse compositions and random trees; familiar motifs are intentionally shared. All 72 target equalities have exact replay-checked certificates in both arms. The independent oracle distinguishes all 72 unequal goals. Bounded explicit rewrite-graph BFS (256 expanded states) is a weak exploratory control, not an e-graph or egg BackoffScheduler.

| Target family (24 each) | Primitive steps | Macro steps | Primitive ledger | Macro ledger |
|---|---:|---:|---:|---:|
| Conjugation | 15.00 | 9.00 | 115.50 | 272.50 |
| Mixed inverse | 12.50 | 3.50 | 81.50 | 120.00 |
| Random | 6.21 | 6.21 | 60.79 | 207.88 |
| All | 11.24 | 6.24 | 85.93 | 200.13 |

84 macro hits. Development ledger 4111 units (source solving, replay and extraction); no break-even because target ledger increases. The proof application count is compressed, not a measured Lean runtime improvement. The ledger counts tree visits, match recursion, index probes, rewrite steps and replay steps; it omits allocations, serialization, some internal primitive scans and Lean process/kernel costs. The full accounting is therefore incomplete, not a CPU benchmark. Even under this partial ledger the learned library loses. Free-group normalization is a strong exact control; arbitrary infinite syntax is not evidence of intractability. The next question is whether a compiled discrimination index and real non-normalizing cost search can justify the macros; no e-graph, backoff/fatigue, macro eviction or SIM optimizer implemented in this round.

### TWC-derived bridge
The frozen macro0 matches the product of two conjugated operators without new training. On 32 seeded symmetric integer matrix pairs, an exact rational 3-4-5 internal orthogonal rotation yields identical direct and fused products (BigInt arithmetic); five dense matrix multiplications become three, tying the hand-fused identity. Separately the rotation fixes source/load ports and exactly preserves U and q; the numerical S11/S21 comparison on five normalized frequencies per single symmetric A gives max difference 4.71e-16. The product AB need not be symmetric: this is **not** a WaveProgram legality check, actual TWC execution or physical hardware result. No topology optimization or novel algebra claim.

Reproduce: `node operator.cjs`, `node operator_twc.cjs`, `lean results/OperatorCertificates.lean`. [Raw symbolic results](results/operator_raw.json) · [TWC bridge results](results/operator_twc.json) · [Lean source](results/OperatorCertificates.lean) · [Wrong-order control](results/OperatorWrongOrder.lean). CI checks the three abstract schemas and 144 target normalizer certificates under explicit algebra axioms.


## Experiment 6b — shared matching ledger and composable macro ports

[Interactive operator laboratory](https://anttiluode.github.io/ProofSearchExperiments/operators.html) · [Frozen follow-up protocol](OPERATOR_INDEX_PROTOCOL.md) · [Results](results/operator_index.json).

Neon's audit identified two real issues in Experiment 6: primitive pattern comparisons were not charged comparably to macro matching; the mined conjugation rule emitted a right-associated result that could not feed its own left-associated input. The original result remains in the previous section. This follow-up replays the **same 72 target cases**, not a fresh independent test. All primitive and macro rules now share explicit patterns, recursive binding, repeated-variable equality and substitution counters; both engines emit replay-checked proof traces. A bottom-up macro prepass preserves useful wrappers before normalizing. Two exact lookup engines (root-bucket scan and prefix discrimination trie) are matched against their own primitive-only controls.

The machine recognizes the repeated outer wrapper in the original macro, constructs a compatible output by regrouping the interior, and searches for an associativity-only proof. It derives macro3 from macro0 plus two association rewrites (9 primitive steps in total):

`((R⁻¹ A) R) ((R⁻¹ B) R) = (R⁻¹ (AB)) R`.

The grouped result can feed the same macro recursively; no new axioms or hand-supplied composite law. The structural wrapper heuristic itself is programmed, not learned. Whole-trace mining remains unchanged; automatic interior-subtree mining is not implemented.

| Matched lookup | Primitive only | Original macros | Compatible macros |
|---|---:|---:|---:|
| Root-bucket scan | 2119.35 | 1745.92 | 1670.92 |
| Prefix trie | 2467.54 | 2144.72 | 2048.89 |

Values are mean **modeled ledger units**, not elapsed time. All 72 solve in all six arms. Compatible scan reduces mean charged work 21.2% vs its matched primitive scan, while compatible trie reduces 17.0% vs matched primitive trie. The small trie loses to the simple scan: query subtrees are re-encoded and wildcard paths traversed. It is not a production Lean DiscrTree, and does not establish constant-time lookup. The accounting includes visits, path traversals, tree copying, index build, encoding, probes, matching/equality, substitution, size checks and replay, but not every sort/filter, allocation or kernel runtime. Per-problem index build is charged (a persistent index could amortize this). Random-family macro scan incurs overhead; no benefit without motif hits.

A separate fresh length stress test (2–12 conjugates, 11 chain lengths) demonstrates self-composition. At length 12 the matched scan primitive arm uses 67 proof applications / 28403 ledger units; original macro scan uses 61 / 28637 (one hit); compatible scan uses 23 / 11988 (11 successive macro hits). This is a designed structural extrapolation, not a random held-out generalization test.

The variant derivation and schema replay ledger is 1021; the original mining bill is 4111 **under the older, noncomparable ledger**. We do not claim a fully measured developmental break-even. The signed-word decision oracle remains a stronger specialized baseline when a proof-producing trace is unnecessary. Expanded macro proofs still require Lean kernel checking; proof applications are not actual kernel reductions. Full e-graph, rotational commutation and interior discovery remain future work.

Reproduce: `node operator_index.cjs` after `node operator.cjs`; `lean results/OperatorIndexCertificates.lean`. CI checks 4 schemas and 498 target/stress certificates. No new TWC numerical test or hardware claim in this patch.


## Experiment 6c — lazy reader, split query buckets, and SIM receipts

[Protocol](OPERATOR_LAZY_PROTOCOL.md) · [Raw results](results/operator_lazy.json) · [SIM-style intervention history](SIM_OPERATOR_READER.json).

This is a diagnostic replay of 6b's **same** 72 expressions and 11 chain lengths, with no new training. All seven arms preserve the 6b proof traces. Separate primitive and macro query-group indexes avoid irrelevant candidate probes; the lazy trie walks constructors on demand with a persistent pending-subtree stack and skips wildcard subtrees. Prepared RHS reuse eliminates duplicate substitution. An independent exhaustive-match audit checked 32,632 queries; all 585 regenerated theorem bodies (including four schemas) were textually identical after theorem-name renaming to the matching 6b proofs. The original 6b Lean CI passed.

| Split index | Primitive only | Composable macros |
|---|---:|---:|
| Bucket scan | 2159.74 | 1591.01 |
| Eager trie | 2328.32 | 1875.72 |
| Lazy trie | 2394.78 | 1937.08 |

Mean modeled work units, **not timing**. The matched split scan saves 26.3%. The lazy trie reduces mean constructor encoding visits (macro arm 310.15 → 221.76) but creates 149.75 pending cells; total work is higher than eager on this small library. Substitution reuse saves 9.5 units per macro-arm target (1600.51 → 1591.01). Random-expression recognition tax remains (1640.21 → 1782.04, no macro hits), although lower than in 6b. Cross-version ledgers are not strictly comparable: 6c counts sort comparisons and pending cells, and builds separate query indexes. The matched comparisons within 6c are the relevant results.

At length 12, split scan uses 28,675 units for primitives and 11,555 for composable macros, with unchanged 67 vs 23 proof applications. No end-to-end developmental amortization, wall-clock speedup, or new out-of-distribution claim. The audit is excluded from work counts; it is a separate correctness check and runs in the reproduction script. Small-library split scan is the preferred measured reader for the next experiment. TWC rotation algebra and equality saturation remain future work.

Reproduce: `node operator_index.cjs` then `node operator_lazy.cjs`. The latter regenerates reference proof traces and checks every new trace against them; no additional Lean axiom or new mathematical rule is introduced.


## Experiment 7a — exact rational reciprocal realization orbit

[Rotation laboratory](https://anttiluode.github.io/ProofSearchExperiments/rotations.html) · [Frozen protocol](ROTATION_PROTOCOL.md) · [Raw results](results/rotation_orbit.json) · [TWC gauge-capability report](https://github.com/anttiluode/TransientWaveCompiler/blob/agent/tw1a-common-diff-v08/docs/FILTER_TOPOLOGY_GAUGE_CAPABILITY_MAP_2026-08-10.md).

First cost-driven realization experiment, deliberately **not an e-graph**. Four to six internal resonators, with two fixed ports. 24 sparse chains scrambled by 2–3 rational internal rotations, plus 12 dense random matrices. Exact rational BigInt arithmetic, fixed discrete rotation library, strict greedy descent, bounded best-first and breadth-first orbit search, and data-dependent rational Givens elimination. The latter computes a rotation from two current row entries when their squared norm has an integer square root; it does not search the full continuous-angle domain. The objective is lexicographic exact off-diagonal coupling count then selected path length. Reference sparsity is feasible, not an optimality certificate.

| Scrambled sparse (24) | Reference count reached | Mean edges | Mean candidate actions | Mean modeled work |
|---|---:|---:|---:|---:|
| Greedy discrete | 19 | 6.625 | 128 | 42916 |
| Rational Givens | 24 | 6.000 | 6.21 | 3388 |
| Best-first | 23 | 6.083 | 384 | 129289 |
| Breadth-first | 6 | 9.167 | 384 | 125514 |

Mean initial count 13.167. Best-first selected a non-decreasing intermediate coupling count on four improved sparse cases (plateau or uphill, not necessarily a strict local minimum). On the dense controls, initial mean 21.333; rational Givens and greedy both reach 20.583, best-first 20.417, breadth-first 20.500. Best-first improves 10/12 vs Givens 9/12, at much greater modeled cost. No global optimum proved. The sparse generator favors exact rational angle recovery; results do not generalize to arbitrary practical topologies.

Every selected result (144 paths including unchanged roots) independently checked by dense accumulated rotation multiplication, symmetry, orthogonality and fixed ports. The internal orthogonal block preserves U and q by construction. Numerical S11/S21 checks at five normalized frequencies show max difference 4.97e-16. These are mathematical coupling-matrix realizations, not actual TWC compiler execution, physical hardware tests, or proof of arbitrary WaveProgram stability. Modeled search ledger excludes independent verification, generation and response diagnostics; no measured timings or full developmental accounting. No macros learned, no fatigue, no equality saturation, no full classical Cameron synthesis, no gauge-alias optimization. The rational Givens result is a mandatory strong control for future harder cases.

Symbolic Lean source checks the general nested conjugation composition under associative multiplication and transpose-reversal axioms and two Pythagorean integer identities; it does not kernel-check the numerical matrix paths. Reproduce: `node rotation_orbit.cjs`; `lean results/RotationAlgebra.lean`. SIM case-level outcomes added retrospectively, with predicted case IDs explicitly null for previous runs. Future predictions must be registered before evaluation.

The main architectural distinction: a rotation program can have several equivalent symbolic representations, while response-equivalent physical matrices can have different costs. An eventual e-graph should not attach a single physical matrix or cost as an invariant of the entire response-equivalence class; physical realization representatives must remain available to extraction.


## Experiment 7b — continuous rotations and constrained topology

[Interactive page](https://anttiluode.github.io/ProofSearchExperiments/continuous.html) · [Frozen protocol and first forward predictions](ROTATION_CONTINUOUS_PROTOCOL.md) · [Least-squares follow-up](ROTATION_LM_PROTOCOL.md) · [Raw pivot data](results/rotation_continuous.json) · [Raw LM data](results/rotation_lm.json).

Continuous source-aligned internal tridiagonalization (not full Cameron synthesis) reduces the 12 dense 7a matrices from 15/21/28 off-diagonal edges to 9/11/13 for 4/5/6 internal resonators. Preregistered P1 incorrectly predicted <=2n: all 12 literally missed, because the direct source-load edge was omitted in the count. Correct bound is 2n+1 (n-1 internal path edges, 1 source, n load, 1 direct). P2 (canonical start fails noncanonical mask) hit all 24 registered IDs. These are structural predictions, not evidence for a learned proposer.

24 constructed feasible target masks (chain plus one or two internal chords), integer couplings, required edges nonzero, forbidden relative maximum <=1e-8, max/min required <=10. Start from canonical reduction of the feasible target. Solvers see only start matrix and mask, not the witness. No sign constraints. No industrial filter measurements. All successful/failed returned realizations retain orthogonal similarity within numerical tolerance, fixed ports and sampled two-port response. Failure is not infeasibility.

| Arm | Success /24 | Mean squared objective | Mean candidate rotations | Mean modeled work |
|---|---:|---:|---:|---:|
| Canonical | 0 | 0.0458021 | 0 | 29 |
| Internal permutations | 0 | 0.0230066 | 0 | 27997 |
| Strict greedy pivot | 1 | 0.0082901 | 1116 | 166802 |
| Bounded best-first pivot | 3 | 0.0065668 | 3652 | 1297859 |
| Coordinate descent | 0 | 0.00036175 | 3851 | 450740 |
| Damped least squares (follow-up) | 17 | 0.00025333 | 1215 | 755251 |

LM uses finite-difference Jacobian on the internal rotation manifold, damped normal equations, two deterministic starts, same 4096 rotation cap and success thresholds. All trial prefix states are eligible as best results, including intermediate stages of rejected multi-rotation trials; accepted full updates are downhill. Nonmonotone selected paths therefore do not establish that uphill accepted optimization steps are necessary. Best-first uses a linear frontier scan; costs are modeled heterogeneous operations, not wall-clock comparisons. LM ledger includes Jacobian and normal-equation/linear solve work; independent dense reconstruction and response diagnostics recorded separately. Search/generation/verification and implementation overhead are not fully metered. Numeric checks are double precision, not kernel-certified exact matrix equality. Previously verified Lean abstract nested conjugation law (7a CI run 45976077248) remains unchanged.

Seven LM misses remain: 61001, 61003, 61006, 61007, 61008, 61013, 61022. They are diagnostic targets, not a future held-out test set. No full e-graph, learned pivot macros, SIM optimizer, actual TWC execution or real hardware. Next: frozen new source/target split, stronger numerical baseline (analytic Jacobian/multistart) and composable parameterized pivot motifs; only claim savings if full development and verification bill is earned back. Reproduce `node rotation_continuous.cjs` and `node rotation_lm.cjs`.


## Experiment 7c — analytic Lie-Jacobian and port-aligned multistart

[Protocol](ROTATION_LIE_PROTOCOL.md) · [Compact results](results/rotation_lie_summary.json) · [Full paths](results/rotation_lie.json) · [Interactive laboratory](https://anttiluode.github.io/ProofSearchExperiments/lie.html).

Fresh 36 feasible constructed cases, 12 each both degree-one ports / one degree-one port / neither, 4–6 internal resonators. Also replay old 24 as diagnostic. No reference realization used in solving. All arms use the same residual, 4096 candidate rotation cap, max 120 iterations per restart, fixed damping/step clipping. Analytic derivative of R^T A R is A E-E A; abs and max hinge use deterministic subgradient at nondifferentiable points. Pinned coordinates are aligned by exact-form Givens in double precision, with an explicit compatibility check for the second pinned port. Unpinned ports remain free; no general claim for arbitrary masks. Sign-unconstrained masks only. Full trial updates determine returned states, unlike 7b's eligible trial prefixes. The fixed budget and iteration cap mean solver failure is not proof of a local minimum or infeasibility.

| Fresh arm | Solved | Mean rotations | Mean modeled work |
|---|---:|---:|---:|
| F2 finite differences full | 18/36 | 1389.64 | 939992 |
| A2 analytic full | 21/36 | 686.06 | 943045 |
| P2 port-aligned analytic | 24/36 | 342.36 | 432678 |
| P8 port-aligned analytic 8 starts | 32/36 | 809.97 | 907985 |

P8 by family: 12/12 both pinned, 11/12 one pinned, 9/12 neither. Old 24: F2 17, A2 18, P2 21, P8 23. Fresh P8 misses 71006, 71014, 71024, 71033; old miss 61007. Separate direct one-free-plane candidate enumeration D1 solves 4/4 applicable fresh cases and 5/8 applicable old cases; not a complete global one-dimensional feasibility solver (one must consider both sign branches and degenerate cases). Mean work 1322.5 on applicable fresh cases. No timing or complete developmental ledger claim. Structural ledger includes separately counted rotation arithmetic, score, derivative/Jacobian/linear operations and restart/iteration/alignment; stage loss computed twice and billed twice for all arms, and dense verification/generation/derivative audit separate. No learned macros.

Preregistered P1 passes 36/36 derivative audits (max normalized central difference error 7.6674e-11); P2 passes 24/24 predicted pinned cases (max restricted leakage 1.11e-17 fresh). All 252 selected paths pass independent numerical dense reconstruction and sampled response; max response difference 1.8991e-14. These are double precision checks, not Lean-certified floating-point calculations. Earlier Lean abstract identities unchanged. SIM records exact forward IDs and outcomes. Actual TWC backend/hardware, e-graph and macro learning remain unimplemented; next gate is a fresh source/target warm-start comparison against these controls.


## Experiment 7d — source-selected solver organs (November 27)

[Protocol](ROTATION_ORGANS_PROTOCOL.md) · [Code](rotation_organs.cjs) · [Frozen source library and rows](results/rotation_organs_source.json) · [Target summary and raw file index](results/rotation_organs_summary.json).

96 source and 96 disjoint target cases, eight balanced cells: n=5/6, one/neither pinned ports, one/two chords. The source protocol and selected library were committed before target evaluation. 2,112 target runs (11 arms x 96 x two budgets); all returned paths independently passed the 7c dense numerical reconstruction and sampled response checks (max response 9.812143617288284e-14). All 192 constructed witnesses checked against the acceptance metric and canonicalization verification. P1 topology-cell lookup and P2 path checks pass 96/96; only 36/96 target cases have a nonempty selected motif. The budget caps were checked on every compact row.

| Arm | Solved at 4096 rotations | Mean work | Solved at 2M work + 4096 rotations | Mean work |
|---|---:|---:|---:|---:|
| P2 | 29/96 | 1049550 | 29/96 | 910952 |
| P8 | 62/96 | 2351064 | 49/96 | 1217293 |
| A8 | 56/96 | 2946875 | 44/96 | 1402141 |
| V | 59/96 | 2628145 | 47/96 | 1256021 |
| R | 63/96 | 2285578 | 50/96 | 1191305 |
| M | 63/96 | 2273435 | 50/96 | 1179726 |
| ShM | 62/96 | 2339937 | 50/96 | 1216816 |
| S0 | 64/96 | 2209262 | 53/96 | 1221904 |
| S1 | 68/96 | 2071887 | 57/96 | 1099930 |
| ShS | 64/96 | 2206845 | 54/96 | 1210738 |
| X | 63/96 | 2282970 | 56/96 | 1105367 |

Work is modeled, not wall time. Source development bill 341396208 units excluding independent verification and generation. Five of eight cells chose empty whole-motifs; remaining three selected motifs occurred only once in 12 source cases. This is weak frequency mining, not evidence of recurring computational machinery. R preserves motif length; ShM swaps the chord cell and may change motif length, so it is not a length-matched shuffle. S1 chooses between three hand-defined schedules based on source outcomes; it does not invent the blocks. S0 and shuffled S1 are required controls: under the 2M cap P8 49/96, S0 53/96, S1 57/96, ShS 54/96. Schedules use three staged iterations per restart, then full planes. V and X release the restriction on the last four restarts, not on detected stagnation; no specific realignment step after release, final acceptance enforces mask. A8 starts unrestricted. P2/P8 are 7c-style reimplementations; no paired exact replay audit against 7c in this experiment. Generated scalar normalization is retained from 7c, so the solver is given the witness-derived scalar but not the witness matrix. Verification and generation excluded from modeled work; source generation and verification audited separately. Compact committed raw rows omit paths (full paths regenerated by CLI), but retain independent verification receipts. Ledger is partial (e.g. JS allocation, path copies, lookup overhead and runtime not exhaustively counted). Break-even figures in summary use total development cost and aggregate success count; not a noninferiority statistical test and not a claim for untrained controls. No learned online target updates, D1 completion, stronger linear solver, real TWC execution or Lean floating-point certification. Do not tune on these targets.

Reproduce: `node rotation_organs.cjs source` then `node rotation_organs.cjs target` (target output includes full paths). The committed source library is frozen; rerun source only to reproduce it. The raw target batches in results are compact receipts in deterministic case order.

## Experiment 7e — online sparse Jacobian organs

[Protocol](ROTATION_PURSUIT_PROTOCOL.md) · [Code](rotation_pursuit.cjs) · [Summary and compact raw file index](results/rotation_pursuit_summary.json) · [Baseline and generator audit](results/rotation_pursuit_audit.json).

96 fresh constructed feasible problems, IDs 74000–74095; 48 hard six-resonator unpinned cases, 48 distributed across the other six cells. No new source fitting. P8/S1 call the original 7d implementation; all 32 diagnostic baseline rows exactly matched prior success, loss, ledger and rotations. All 96 reference realizations independently checked. 1,536 target runs (8 arms × 96 × 2 budgets); all returned paths passed numerical checks, maximum sampled response error 8.607712850735297e-14. All ledger sums and caps checked.

| Arm | All, 2M+4096 | Hard, 2M+4096 | Hard mean work | Hard mean linear | Hard, 4096 only |
|---|---:|---:|---:|---:|---:|
| P8 | 46/96 | 5/48 | 1,937,526 | 1,628,813 | 15/48 |
| S1 | 40/96 | 6/48 | 1,904,331 | 1,589,656 | 10/48 |
| P8C | 53/96 | 10/48 | 1,842,390 | 1,365,056 | 15/48 |
| S1C | 44/96 | 7/48 | 1,836,902 | 1,341,434 | 10/48 |
| RB | 28/96 | 0/48 | 1,963,001 | 1,011,070 | 0/48 |
| GS | 24/96 | 0/48 | 1,999,999 | 785,231 | 0/48 |
| GP | 34/96 | 1/48 | 1,970,669 | 287,845 | 3/48 |
| JO | 34/96 | 0/48 | 2,000,000 | 719,126 | 0/48 |

P8C and S1C exploit symmetric Gram formation and Cholesky instead of dense elimination. All online methods use the same improved kernel. RB chooses random planes; GS normalized gradient; JO normalized seed-column overlap; GP signed orthogonal pursuit using residual and column deflation. 5-plane blocks held for up to four attempts, dissolved on stall/damping; full solve only once loss <=1e-5. No complete Gram formed during block assembly (source inspection; maxAssemblyGram telemetry is a constant, not an independent runtime audit). Assembly Jacobian/score charges are in their original ledger fields; explicit dot, orthogonalization and selection are separately metered. Not the exact nonnegative pursuit used by Gurnee et al., arXiv:2607.15495 §2.3. No new training or source Gram prior.

The full classical kernel wins the primary hard-cell endpoint; online blocks do not break the wall. GP's extra assembly cost may outweigh the reduced linear bill. The tested schedule can repeatedly reselect planes, hit the iteration ceiling, or delay full-space polish until a threshold never reached. This is a negative result for this specific 5-plane hold/release design, not a proof against all subspace methods. The common 120-iteration restart cap is retained and may disadvantage cheap steps. Compare forced periodic full steps, adaptive block size and cheaper pursuit only in diagnostic replay before freezing new targets. No measured runtime, comprehensive operation accounting, exact Lean numerical certificates or actual TWC hardware. Source fitting bill zero only for online arms; code/design effort excluded and S1 retains 7d development history. Reproduce `node rotation_pursuit.cjs` with the frozen 7d source library. Compact committed rows omit full paths, which can be regenerated by calling exported run().


## Experiment 7f — additive selective precision and scaling

[Protocol](ROTATION_PRECISION_PROTOCOL.md) · [Code](rotation_precision.cjs) · [Summary and compact raw file index](results/rotation_precision_summary.json) · [Baseline and generator audit](results/rotation_precision_audit.json).

96 fresh unpinned layouts, 75000–75095, 32 each n=6/7/8. All 96 reference witnesses independently passed metric and canonicalization checks. 1,344 target runs, 7 arms x 96 x two budgets. All paths verified; maximum sampled response error 2.409215400098165e-13. All ledger sums and caps checked. Frozen 7e P8C reproduced all 16 diagnostic rows exactly; cached P8C+ had identical success flags on those 16, not necessarily identical floating-point trajectories. Source fitting zero; design cost not zero.

| Arm | n=6, 2M+4096 | n=7 | n=8 | Total | 4096 only total | 4096-only mean work |
|---|---:|---:|---:|---:|---:|---:|
| P8C | 8/32 | 2/32 | 0/32 | 10/96 | 16/96 | 5,479,307 |
| P8C+ | 9/32 | 2/32 | 0/32 | 11/96 | 16/96 | 4,548,713 |
| DIAG | 0/32 | 0/32 | 0/32 | 0/96 | 0/96 | 1,414,446 |
| D+F | 0/32 | 0/32 | 0/32 | 0/96 | 0/96 | 1,980,453 |
| PCG3 | 2/32 | 0/32 | 0/32 | 2/96 | 4/96 | 3,619,682 |
| B | 1/32 | 0/32 | 0/32 | 1/96 | 1/96 | 2,075,759 |
| RB | 1/32 | 0/32 | 0/32 | 1/96 | 1/96 | 2,079,338 |

P8C+ caches residual/Jacobian/gradient/undamped Gram across rejected same-state steps. DIAG pure diagonal; D+F diagonal with full fallback; PCG3 matrix-free diagonally preconditioned CG with three inner iterations; B/RB exact five-plane block-diagonal solve with targeted/random selection and scalar diagonal elsewhere. All approximations except DIAG share full fallback on two stalls or low loss. Cache hits check state identity. No training. Cached full LM wins; approximate steps save work but fail to retain convergence. No n=8 cases solved by any arm under either budget, so apparent scaling savings cannot be claimed as successful solve acceleration. Same 4096 rotation cap and full-plane updates penalize methods needing more iterations; fixed PCG iteration limit and fallback choices are not optimized. No residual-correction arm, source Gram or hardware. Ledger partial, not wall time; allocations and JS operations not exhaustively accounted. Numerical checks not Lean certificates. Do not tune on these fresh cases then call them holdout. Reproduce `node rotation_precision.cjs`; compact rows omit paths, reproducible from exported run().


## Experiment 7g — exact degree-two port chart and objective continuation

[Protocol](ROTATION_GEOMETRY_PROTOCOL.md) · [Code](rotation_geometry.cjs) · [Summary and compact raw file index](results/rotation_geometry_summary.json) · [Baseline/generator/derivative audit](results/rotation_geometry_audit.json).

96 fresh disjoint degree-two layouts, 76000–76095, 32 per n=6/7/8, half square by count and half overdetermined by count. The exact SO(n) chart first aligns orthogonal port vectors, then represents allowed rotations as (I2 + U) followed by two disjoint port splitting rotations; U in SO(n-2). Effective dimensions 8/12/17 instead of 15/21/28. All 96 witness checks passed; 96 transported analytic derivative audits passed, maximum normalized error 8.270212584935315e-11. All 16 F8 baseline replays matched 7f exactly. 2,880 target runs (10 arms × 96 × 3 caps), all paths verified, maximum sampled response error 1.15299373825458e-13; maximum chart endpoint forbidden port leakage 4.732902273682635e-17. All budget caps/ledger sums checked.

| Arm | n=6 fixed | n=7 fixed | n=8 fixed | Fixed total | Fixed mean work | 4096 only total | Scaled rotations only total |
|---|---:|---:|---:|---:|---:|---:|---:|
| F8 | 11/32 | 2/32 | 0/32 | 13/96 | 1,836,706 | 20/96 | 24/96 |
| F2 | 7/32 | 0/32 | 0/32 | 7/96 | 1,621,022 | 8/96 | 8/96 |
| B2 | 7/32 | 0/32 | 0/32 | 7/96 | 1,579,646 | 8/96 | 8/96 |
| T2 | 5/32 | 1/32 | 0/32 | 6/96 | 1,636,583 | 7/96 | 7/96 |
| G2 | 6/32 | 9/32 | 2/32 | 17/96 | 1,126,363 | 17/96 | 17/96 |
| G8 | 16/32 | 15/32 | 3/32 | 34/96 | 1,496,029 | 38/96 | 40/96 |
| PERM | 6/32 | 5/32 | 2/32 | 13/96 | 1,146,490 | 13/96 | 13/96 |
| SMOOTH | 4/32 | 11/32 | 2/32 | 17/96 | 1,086,568 | 20/96 | 20/96 |
| BAND | 5/32 | 10/32 | 3/32 | 18/96 | 1,109,930 | 18/96 | 18/96 |
| HOMO | 5/32 | 10/32 | 2/32 | 17/96 | 1,099,765 | 20/96 | 20/96 |

Fixed = 2M work and 4096 rotations. Scaled rotation-only caps 4096/5735/7646 for n=6/7/8 (ceil 4096*d/15). F8/F2 legacy cached full LM eight/two starts; B2 batch score; T2 adds Euclidean clip; G2/G8 exact chart two/eight starts; PERM second-start signed permutation; SMOOTH/BAND/HOMO continuation on G2. Full metrics remain final acceptance; weighted intermediate objectives do not count as solutions. Square by equation count does not establish independent rank or a homotopy path; no claim that every failure is a local minimum. Chart restricted to disjoint degree-two supports, with different required initialization. BAND second stage already restores all forbidden weights in these chain masks; HOMO uses fixed canonical-input magnitude. Two-start 120-attempt ceilings may bind before rotation quotas. Signed permutations sampled, not exhaustive. Source fitting zero; engineering cost excluded. Partial modeled work, no runtime benchmark, no Lean numerical certificate or hardware. Reproduce `node rotation_geometry.cjs`; compact rows omit paths, reproducible from exported run().


## Experiment 7h — general rank-two port chart compiler

[Protocol](ROTATION_COMPILER_PROTOCOL.md) · [Code](rotation_compiler.cjs) · [Summary and compact raw file index](results/rotation_compiler_summary.json) · [Generator/derivative/negative audit](results/rotation_compiler_audit.json) · [Checked support proof obligations](results/rotation_compiler_obligations.json).

72 feasible fresh cases, 77000–77071, balanced across six support types and n=6/7/8; support vertices permuted, port roles swapped on alternating IDs. 12 exact integer negative controls, 77100–77111. Compiler reads mask and port Gram, not type labels or witness. Uses three general schemas: independent spherical chains for disjoint support, singleton nested support, partial union confinement for general overlap. Prunes only certified forbidden zero rows; all required hinge rows remain. 72 witness and transported derivative audits passed, maximum derivative error 7.447162886364823e-11; 72 separate symbolic support checks passed. 864 feasible runs and 12 negative baseline runs independently verified, max sampled response error 9.875426003145159e-14; maximum compiled endpoint leakage 4.7008448732065525e-17. All feasible budget caps and ledger sums checked. 12 exact integer nonzero Gram certificates independently checked, zero rotations and no false rejects in feasible corpus. Negative baseline failed all 12 under 2M work. Exact zero infeasibility is a mathematical certificate; no tolerance-general rejection theorem or floating-input certificate claimed.

| Arm | n=6 fixed | n=7 fixed | n=8 fixed | Fixed total | Fixed mean work | Rotation-only total | Rotation-only mean work |
|---|---:|---:|---:|---:|---:|---:|---:|
| F8 | 9/24 | 6/24 | 1/24 | 16/72 | 1,808,401 | 23/72 | 4,018,087 |
| INIT8 | 11/24 | 5/24 | 1/24 | 17/72 | 1,655,279 | 19/72 | 3,615,791 |
| NL8 | 8/24 | 5/24 | 0/24 | 13/72 | 1,805,945 | 28/72 | 8,820,301 |
| COMP-U8 | 19/24 | 13/24 | 4/24 | 36/72 | 1,264,550 | 40/72 | 2,201,179 |
| COMP-G8 | 19/24 | 13/24 | 4/24 | 36/72 | 1,200,556 | 40/72 | 1,769,984 |
| COMP-G8S | 21/24 | 17/24 | 8/24 | 46/72 | 991,640 | 48/72 | 1,492,579 |

Fixed = 2M work and 4096 rotations. F8 frozen 7g full baseline; INIT8 full LM from same chart seed states with same L2 clipping/batch scoring as compiled arms; NL8 local affine numerical nullspace step with no exact retraction (drift recorded); COMP-U8 unpruned; COMP-G8 pruned; COMP-G8S pruned plus smooth continuation, all eight starts. Compiler/seed costs charged to INIT8 and NL8 too. General overlap confines span to union only, not individual supports. This is automatic schema compilation, not automated invention of theorems. Support obligations checked by separate deterministic set-propagation audit, not Lean. Rank-one/empty/degenerate supports not validated. Source fitting zero; engineering cost excluded. Modeled work is partial, not runtime. No hardware or Lean numerical proof. Reproduce `node rotation_compiler.cjs`; compact rows omit paths, reproducible from exported run().


## Experiment 7i — composable support rules

[Protocol](ROTATION_RULES_PROTOCOL.md) · [Code](rotation_rules.cjs) · [Summary](results/rotation_rules_summary.json) · [Audit](results/rotation_rules_audit.json) · [Checked rule traces](results/rotation_rules_obligations.json) · [Lean obligation source](results/RotationRuleObligations.lean).

72 fresh feasible cases (78000–78071), six topology families, n=6/7/8; 18 integer negative controls (78100–78117). Five supplied rules compose into chart factors, including a one-variable two-rotation singleton-overlap cancellation and rank-one identical support expansion. No topology label passed to the reader. All 72 witness checks and derivative audits passed (max normalized derivative error 8.121848872456718e-11); 72 separately checked rule traces; maximum pruned endpoint leakage 8.881784197001253e-17. 720 result rows, 48 explicitly unsupported old rank-one rows, 672 numerical feasible runs and 18 negative baseline paths verified (max sampled response error 6.271868408591812e-14). All 18 exact integer certificates independently checked, zero rotations, no false rejections among 72 feasible inputs. F8 failed all negative controls. Exact contradiction applies to exact target support, not arbitrary numerical tolerances.

| Arm | Rank-two fixed | Mean work | Rank-two rotation-only | Mean work | Singleton fixed |
|---|---:|---:|---:|---:|---:|
| F8 | 9/60 | 1,826,766 | 12/60 | 4,300,017 | 3/36 |
| OLD-D | 12/60 | 1,785,741 | 12/60 | 3,304,753 | 4/36 |
| OLD-S | 23/60 | 1,456,425 | 28/60 | 2,742,008 | 12/36 |
| NEW-D | 20/60 | 1,575,380 | 21/60 | 2,405,978 | 12/36 |
| NEW-S | 26/60 | 1,324,891 | 32/60 | 2,042,677 | 15/36 |

Fixed = 2M work + 4096 rotations, rotation-only = 4096. Rank-two paired set excludes rank-one rows unsupported by OLD-D/S. Rank-one uses exact signed-permutation starts, unlike canonicalized rank-two cases. New direct/smooth share 7h cached LM and acceptance, with actual dependent factor rotations charged. Double overlap remains union confinement. Single coupled branch covers sign-equivalent magnitudes, not all sign-sensitive solutions. Near-zero floating Gram/rank inputs unsupported. The Lean source contains conditional scalar cancellation/nonmixing lemmas and concrete integer premises; it is not a full formalization of real orthogonal invariance or all emitted chart traces. No local Lean executable; CI command added, kernel result not claimed here. Partial work model, no runtime or hardware. Reproduce `node rotation_rules.cjs`; compact rows omit paths, reproducible from exported run().


## Experiment 8 — bounded symbolic program synthesis

[Protocol](ROTATION_DISCOVERY_PROTOCOL.md) · [Discovery engine](discover_givens.cjs) · [Frozen program library](results/rotation_discovery_library.json) · [Numerical compiler](rotation_discovery.cjs) · [Summary](results/rotation_discovery_summary.json) · [Audit](results/rotation_discovery_audit.json) · [Lean polynomial obligations](results/RotationDiscoveryObligations.lean).

8a/8b: both guided and unranked search found all six requested programs, including a four-rotation/three-free-parameter double-overlap program with intermediate annihilation, and its (3,4)/(4,4) extensions. No supplied overlap formula in the engine; grammar, aligned anchors, target dimension and conservative denominator test supplied. Exact integer expanded polynomial coefficients vanish on every forbidden coordinate; 12 generic samples per accepted program pass full local rank and central derivative checks. Not a global coverage proof, no claim mathematical novelty or unbounded symbolic search. Both searches prune support-unchanged steps (including dependent steps) and reject dependent steps with zero coefficient; these extra conservative restrictions not specified in frozen protocol. Both extension searches use guided prefix. Discovery ledger:

| Task | Search | Found | Candidate expansions | Polynomial add/multiply term operations | Numerical checks work |
|---|---|---|---:|---:|---:|
| disjoint22 | guided | yes | 180 | 162 | 9888 |
| disjoint22 | unranked | yes | 348 | 162 | 9888 |
| nested13 | guided | yes | 15 | 40 | 1764 |
| nested13 | unranked | yes | 69 | 188 | 1764 |
| singleton22 | guided | yes | 81 | 232 | 3996 |
| singleton22 | unranked | yes | 273 | 628 | 3996 |
| double33 | guided | yes | 9276 | 21273 | 40620 |
| double33 | unranked | yes | 9276 | 21273 | 40620 |
| double34 | guided | yes | 50 | 149 | 83112 |
| double34 | unranked | yes | 50 | 149 | 83112 |
| double44 | guided | yes | 75 | 197 | 148044 |
| double44 | unranked | yes | 75 | 197 | 148044 |

Frozen library committed before new numerical cases. 48 fresh feasible cases (79000–79047), n=6/7/8 and double overlap (3,3),(3,4),(4,4). 384 runs, all returned paths independently verified, max sampled response error 8.941790276351704e-14; all 48 witness checks and derivative audits passed (max normalized derivative error 6.955633729806944e-11), max pruned endpoint leakage 9.613805565641387e-17. All caps and ledger sums checked.

| Arm | Fixed | Mean work | Rotation-only | Mean work |
|---|---:|---:|---:|---:|
| OLD-S | 18/48 | 1,518,814 | 29/48 | 3,251,092 |
| OLD-P | 18/48 | 1,519,309 | 29/48 | 3,254,074 |
| SYN-S | 32/48 | 1,111,814 | 39/48 | 1,630,939 |
| SYN-P | 26/48 | 1,329,235 | 32/48 | 2,394,479 |

Fixed = 2M work + 4096 rotations. OLD-S is frozen 7i union chart, OLD-P same with factor norm clip, SYN-S discovered chart with parameter clip, SYN-P discovered chart with differential and finite wrapped factor displacement cap. The latter is not an invariant SO(n) geodesic norm. No singleton regression diagnostic in this run; physical clip benefit not established. Different chart anchor selection/initialization is a remaining confound. Discovery cost tracked separately because symbolic terms and numerical ledger are not calibrated comparable units; no reliable break-even count. No actual wall-time or hardware. Lean file checks concrete symbolic forbidden polynomial identities, not real interpretation/global coverage. Reproduce `node discover_givens.cjs` (frozen library can be regenerated) and `node rotation_discovery.cjs`. Compact rows omit paths, reproducible from exported run().


## Experiment 9 — autonomous reuse and organ competition

[Protocol](ROTATION_REUSE_PROTOCOL.md) · [Reuse search](reuse_givens.cjs) · [Frozen library](results/rotation_reuse_library.json) · [Numerical benchmark](rotation_reuse.cjs) · [Summary](results/rotation_reuse_summary.json) · [Audit](results/rotation_reuse_audit.json) · [Lean polynomial obligations](results/RotationReuseObligations.lean).

9a removes explicit target prefixes and excludes the known larger extension solutions from the source library. It enumerates injective anchor-fixed vertex mappings preserving source membership as a subset of target membership, and seeds the root with replayed prefixes from the smaller library. The no-memory best-first control uses identical primitive grammar and priority. Both depth-six targets hit the flat BFS and best-first caps; reuse passes all three <5000 predictions. The smaller double34/double44 are rediscovery tasks, triple44 is an unseen support target. All new programs pass exact symbolic zero and sampled rank/derivative checks. No global surjectivity claim. Ledger includes mapping/replay charges; not every JS operation charged. Not an exhaustive impossibility claim.

| Target | Search | Found | Charged candidates | Polynomial term ops | Priority comparisons | Peak frontier |
|---|---|---|---:|---:|---:|---:|
| double34 | BFS | no | 200,000 | 639,902 | 0 | 41,855 |
| double34 | BEST | yes | 24,660 | 10,688 | 7,235 | 80 |
| double34 | REUSE | yes | 70 | 246 | 78 | 25 |
| double44 | BFS | no | 200,000 | 588,431 | 0 | 48,047 |
| double44 | BEST | no | 200,000 | 55,129 | 36,393 | 51 |
| double44 | REUSE | yes | 128 | 551 | 177 | 52 |
| triple44 | BFS | no | 200,000 | 955,664 | 0 | 60,940 |
| triple44 | BEST | no | 200,000 | 550,676 | 344,604 | 60 |
| triple44 | REUSE | yes | 120 | 730 | 350 | 38 |

9b: 48 fresh feasible cases (80000–80047), 24 double33 and 24 triple44, n=6/7/8. 480 numerical runs (B duplicates A for triple44, not independent evidence). All 48 witnesses and 72 synthesized-chart derivative audits passed (max 4.617350057856129e-10); all returned paths independently verified, max sampled response error 1.9207031597035173e-13, max chart leakage 9.870924519324027e-17. All caps and ledger sums checked.

| Slice | Arm | Fixed solved | Mean work | Rotation-only solved | Mean work |
|---|---|---:|---:|---:|---:|
| all | OLD-S | 23/48 | 1,440,562 | 29/48 | 2,818,311 |
| all | OLD-INIT | 25/48 | 1,356,107 | 30/48 | 2,478,009 |
| all | OLD-END | 25/48 | 1,346,944 | 36/48 | 2,604,041 |
| all | A | 25/48 | 1,369,481 | 36/48 | 2,128,343 |
| all | B | 29/48 | 1,275,919 | 37/48 | 1,971,137 |
| double | OLD-S | 10/24 | 1,475,107 | 11/24 | 2,865,978 |
| double | OLD-INIT | 9/24 | 1,468,858 | 11/24 | 2,721,806 |
| double | OLD-END | 10/24 | 1,547,836 | 15/24 | 3,190,690 |
| double | A | 12/24 | 1,352,891 | 15/24 | 2,129,940 |
| double | B | 16/24 | 1,165,767 | 16/24 | 1,815,528 |
| triple | OLD-S | 13/24 | 1,406,018 | 18/24 | 2,770,643 |
| triple | OLD-INIT | 16/24 | 1,243,356 | 19/24 | 2,234,212 |
| triple | OLD-END | 15/24 | 1,146,052 | 21/24 | 2,017,391 |
| triple | A | 13/24 | 1,386,070 | 21/24 | 2,126,745 |
| triple | B | 13/24 | 1,386,070 | 21/24 | 2,126,745 |

Fixed = 2M work + 4096 rotations. OLD-S is frozen 7i union chart, OLD-INIT matches synthesized anchor selection/aligned base and random streams but uses union tail coordinates (different endpoints), OLD-END uses A chart seed endpoints then unrestricted full LM with smooth continuation. A/B use independently found double33 programs from 8; triple44 uses the same discovered chart in both. Numerical comparison does not isolate conditioning from chart-dependent endpoints, no learned selector. Root-prefix reuse is not arbitrary mid-program macro invocation. No runtime, hardware, comparable symbolic/numerical amortization or formal global chart coverage claim. Lean obligations check exact forbidden polynomial identities; CI status separate. Reproduce `node reuse_givens.cjs` and `node rotation_reuse.cjs`. Compact rows omit paths, reproducible from exported run().


## Experiment 10a — lineage fitness transfer

[Protocol](ROTATION_LINEAGE_PROTOCOL.md) · [Harvest and child synthesis](lineage_givens.cjs) · [Frozen library](results/rotation_lineage_library.json) · [Source measurements](results/rotation_lineage_source.json) · [Frozen selection](results/rotation_lineage_policies.json) · [Numerical benchmark](rotation_lineage.cjs) · [Summary](results/rotation_lineage_summary.json) · [Target audit](results/rotation_lineage_audit.json) · [Lean polynomial obligations](results/RotationLineageObligations.lean).

Six parent programs retained from seven accepted depth-four sequences (includes prior A/B). All 24 parent/child combinations synthesized with explicit macro provenance and passed generic rank/derivative and exact symbolic zero checks. Per-parent charged candidates 30/68/70/508 for double34/double44/triple44/triple45. The child library is frozen before numerical source/target evaluation. All parents have ten endpoint polynomial terms, A/C tie for lowest mean sampled port-Jacobian condition. Source 12 fresh n=6 matrices, two restart streams, 144 runs, total modeled work 124,897,219. Source winner A (19/24) is also insertion, terms and condition winner; no added value of source-based policy over static controls. D is fixed comparator, uniform random expectation is averaged across six policies, not an actual random draw.

| Parent/control | Source | Fixed target | Mean work | Rotation-only target | Mean work |
|---|---:|---:|---:|---:|---:|
| A | 19/24 | 31/48 | 1,195,977 | 42/48 | 1,741,902 |
| B | 17/24 | 27/48 | 1,375,506 | 38/48 | 2,401,389 |
| C | 17/24 | 33/48 | 1,107,067 | 43/48 | 1,682,506 |
| D | 17/24 | 28/48 | 1,374,995 | 38/48 | 2,400,484 |
| E | 18/24 | 28/48 | 1,292,654 | 39/48 | 2,316,950 |
| F | 18/24 | 31/48 | 1,280,192 | 45/48 | 1,828,562 |
| OLD-INIT | — | 17/48 | 1,579,027 | 32/48 | 3,589,522 |
| OLD-END | — | 26/48 | 1,295,696 | 39/48 | 2,747,112 |

48 fresh target matrices, n=7/8, four child contracts, 768 evaluations plus 144 source runs. Uniform expected target successes 29.67/48 fixed and 40.83/48 rotation-only; oracle union 44/48 and 47/48 (not deployable policy). Source-to-target rank Spearman 0.029 fixed and 0.086 rotation-only (six organs, descriptive). Source selection did not identify best target parent; no incremental transfer benefit established. All 60 witnesses and 360 chart derivative audits passed, max derivative 3.348561921572784e-10; all 912 numerical returned paths verified and caps/ledger sums checked; maximum sampled response error 3.8429756988392296e-14, max chart leakage 9.613894400882401e-17. B/D can be near equivalent parameterizations; no guarantee six distinct mathematical maps. Target library selected before source fitness evaluation, no actual learned pruning. No wall time, comparable symbolic/numeric amortization, hardware or global real chart proof. 10b not run. Reproduce `node lineage_givens.cjs` then `node rotation_lineage.cjs`.
