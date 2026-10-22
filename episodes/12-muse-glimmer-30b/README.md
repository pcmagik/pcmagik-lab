# Muse Glimmer 30B spends a third of its output thinking. Do rules change that?

Same model, same prompt, same rig. 3 runs with nothing added, 3 with one Karpathy rules file. The model was reloaded before every run; every number comes from the run logs. The ranges overlap (28–42 effects without the rules, 35–49 with them), so on this model the rules changed nothing measurable. Full cohort measurements, representative pages and prompts are available on the episode page. Harness: pi 0.85.1. Reasoning effort actually used by the model: medium. Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

[Watch on YouTube](https://www.youtube.com/shorts/79nWI3PeOyI)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| muse-glimmer-30b_bare_r1 | unsloth/muse-glimmer-30b | bare | pi | 3 min 17 s | 7,988 | 32.31% | 40.53 | 275 | [open](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_bare_r1/screenshot-1920.png) |
| muse-glimmer-30b_bare_r2 | unsloth/muse-glimmer-30b | bare | pi | 3 min 34 s | 8,606 | 36.93% | 40.23 | 279 | [open](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_bare_r2/screenshot-1920.png) |
| muse-glimmer-30b_bare_r3 | unsloth/muse-glimmer-30b | bare | pi | 3 min 00 s | 7,264 | 31.55% | 40.33 | 325 | [open](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_bare_r3/screenshot-1920.png) |
| muse-glimmer-30b_karpathy_r1 | unsloth/muse-glimmer-30b | karpathy | pi | 3 min 20 s | 7,973 | 19.21% | 39.93 | 324 | [open](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_karpathy_r1/screenshot-1920.png) |
| muse-glimmer-30b_karpathy_r2 | unsloth/muse-glimmer-30b | karpathy | pi | 3 min 20 s | 7,971 | 31.95% | 39.84 | 309 | [open](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_karpathy_r2/screenshot-1920.png) |
| muse-glimmer-30b_karpathy_r3 | unsloth/muse-glimmer-30b | karpathy | pi | 3 min 02 s | 7,345 | 23.92% | 40.36 | 334 | [open](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/12-muse-glimmer-30b/muse-glimmer-30b_karpathy_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| muse-glimmer-30b_bare_r1 | unsloth/muse-glimmer-30b | Q4_K_XL | 131072 | K f16 / V f16 (LM Studio default) | 125548 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer-30b_bare_r2 | unsloth/muse-glimmer-30b | Q4_K_XL | 131072 | K f16 / V f16 (LM Studio default) | 125548 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer-30b_bare_r3 | unsloth/muse-glimmer-30b | Q4_K_XL | 131072 | K f16 / V f16 (LM Studio default) | 125548 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer-30b_karpathy_r1 | unsloth/muse-glimmer-30b | Q4_K_XL | 131072 | K f16 / V f16 (LM Studio default) | 124960 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| muse-glimmer-30b_karpathy_r2 | unsloth/muse-glimmer-30b | Q4_K_XL | 131072 | K f16 / V f16 (LM Studio default) | 124960 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| muse-glimmer-30b_karpathy_r3 | unsloth/muse-glimmer-30b | Q4_K_XL | 131072 | K f16 / V f16 (LM Studio default) | 124960 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
