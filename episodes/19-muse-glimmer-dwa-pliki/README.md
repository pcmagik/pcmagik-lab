# Same model, two files: Meta vs Unsloth Muse Glimmer

One model, Muse Glimmer, as two GGUF files: Meta Q4_K_M and Unsloth Q4_K_XL. Same pixel art editor prompt, 3 runs each. Without rules, the Unsloth file generates more tokens per second in every run (40.3–41.0 vs 38.8–39.1 tok/s) and still finishes later in every run (220–352 s vs 127–185 s), because it thinks longer (4 727–10 104 vs 1 670–3 185 thinking tokens). Scores out of 29 overlap: no rules 28 in all 3 runs vs 24–29, with rules 28–29 vs 28–29. With rules the time overlaps. Task: Pixel_Art_Editor from Prompt Vault, graded by a script with 29 checks. Harness: Pi. LM Studio defaults, no fixed seed; the model was reloaded before every run. Full cohort measurements, representative pages and prompts are available on the episode page.

[Watch on YouTube](https://www.youtube.com/shorts/dKNoML5N7fA)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| muse-glimmer_bare_r1 | meta/muse-glimmer | bare | pi | 2 min 07 s | 4,928 | 33.89% | 38.8 | 337 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_bare_r1/screenshot-1920.png) |
| muse-glimmer_bare_r2 | meta/muse-glimmer | bare | pi | 3 min 05 s | 7,216 | 44.14% | 39.08 | 446 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_bare_r2/screenshot-1920.png) |
| muse-glimmer_bare_r3 | meta/muse-glimmer | bare | pi | 2 min 55 s | 6,863 | 35.25% | 39.13 | 483 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_bare_r3/screenshot-1920.png) |
| muse-glimmer_karpathy_r1 | meta/muse-glimmer | karpathy | pi | 2 min 58 s | 6,943 | 45.99% | 39.08 | 416 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_karpathy_r1/screenshot-1920.png) |
| muse-glimmer_karpathy_r2 | meta/muse-glimmer | karpathy | pi | 3 min 51 s | 9,086 | 58.02% | 39.31 | 392 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_karpathy_r2/screenshot-1920.png) |
| muse-glimmer_karpathy_r3 | meta/muse-glimmer | karpathy | pi | 2 min 01 s | 4,720 | 17.97% | 38.9 | 417 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer_karpathy_r3/screenshot-1920.png) |
| muse-glimmer-30b_bare_r1 | unsloth/muse-glimmer-30b | bare | pi | 3 min 40 s | 8,918 | 53.01% | 40.52 | 475 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_bare_r1/screenshot-1920.png) |
| muse-glimmer-30b_bare_r2 | unsloth/muse-glimmer-30b | bare | pi | 4 min 30 s | 10,884 | 63.11% | 40.31 | 425 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_bare_r2/screenshot-1920.png) |
| muse-glimmer-30b_bare_r3 | unsloth/muse-glimmer-30b | bare | pi | 5 min 52 s | 14,423 | 70.05% | 40.97 | 447 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_bare_r3/screenshot-1920.png) |
| muse-glimmer-30b_karpathy_r1 | unsloth/muse-glimmer-30b | karpathy | pi | 3 min 46 s | 9,258 | 57.91% | 40.96 | 389 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_karpathy_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_karpathy_r1/screenshot-1920.png) |
| muse-glimmer-30b_karpathy_r2 | unsloth/muse-glimmer-30b | karpathy | pi | 4 min 59 s | 12,096 | 68.79% | 40.42 | 378 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_karpathy_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_karpathy_r2/screenshot-1920.png) |
| muse-glimmer-30b_karpathy_r3 | unsloth/muse-glimmer-30b | karpathy | pi | 3 min 51 s | 9,370 | 55.29% | 40.52 | 492 | [open](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_karpathy_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/19-muse-glimmer-dwa-pliki/muse-glimmer-30b_karpathy_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| muse-glimmer_bare_r1 | meta/muse-glimmer | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer_bare_r2 | meta/muse-glimmer | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer_bare_r3 | meta/muse-glimmer | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer_karpathy_r1 | meta/muse-glimmer | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| muse-glimmer_karpathy_r2 | meta/muse-glimmer | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| muse-glimmer_karpathy_r3 | meta/muse-glimmer | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| muse-glimmer-30b_bare_r1 | unsloth/muse-glimmer-30b | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer-30b_bare_r2 | unsloth/muse-glimmer-30b | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer-30b_bare_r3 | unsloth/muse-glimmer-30b | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| muse-glimmer-30b_karpathy_r1 | unsloth/muse-glimmer-30b | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| muse-glimmer-30b_karpathy_r2 | unsloth/muse-glimmer-30b | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |
| muse-glimmer-30b_karpathy_r3 | unsloth/muse-glimmer-30b | not recorded | 131072 | K f16 / V f16 (LM Studio default) | 65536 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | [rules/karpathy/AGENTS.md](rules/karpathy/AGENTS.md) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: not recorded

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
