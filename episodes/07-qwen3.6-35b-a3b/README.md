# Qwen 3.6 35B A3B puts 70+ effects on every page. Do rules tone it down?

Same model, same prompt, same rig. 3 runs with nothing added, 3 with one Karpathy rules file. The model was reloaded before every run; every number comes from the run logs. The ranges overlap (70–92 effects without the rules, 77–87 with them), so on this model the rules changed nothing measurable. Full cohort measurements, representative pages and prompts are available on the episode page. Harness: pi 0.85.1. Reasoning effort actually used by the model: on. Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

[Watch on YouTube](https://www.youtube.com/shorts/LI1199MruQ4)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| qwen3.6-35b-a3b_bare_r1 | qwen/qwen3.6-35b-a3b | bare | pi | 4 min 30 s | 11,710 | 2.41% | 43.43 | 624 | [open](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_bare_r1/screenshot-1920.png) |
| qwen3.6-35b-a3b_bare_r2 | qwen/qwen3.6-35b-a3b | bare | pi | 4 min 47 s | 12,607 | 3.77% | 43.92 | 601 | [open](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_bare_r2/screenshot-1920.png) |
| qwen3.6-35b-a3b_bare_r3 | qwen/qwen3.6-35b-a3b | bare | pi | 4 min 39 s | 12,327 | 3.75% | 44.21 | 579 | [open](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_bare_r3/screenshot-1920.png) |
| qwen3.6-35b-a3b_karpathy_r1 | qwen/qwen3.6-35b-a3b | karpathy | pi | 4 min 37 s | 12,056 | 2.17% | 43.56 | 615 | [open](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_karpathy_r1/screenshot-1920.png) |
| qwen3.6-35b-a3b_karpathy_r2 | qwen/qwen3.6-35b-a3b | karpathy | pi | 4 min 39 s | 12,198 | 2.82% | 43.67 | 561 | [open](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_karpathy_r2/screenshot-1920.png) |
| qwen3.6-35b-a3b_karpathy_r3 | qwen/qwen3.6-35b-a3b | karpathy | pi | 4 min 23 s | 11,588 | 4.07% | 44.09 | 579 | [open](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/07-qwen3.6-35b-a3b/qwen3.6-35b-a3b_karpathy_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| qwen3.6-35b-a3b_bare_r1 | qwen/qwen3.6-35b-a3b | Q4_K_M | 262144 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| qwen3.6-35b-a3b_bare_r2 | qwen/qwen3.6-35b-a3b | Q4_K_M | 262144 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| qwen3.6-35b-a3b_bare_r3 | qwen/qwen3.6-35b-a3b | Q4_K_M | 262144 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| qwen3.6-35b-a3b_karpathy_r1 | qwen/qwen3.6-35b-a3b | Q4_K_M | 262144 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| qwen3.6-35b-a3b_karpathy_r2 | qwen/qwen3.6-35b-a3b | Q4_K_M | 262144 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| qwen3.6-35b-a3b_karpathy_r3 | qwen/qwen3.6-35b-a3b | Q4_K_M | 262144 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
