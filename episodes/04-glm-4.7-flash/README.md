# GLM 4.7 Flash builds a full web page in under 2 minutes. Do rules slow it down?

Same model, same prompt, same rig. 3 runs with nothing added, 3 with one Karpathy rules file. The model was reloaded before every run; every number comes from the run logs. The ranges overlap (54–73 effects without the rules, 56–73 with them), so on this model the rules changed nothing measurable. Full cohort measurements, representative pages and prompts are available on the episode page. Harness: pi 0.85.1. Reasoning effort actually used by the model: on. Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

[Watch on YouTube](https://www.youtube.com/shorts/l_IVcUg-V2E)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| glm-4.7-flash_bare_r1 | zai-org/glm-4.7-flash | bare | pi | 1 min 39 s | 9,511 | 5.55% | 96.14 | 987 | [open](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_bare_r1/screenshot-1920.png) |
| glm-4.7-flash_bare_r2 | zai-org/glm-4.7-flash | bare | pi | 1 min 24 s | 8,538 | 6.04% | 102.0 | 775 | [open](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_bare_r2/screenshot-1920.png) |
| glm-4.7-flash_bare_r3 | zai-org/glm-4.7-flash | bare | pi | 1 min 27 s | 8,404 | 5.69% | 97.13 | 869 | [open](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_bare_r3/screenshot-1920.png) |
| glm-4.7-flash_karpathy_r1 | zai-org/glm-4.7-flash | karpathy | pi | 1 min 34 s | 9,152 | 5.67% | 97.32 | 876 | [open](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_karpathy_r1/screenshot-1920.png) |
| glm-4.7-flash_karpathy_r2 | zai-org/glm-4.7-flash | karpathy | pi | 1 min 19 s | 7,826 | 8.47% | 99.06 | 762 | [open](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_karpathy_r2/screenshot-1920.png) |
| glm-4.7-flash_karpathy_r3 | zai-org/glm-4.7-flash | karpathy | pi | 1 min 44 s | 9,934 | 5.28% | 95.35 | 1,080 | [open](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/04-glm-4.7-flash/glm-4.7-flash_karpathy_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| glm-4.7-flash_bare_r1 | zai-org/glm-4.7-flash | Q4_K_M | 202752 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| glm-4.7-flash_bare_r2 | zai-org/glm-4.7-flash | Q4_K_M | 202752 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| glm-4.7-flash_bare_r3 | zai-org/glm-4.7-flash | Q4_K_M | 202752 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| glm-4.7-flash_karpathy_r1 | zai-org/glm-4.7-flash | Q4_K_M | 202752 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| glm-4.7-flash_karpathy_r2 | zai-org/glm-4.7-flash | Q4_K_M | 202752 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| glm-4.7-flash_karpathy_r3 | zai-org/glm-4.7-flash | Q4_K_M | 202752 | K q8_0 / V q8_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
