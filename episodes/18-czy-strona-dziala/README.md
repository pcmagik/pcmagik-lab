# Local AI built 66 web pages. How many actually show up?

11 local models built the same landing page, three runs each, with and without a rules file: 66 pages. Two checks: a script that reads the HTML file, and a look at the full-page screenshot. 2 pages showed no content (both from Nemotron models, no rules); the file check caught 1 of 2, and flagged 2 pages that display fine. 9 of 11 models showed content on every page, and without the empty pages no comparison between the variants changes. Before you compare models, open the page. Task: easy.txt. Harness: Pi. LM Studio defaults, no fixed seed; the model was reloaded before every run. Full cohort measurements, representative pages and prompts are available on the episode page.

[Watch on YouTube](https://www.youtube.com/shorts/VR_8P5QqOBs)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| nemotron-3-nano_bare_r1 | nvidia/nemotron-3-nano | bare | pi | 46 s | 4,209 | 76.24% | 91.64 | 114 | [open](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nemotron-3-nano_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nemotron-3-nano_bare_r1/screenshot-1920.png) |
| nemotron-3-nano_bare_r2 | nvidia/nemotron-3-nano | bare | pi | 59 s | 5,851 | 77.49% | 98.91 | 162 | [open](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nemotron-3-nano_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nemotron-3-nano_bare_r2/screenshot-1920.png) |
| nemotron-3-nano_bare_r3 | nvidia/nemotron-3-nano | bare | pi | 37 s | 3,672 | 53.24% | 99.43 | 212 | [open](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nemotron-3-nano_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nemotron-3-nano_bare_r3/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r1 | nvidia-nemotron-3.5-lightning-30b-a3b | karpathy | pi | 1 min 30 s | 6,259 | 12.06% | 69.81 | 600 | [open](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r1/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r2 | nvidia-nemotron-3.5-lightning-30b-a3b | karpathy | pi | 1 min 23 s | 5,703 | 15.48% | 68.65 | 425 | [open](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r2/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r3 | nvidia-nemotron-3.5-lightning-30b-a3b | karpathy | pi | 5 min 15 s | 22,560 | 10.73% | 71.56 | 798 | [open](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r3/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1 | nvidia-nemotron-3.5-lightning-30b-a3b | bare | pi | 1 min 32 s | 6,772 | 16.49% | 73.48 | 509 | [open](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2 | nvidia-nemotron-3.5-lightning-30b-a3b | bare | pi | 1 min 38 s | 7,313 | 7.27% | 74.98 | 568 | [open](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3 | nvidia-nemotron-3.5-lightning-30b-a3b | bare | pi | 2 min 20 s | 9,808 | 19.07% | 70.21 | 456 | [open](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/18-czy-strona-dziala/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| nemotron-3-nano_bare_r1 | nvidia/nemotron-3-nano | Q3_K_L | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nemotron-3-nano_bare_r2 | nvidia/nemotron-3-nano | Q3_K_L | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nemotron-3-nano_bare_r3 | nvidia/nemotron-3-nano | Q3_K_L | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r1 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r2 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| nvidia-nemotron-3.5-lightning-30b-a3b_karpathy_r3 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3 | nvidia-nemotron-3.5-lightning-30b-a3b | Q3_K_XL | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
