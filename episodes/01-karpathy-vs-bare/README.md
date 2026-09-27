# Karpathy skills on Qwen3.8 27B: what you gain, what you lose

On Qwen3.8 27B, one Karpathy rules file: no clear difference in time or tokens, 22% fewer visual effects, fewer in each of the 5 runs. Which page looks better? Tell me in the comments.

Same model, same prompt, same rig: 5 runs without the file, 5 with it (reasoning effort medium requested). The model was reloaded before each run; every number comes from the run logs. Harness: Pi 0.85.1. Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

[Watch on YouTube](https://www.youtube.com/shorts/5xvHtb7y0zY)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| qwen3.8-27b_bare_r1 | qwen/qwen3.8-27b | bare | pi | 7 min 00 s | 22,049 | 5.76% | 52.5 | 1,084 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_bare_r1/screenshot-1920.png) |
| qwen3.8-27b_bare_r2 | qwen/qwen3.8-27b | bare | pi | 5 min 49 s | 19,321 | 1.73% | 55.33 | 1,059 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_bare_r2/screenshot-1920.png) |
| qwen3.8-27b_bare_r3 | qwen/qwen3.8-27b | bare | pi | 5 min 38 s | 19,052 | 3.21% | 56.3 | 1,033 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_bare_r3/screenshot-1920.png) |
| qwen3.8-27b_bare_r4 | qwen/qwen3.8-27b | bare | pi | 5 min 38 s | 18,858 | 1.55% | 55.83 | 1,122 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_bare_r4/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_bare_r4/screenshot-1920.png) |
| qwen3.8-27b_bare_r5 | qwen/qwen3.8-27b | bare | pi | 6 min 04 s | 20,397 | 2.28% | 56.03 | 978 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_bare_r5/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_bare_r5/screenshot-1920.png) |
| qwen3.8-27b_karpathy_r1 | qwen/qwen3.8-27b | karpathy | pi | 4 min 08 s | 14,333 | 1.79% | 57.84 | 920 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_karpathy_r1/screenshot-1920.png) |
| qwen3.8-27b_karpathy_r2 | qwen/qwen3.8-27b | karpathy | pi | 7 min 59 s | 24,268 | 11.22% | 50.69 | 1,122 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_karpathy_r2/screenshot-1920.png) |
| qwen3.8-27b_karpathy_r3 | qwen/qwen3.8-27b | karpathy | pi | 5 min 06 s | 15,659 | 2.52% | 51.26 | 902 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_karpathy_r3/screenshot-1920.png) |
| qwen3.8-27b_karpathy_r4 | qwen/qwen3.8-27b | karpathy | pi | 7 min 08 s | 23,174 | 7.21% | 54.13 | 934 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_karpathy_r4/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_karpathy_r4/screenshot-1920.png) |
| qwen3.8-27b_karpathy_r5 | qwen/qwen3.8-27b | karpathy | pi | 4 min 40 s | 15,810 | 2.87% | 56.57 | 973 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_karpathy_r5/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/qwen3.8-27b_karpathy_r5/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| qwen3.8-27b_bare_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| qwen3.8-27b_bare_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| qwen3.8-27b_bare_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| qwen3.8-27b_bare_r4 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| qwen3.8-27b_bare_r5 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| qwen3.8-27b_karpathy_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| qwen3.8-27b_karpathy_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| qwen3.8-27b_karpathy_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| qwen3.8-27b_karpathy_r4 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| qwen3.8-27b_karpathy_r5 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
