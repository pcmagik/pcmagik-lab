# Gemma 4 26B A4B: 110 tokens per second. Does a rules file change the page?

Same model, same prompt, same rig. 3 runs with nothing added, 3 with one Karpathy rules file. The model was reloaded before every run; every number comes from the run logs. The ranges overlap (21–36 effects without the rules, 29–39 with them), so on this model the rules changed nothing measurable. Full cohort measurements, representative pages and prompts are available on the episode page. Harness: pi 0.85.1. Reasoning effort actually used by the model: on. Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

[Watch on YouTube](https://www.youtube.com/shorts/D_1GVPUnn5c)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| gemma-4-26b-a4b-qat_bare_r1 | google/gemma-4-26b-a4b-qat | bare | pi | 2 min 35 s | 17,251 | 10.03% | 111.41 | 479 | [open](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_bare_r1/screenshot-1920.png) |
| gemma-4-26b-a4b-qat_bare_r2 | google/gemma-4-26b-a4b-qat | bare | pi | 1 min 45 s | 11,531 | 20.78% | 109.51 | 311 | [open](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_bare_r2/screenshot-1920.png) |
| gemma-4-26b-a4b-qat_bare_r3 | google/gemma-4-26b-a4b-qat | bare | pi | 36 s | 4,109 | 16.38% | 115.72 | 311 | [open](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_bare_r3/screenshot-1920.png) |
| gemma-4-26b-a4b-qat_karpathy_r1 | google/gemma-4-26b-a4b-qat | karpathy | pi | 1 min 15 s | 8,040 | 29.85% | 106.55 | 454 | [open](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_karpathy_r1/screenshot-1920.png) |
| gemma-4-26b-a4b-qat_karpathy_r2 | google/gemma-4-26b-a4b-qat | karpathy | pi | 1 min 03 s | 6,799 | 15.58% | 108.52 | 528 | [open](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_karpathy_r2/screenshot-1920.png) |
| gemma-4-26b-a4b-qat_karpathy_r3 | google/gemma-4-26b-a4b-qat | karpathy | pi | 1 min 27 s | 9,461 | 16.22% | 109.16 | 413 | [open](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/08-gemma-4-26b-a4b/gemma-4-26b-a4b-qat_karpathy_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| gemma-4-26b-a4b-qat_bare_r1 | google/gemma-4-26b-a4b-qat | Q4_0 | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| gemma-4-26b-a4b-qat_bare_r2 | google/gemma-4-26b-a4b-qat | Q4_0 | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| gemma-4-26b-a4b-qat_bare_r3 | google/gemma-4-26b-a4b-qat | Q4_0 | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| gemma-4-26b-a4b-qat_karpathy_r1 | google/gemma-4-26b-a4b-qat | Q4_0 | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| gemma-4-26b-a4b-qat_karpathy_r2 | google/gemma-4-26b-a4b-qat | Q4_0 | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| gemma-4-26b-a4b-qat_karpathy_r3 | google/gemma-4-26b-a4b-qat | Q4_0 | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
