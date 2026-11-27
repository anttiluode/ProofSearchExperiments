# The shape of unfinished computation — November 27, 2026

A research diary, from the morning proof-node experiment to the evening pause at Gate 14a-tier. Written at the human director's request, using the two repository histories and the Sol/Neon research relay. The session ran from morning until roughly 7 PM Finland time; this is a narrative of the day, not a measured labor or runtime total.

## 1. Morning: could a proof fold?

The original idea was not a new filter synthesis algorithm. It was an image of a mathematical proof behaving a little like a protein: partially assembled pieces exposing sockets, local compatibility constraining possible folds, and a reader trying to recognize a promising structure before the complete proof exists.

The first instrument was [ProofSearchExperiment (singular)](https://github.com/anttiluode/ProofSearchExperiment). Its tiny formal language has ordered predicate arguments, shared witness holes and transitivity nodes. A local attachment binds the same witness wherever it occurs. Canonical binder positions remove superficial renaming. Lean checks the assembled term; search has no authority to alter the verifier.

The experiment inherited ideas from [P-KAS](https://github.com/anttiluode/PkasPCL3satSolver), [Deerskin](https://github.com/anttiluode/PkasDeerskin) and [Kartiokello](https://github.com/anttiluode/Kartiokello): local constraint feedback, changing exploration when a configuration stalls, and a clock for unfinished commitments. These were engineering analogies, not physical derivations.

The first apparent setback was useful. The witness clock reduced bidirectional coverage from 24/24 to 21/24; Neon spotted stale queue entries that consumed the budget. Repairing the scheduler restored 24/24. With matched live accounting and dominance, changing priority alone reduced attempts from 1,656 to 1,276. Yet graph-specific BFS was an even stronger control. A separate competing-lemma test showed that pairwise matching chose the right three-premise rule first only 4/32 times, while full joint matching did so 32/32 times; a direct indexed join still used fewer intersections. Read the [parent follow-up](https://github.com/anttiluode/ProofSearchExperiment/blob/main/FOLLOWUP.md).

The question became sharper: **can a machine recognize the shape of an expensive computation for less than it costs to perform that computation?**

## 2. Two papers and a bridge

Three preprints explicitly surfaced in this lineage (the first two in the parent README, the third in Experiment 7e):

- Xin Yu et al., [Self-Improvement Memory Enables Continual Recursive Self-Improvement](https://arxiv.org/abs/2611.18856) (November 13, 2026), the Google SIM paper discussed in the morning. Its distinction between the task-solving policy and the harness optimizer inspired keeping intervention histories: why an edit was made, what was predicted, what happened, and the evaluation context. The first fixed-policy SIM proxy tied the controls; this repo has not replicated the paper's self-improvement result. The later [SIM notebook](SIM_OPERATOR_READER.json) is a human/model-maintained record of actual harness development, not an autonomous learned optimizer.
- Venkatesa Chandrasekaran, [An algebraic quantization of gravity from the null cone](https://arxiv.org/abs/2611.34924) (November 25, 2026). The discussion of constrained state spaces and finite causal diamonds encouraged the geometric intuition. It neither derives a proof-search heuristic nor proves any computational advantage here.
- Wes Gurnee et al., [Verbalizable Representations Form a Global Workspace in Language Models](https://arxiv.org/abs/2607.15495) (July 16, 2026). Its Jacobian lens and pursuit machinery were a reference for the selective numerical-organ experiments; 7e explicitly differs from its nonnegative pursuit. No LLM workspace or consciousness result is established by this repo.

The older [TransientWaveCompiler](https://github.com/anttiluode/TransientWaveCompiler) supplied a concrete domain where equivalence, composition and geometry mattered: the same two-port response can be represented by different symmetric coupling matrices. [TWC gauge-capability notes](https://github.com/anttiluode/TransientWaveCompiler/blob/agent/tw1a-common-diff-v08/docs/FILTER_TOPOLOGY_GAUGE_CAPABILITY_MAP_2026-08-10.md) and classical Givens rotations, orthogonal similarity, relational joins, free-group normalizers, Aesop and Cameron-style coupling-matrix synthesis provide context and strong prior-art comparison targets. Full classical Cameron synthesis was not implemented; no novelty relative to the specialist literature is claimed.

## 3. The plural repository: readers repeatedly meet exact controls (1–6c)

[ProofSearchExperiments](README.md) began as a continuation, not a replacement for the parent. Wave diffusion identified the right rule and witness on 64/64 positives but required about 3,923 edge visits versus 1,012 for blind visited-set BFS. Bucketed complex sketches improved sparse support discrimination, not local exact join speed. The first motif cache showed only a small warm benefit; fixed policy memory had no discriminating signal.

Strategy fatigue solved hard parity cases that static priority missed, but round-robin fairness did the work more economically, and exact suffix elimination decided the entire bounded join family without backtracking (845 mean modeled units versus 2,088 for round-robin). The direct structure mattered more than clever scheduling.

The first mined rewrite macros compressed proof traces but increased work. Neon found unmatched primitive/macro accounting and an output association that prevented a macro from feeding itself. Repairing the matcher and deriving a compatible output made the same verified law reusable. The final split-bucket scan saved 26.3% modeled work against its matched primitive scan on the replayed 72 expressions; the length-12 conjugation chain used 11 consecutive macro hits, 23 proof applications versus 67. The signed-word oracle remains a stronger specialized equality decider. Lean checked the relevant symbolic obligations and certificates in the recorded CI runs.

The essential bridge was the conjugation identity: products of operators in a common transformed frame can be fused. Exact rational arithmetic on TWC-derived matrices then made this a concrete geometric instrument, not just a proof metaphor.

## 4. Geometry replaces numerical work (7a–7i)

The new problem was to find an internal orthogonal similarity that preserves fixed external ports and a two-port response while meeting a target coupling mask. Each feasible case is generated from a witness; the solver receives the start matrix and mask, not the witness itself (normalization scalar retained as documented).

Rational Givens elimination beat discrete orbit search on its designed sparse corpus (24/24 vs 19/24 greedy, much lower modeled work). Continuous least squares, analytic Lie derivatives and port alignment improved harder cases. The original prediction of a 2n canonical edge bound was wrong; the direct source-load edge makes it 2n+1. The incorrect prediction remains archived.

We tried mined pivot motifs, selective Jacobian blocks, diagonal approximations and short PCG. Cheap iterations often failed to converge. At n=8 in 7f, none of the seven arms solved the 32 cases, even with the rotation-only cap. Caching full LM helped more than approximating it.

Then a different move: encode exact port constraints in the transformation itself. Disjoint degree-two charts moved 7g from 13/96 fixed-budget baseline solves to 34/96. The general rank-two compiler plus continuation in 7h reached 46/72 vs 16/72 for full baseline, and independently checked 12 exact integer negative certificates. Composable support rules in 7i extended the chart vocabulary. These were family-specific constructions with explicit assumptions, not a general theorem about all masks.

## 5. Symbolic machinery acquires descendants (8–11)

Instead of hand-writing a formula for each new overlap, the bounded synthesizer searched free and dependent Givens factors. Its output programs enforce forbidden port coordinates through exact polynomial cancellation, with sampled rank and derivative checks. A double-overlap program uses four physical rotations and three free angles. Inheritance then became a search mechanism rather than a label: replay a smaller program under an injective membership-preserving mapping, and extend it.

| Target | Flat BFS charged candidates | Best-first | Reuse |
|---|---:|---:|---:|
| double34 | 200,000 (cap) | 24,660 | 70 |
| double44 | 200,000 (cap) | 200,000 (cap) | 128 |
| triple44 | 200,000 (cap) | 200,000 (cap) | 120 |

The first two were rediscoveries with the larger solutions withheld; triple44 was an unseen support target. These are bounded grammar search comparisons, not general proof complexity results. Later, 15 successful reuse searches produced triple55 and quad55, with 30 audited programs including reflected variants. Both use seven free port angles and eight physical rotations. [Reuse receipts](results/rotation_reuse_summary.json) · [Deeper library and comparison](results/rotation_quality_summary.json).

There was another negative result: the six-parent source ranking had almost no target ranking association (Spearman 0.029 fixed, 0.086 rotation-only). Static quality and split portfolios failed to outperform simple choices reliably. The symbolic discovery engine was still extending its range; choosing the numerically best realization was a separate, unsolved problem.

## 6. The cost of reading a running computation (12–13)

Gate 12 was read-only: 128/128 exact replays, 404 observed starts, 6,897 completed trials. At n=9, recent progress had an exploratory AUC of 0.908 by trial 10, but a successful start had already spent a median 757,308 work units by then. Under a 2M budget, watching several starts long enough could consume most of the available computation. Later discrimination is survivor-conditioned; quota-limited misses are not proved dead basins.

Gate 13 froze eight allocation policies and evaluated 512 fresh runs. All 64 baseline replays, 32 generator witnesses and 512 final numerical path checks passed. Longer fixed leashes recovered n=9/2M solutions (2/16 to 5/16). UNLEASH had the highest aggregate count across the four size/budget cells (29/64 vs LONG 27/64, BASE 22/64; not 64 independent cases). Progress racing helped n=8/2M but failed to transfer to n=9/4M.

The two matched counterexamples 84020 and 84022 were especially instructive: UNLEASH killed the initial trajectory on a rejected step; LONG rejected one more step, adjusted its damping, and solved inside the 2M budget. A reader mistook the solver's recovery mechanism for death. Both suspended racing arms also averaged only two issued starts at n=9/4M; the scheduler and stale progress readings are plausible limits of that design, not a verdict on saving computation in general.

## 7. Evening: exact quadratic internal constraints (14a, fast, tier)

Neon proposed peeling pendant internal leaves after port compilation. Port constraints act on vectors; internal constraints involve quadratic similarity. The new stabilizer chart maps projected leaf axes to a free direction and successive signed normalized projected matrix images, leaving an SO core. This enforces selected projected constraints identically, not every original forbidden entry. Full acceptance remains mandatory.

| Internal size | Port-only | Peel one | Peel two |
|---|---:|---:|---:|
| 8 | 22 | 18 | 15 |
| 9 | 28 | 23 | 19 |

On the old diagnostic family, both peel depths reconstructed all 32 frozen-port witnesses (64/64, max normalized error 5.64e-14). All 256 generic derivative/identity/orthogonality/port audits passed. The seven-angle witness port fit converged from the first deterministic initialization in all 32 cases. This is conditional local algebra plus numerical witness evidence, not proof of global surjectivity; witness reconstruction extracts a residual core matrix rather than inverting all explicit angles.

The dense reference differentiated much more than necessary. The fast pass also exposed a dangerous coordinate artifact: the old max-pivot completion switched 170 times in 84/100 finite paths, with largest adjacent normalized matrix jump 0.8374. Retaining local frames reduced the sampled maximum to 0.0355 and preserved rebased endpoints to 2.75e-15. All 100 finite probes and all 256 reference derivative checks passed. Finite probes are not a global smoothness proof.

Tier-specific Lie generators then differentiated only the relevant projected prefixes and transported core/port rotations. All 256 local derivative comparisons passed (max 3.48e-14). The cost came down to approximate parity:

| n=9, same starting endpoint, 64 samples per stage | Smooth median modeled work | Full median modeled work |
|---|---:|---:|
| FIRST, 28 variables | 74,900.5 | 77,220 |
| Sparse pullback, 19 variables | 112,598 | 115,450.5 |
| Tier Lie generators, 19 variables | 74,369 | 78,506.5 |

The dense reference's mean 941,843 arithmetic count was a diagnostic AD evaluation, not the same complete LM iteration ledger. It cannot be directly divided by the last row to claim a measured speedup. The frozen requirement to beat FIRST in both stages failed; no 40–45k result was achieved. Exploratory triple55 medians favor peeling, quad55 medians favor FIRST despite equal dimension. This suggests dependency structure affects cost, but does not yet justify a selector.

[14a geometry](results/rotation_peel_summary.json) · [Frame and pullback audit](results/rotation_peel_fast_summary.json) · [Tier cost audit](results/rotation_peel_tier_summary.json).

## 8. How we worked, and why stopping is a result

The human director supplied the geometric intuitions, selected the direction, and relayed the models' work. Sol developed the experiments, wrote protocols and code, executed measurements and committed receipts. Neon independently criticized the designs and source/receipt evidence, proposed controls and caught implementation and mathematical confounds. This was a manual adversarial relay, not autonomous multi-agent training or a controlled demonstration of continual recursive self-improvement. A new Sol conversation resumed the harness at Gate 12 from the repository and exported discussions.

The recurring procedure was to turn a suggestion into an instrument, freeze the relevant protocol, run it against strong controls, preserve the original outcomes, and distinguish later diagnostic repairs from new holdouts. It was not perfect: early accounting and scheduling were wrong, some predictions were registered retrospectively or exploratory, some measurements share cases, and the work model is heterogeneous and incomplete. The history is more valuable because these mistakes remain visible rather than being erased.

A recurring empirical observation is that many clever readers lose once we charge for reading, and many cheap approximate steps lose when we require the complete computation to succeed. Exact reusable structure sometimes avoids the work entirely. This is a research hypothesis and an observation in these families, not a universal law.

**Evening stopping point:** no fresh Gate 14b solves have been run. Seeds 85000–85031 remain unopened. The local geometry and derivatives have evidence; cost advantage in both stages has not been established. A production reduced solver still needs physical Givens path reconstruction, rotation accounting, accepted/rejected state handling, singularity guards and matched controls. Possible next directions are reduced residual/Gram structure or cheaper derivative dependencies, followed by a frozen full-trajectory evaluation. Do not tune on the fresh holdout or claim faster convergence from a smaller chart alone.

The work is public, reproducible from the committed scripts and receipts within the stated numerical and symbolic scope. There is no general theorem prover, global chart coverage proof, full literature novelty comparison, industrial hardware test, measured runtime advantage or commercial valuation. Lean checks symbolic terms and obligations, not the floating-point realizations. Failure to find a numerical realization does not establish infeasibility.

The day began with the picture of a proof folding into place. It ends with a small machine that can discover and inherit some exact transformations, recognize and eliminate some of its own numerical constraints, and report when that reduction costs too much. We have not reached a clean dead end; we have reached a clearly documented boundary. That is a good place to leave the machine overnight.
