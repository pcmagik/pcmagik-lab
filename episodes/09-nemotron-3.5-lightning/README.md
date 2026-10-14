# Nemotron 3.5 Lightning broke 1 page in 6. Can a rules file prevent that?

Same model, same prompt, same rig. 3 runs with nothing added, 3 with one Karpathy rules file. The model was reloaded before every run; every number comes from the run logs. The ranges overlap (25–34 effects without the rules, 23–53 with them), so on this model the rules changed nothing measurable. What did change: 1 of 6 runs never produced a complete page. Full cohort measurements, representative pages and prompts are available on the episode page. Harness: pi 0.85.1. Reasoning effort actually used by the model: on. Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

[Watch on YouTube](https://www.youtube.com/shorts/90bUpSN-zUE)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1 | nvidia-nemotron-3.5-lightning-30b-a3b | bare | pi | 1 min 32 s | 6,772 | 16.49% | 73.48 | 509 | [open](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2 | nvidia-nemotron-3.5-lightning-30b-a3b | bare | pi | 1 min 38 s | 7,313 | 7.27% | 74.98 | 568 | [open](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3 | nvidia-nemotron-3.5-lightning-30b-a3b | bare | pi | 2 min 20 s | 9,808 | 19.07% | 70.21 | 456 | [open](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r1 | nvidia-nemotron-3.5-lightning-30b-a3b | karpathy | pi | 1 min 30 s | 6,259 | 12.06% | 69.81 | 600 | [open](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r1/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r2 | nvidia-nemotron-3.5-lightning-30b-a3b | karpathy | pi | 1 min 23 s | 5,703 | 15.48% | 68.65 | 425 | [open](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r2/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r3 | nvidia-nemotron-3.5-lightning-30b-a3b | karpathy | pi | 5 min 15 s | 22,560 | 10.73% | 71.56 | 798 | [open](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/09-nemotron-3.5-lightning/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r1 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r2 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r3 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
