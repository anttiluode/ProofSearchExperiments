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
