# Ornith 1.0 35B writes 945 lines for one web page. Do rules trim it?

Same model, same prompt, same rig. 3 runs with nothing added, 3 with one Karpathy rules file. The model was reloaded before every run; every number comes from the run logs. The ranges overlap (65–91 effects without the rules, 63–98 with them), so on this model the rules changed nothing measurable. Full cohort measurements, representative pages and prompts are available on the episode page. Harness: pi 0.85.1. Reasoning effort actually used by the model: on. Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

[Watch on YouTube](https://www.youtube.com/shorts/JZv6WS69qyg)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| ornith-1.0-35b_bare_r1 | ornith-1.0-35b | bare | pi | 4 min 19 s | 12,464 | 2.17% | 48.12 | 538 | [open](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_bare_r1/screenshot-1920.png) |
| ornith-1.0-35b_bare_r2 | ornith-1.0-35b | bare | pi | 4 min 10 s | 12,177 | 5.86% | 48.64 | 945 | [open](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_bare_r2/screenshot-1920.png) |
| ornith-1.0-35b_bare_r3 | ornith-1.0-35b | bare | pi | 3 min 09 s | 9,958 | 6.36% | 52.73 | 864 | [open](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_bare_r3/screenshot-1920.png) |
| ornith-1.0-35b_karpathy_r1 | ornith-1.0-35b | karpathy | pi | 4 min 27 s | 12,266 | 3.51% | 45.95 | 835 | [open](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_karpathy_r1/screenshot-1920.png) |
| ornith-1.0-35b_karpathy_r2 | ornith-1.0-35b | karpathy | pi | 4 min 10 s | 12,064 | 2.54% | 48.2 | 709 | [open](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_karpathy_r2/screenshot-1920.png) |
| ornith-1.0-35b_karpathy_r3 | ornith-1.0-35b | karpathy | pi | 3 min 59 s | 11,528 | 3.89% | 48.16 | 493 | [open](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/11-ornith-1.0-35b/ornith-1.0-35b_karpathy_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| ornith-1.0-35b_bare_r1 | ornith-1.0-35b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| ornith-1.0-35b_bare_r2 | ornith-1.0-35b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| ornith-1.0-35b_bare_r3 | ornith-1.0-35b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| ornith-1.0-35b_karpathy_r1 | ornith-1.0-35b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| ornith-1.0-35b_karpathy_r2 | ornith-1.0-35b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| ornith-1.0-35b_karpathy_r3 | ornith-1.0-35b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
