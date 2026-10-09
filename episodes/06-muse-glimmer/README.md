# Muse Glimmer builds a web page in 2.5 minutes. What changes with Karpathy rules?

Same model, same prompt, same rig. 3 runs with nothing added, 3 with one Karpathy rules file. The model was reloaded before every run; every number comes from the run logs. The ranges overlap (34–42 effects without the rules, 38–41 with them), so on this model the rules changed nothing measurable. Full cohort measurements, representative pages and prompts are available on the episode page. Harness: pi 0.85.1. Reasoning effort actually used by the model: medium. Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

[Watch on YouTube](https://www.youtube.com/shorts/e8FWKxCOrPg)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| muse-glimmer_bare_r1 | meta/muse-glimmer | bare | pi | 2 min 44 s | 6,334 | 14.75% | 38.59 | 376 | [open](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_bare_r1/screenshot-1920.png) |
| muse-glimmer_bare_r2 | meta/muse-glimmer | bare | pi | 2 min 29 s | 5,752 | 13.46% | 38.62 | 330 | [open](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_bare_r2/screenshot-1920.png) |
| muse-glimmer_bare_r3 | meta/muse-glimmer | bare | pi | 2 min 29 s | 5,733 | 20.6% | 38.48 | 313 | [open](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_bare_r3/screenshot-1920.png) |
| muse-glimmer_karpathy_r1 | meta/muse-glimmer | karpathy | pi | 2 min 20 s | 5,382 | 9.25% | 38.41 | 307 | [open](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_karpathy_r1/screenshot-1920.png) |
| muse-glimmer_karpathy_r2 | meta/muse-glimmer | karpathy | pi | 2 min 19 s | 5,342 | 16.42% | 38.3 | 268 | [open](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_karpathy_r2/screenshot-1920.png) |
| muse-glimmer_karpathy_r3 | meta/muse-glimmer | karpathy | pi | 2 min 30 s | 5,778 | 11.72% | 38.64 | 272 | [open](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/06-muse-glimmer/muse-glimmer_karpathy_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| muse-glimmer_bare_r1 | meta/muse-glimmer | Q4_K_M | 131072 | K f16 / V f16 (LM Studio default) | 125550 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer_bare_r2 | meta/muse-glimmer | Q4_K_M | 131072 | K f16 / V f16 (LM Studio default) | 125550 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer_bare_r3 | meta/muse-glimmer | Q4_K_M | 131072 | K f16 / V f16 (LM Studio default) | 125550 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer_karpathy_r1 | meta/muse-glimmer | Q4_K_M | 131072 | K f16 / V f16 (LM Studio default) | 124962 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| muse-glimmer_karpathy_r2 | meta/muse-glimmer | Q4_K_M | 131072 | K f16 / V f16 (LM Studio default) | 124962 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| muse-glimmer_karpathy_r3 | meta/muse-glimmer | Q4_K_M | 131072 | K f16 / V f16 (LM Studio default) | 124962 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
