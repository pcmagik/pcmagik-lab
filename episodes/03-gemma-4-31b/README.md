# Gemma 4 31B with and without Karpathy rules

Same model, same prompt, same rig. 3 runs with nothing added, 3 with one Karpathy rules file. The model was reloaded before every run; every number comes from the run logs. The ranges overlap (29–39 effects without the rules, 31–44 with them), so on this model the rules changed nothing measurable. Full cohort measurements, representative pages and prompts are available on the episode page. Harness: pi 0.85.1. Reasoning effort actually used by the model: on. Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

[Watch on YouTube](https://www.youtube.com/shorts/18ERHNd9M-0)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| gemma-4-31b-qat_bare_r1 | google/gemma-4-31b-qat | bare | pi | 6 min 26 s | 11,279 | 9.52% | 29.24 | 403 | [open](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_bare_r1/screenshot-1920.png) |
| gemma-4-31b-qat_bare_r2 | google/gemma-4-31b-qat | bare | pi | 22 min 25 s | 39,349 | 2.75% | 29.27 | 418 | [open](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_bare_r2/screenshot-1920.png) |
| gemma-4-31b-qat_bare_r3 | google/gemma-4-31b-qat | bare | pi | 6 min 38 s | 11,515 | 8.7% | 28.96 | 385 | [open](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_bare_r3/screenshot-1920.png) |
| gemma-4-31b-qat_karpathy_r1 | google/gemma-4-31b-qat | karpathy | pi | 5 min 05 s | 8,910 | 7.85% | 29.25 | 369 | [open](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_karpathy_r1/screenshot-1920.png) |
| gemma-4-31b-qat_karpathy_r2 | google/gemma-4-31b-qat | karpathy | pi | 7 min 30 s | 12,835 | 3.42% | 28.52 | 447 | [open](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_karpathy_r2/screenshot-1920.png) |
| gemma-4-31b-qat_karpathy_r3 | google/gemma-4-31b-qat | karpathy | pi | 21 min 35 s | 37,583 | 2.91% | 29.03 | 431 | [open](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/03-gemma-4-31b/gemma-4-31b-qat_karpathy_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| gemma-4-31b-qat_bare_r1 | google/gemma-4-31b-qat | Q4_0 | 65536 | K q8_0 / V q8_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| gemma-4-31b-qat_bare_r2 | google/gemma-4-31b-qat | Q4_0 | 65536 | K q8_0 / V q8_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| gemma-4-31b-qat_bare_r3 | google/gemma-4-31b-qat | Q4_0 | 65536 | K q8_0 / V q8_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| gemma-4-31b-qat_karpathy_r1 | google/gemma-4-31b-qat | Q4_0 | 65536 | K q8_0 / V q8_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| gemma-4-31b-qat_karpathy_r2 | google/gemma-4-31b-qat | Q4_0 | 65536 | K q8_0 / V q8_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| gemma-4-31b-qat_karpathy_r3 | google/gemma-4-31b-qat | Q4_0 | 65536 | K q8_0 / V q8_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
