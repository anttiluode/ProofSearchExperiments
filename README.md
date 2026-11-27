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
