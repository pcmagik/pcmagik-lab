# Nemotron 3 Nano spends 76% of its output thinking, and 2 of 6 pages broke

Same model, same prompt, same rig. 3 runs with nothing added, 3 with one Karpathy rules file. The model was reloaded before every run; every number comes from the run logs. The ranges overlap (5–8 effects without the rules, 6–12 with them), so on this model the rules changed nothing measurable. What did change: 2 of 6 runs never produced a complete page. Full cohort measurements, representative pages and prompts are available on the episode page. Harness: pi 0.85.1. Reasoning effort actually used by the model: on. Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

[Watch on YouTube](https://www.youtube.com/shorts/i1rk2hLmOXU)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| nemotron-3-nano_bare_r1 | nvidia/nemotron-3-nano | bare | pi | 46 s | 4,209 | 76.24% | 91.64 | 114 | [open](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_bare_r1/screenshot-1920.png) |
| nemotron-3-nano_bare_r2 | nvidia/nemotron-3-nano | bare | pi | 59 s | 5,851 | 77.49% | 98.91 | 162 | [open](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_bare_r2/screenshot-1920.png) |
| nemotron-3-nano_bare_r3 | nvidia/nemotron-3-nano | bare | pi | 37 s | 3,672 | 53.24% | 99.43 | 212 | [open](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_bare_r3/screenshot-1920.png) |
| nemotron-3-nano_karpathy_r1 | nvidia/nemotron-3-nano | karpathy | pi | 36 s | 4,032 | 68.9% | 111.19 | 161 | [open](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_karpathy_r1/screenshot-1920.png) |
| nemotron-3-nano_karpathy_r2 | nvidia/nemotron-3-nano | karpathy | pi | 47 s | 4,407 | 57.43% | 93.03 | 188 | [open](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_karpathy_r2/screenshot-1920.png) |
| nemotron-3-nano_karpathy_r3 | nvidia/nemotron-3-nano | karpathy | pi | 42 s | 4,057 | 75.6% | 96.27 | 122 | [open](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/05-nemotron-3-nano/nemotron-3-nano_karpathy_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| nemotron-3-nano_bare_r1 | nvidia/nemotron-3-nano | Q3_K_L | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nemotron-3-nano_bare_r2 | nvidia/nemotron-3-nano | Q3_K_L | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nemotron-3-nano_bare_r3 | nvidia/nemotron-3-nano | Q3_K_L | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nemotron-3-nano_karpathy_r1 | nvidia/nemotron-3-nano | Q3_K_L | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| nemotron-3-nano_karpathy_r2 | nvidia/nemotron-3-nano | Q3_K_L | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| nemotron-3-nano_karpathy_r3 | nvidia/nemotron-3-nano | Q3_K_L | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
