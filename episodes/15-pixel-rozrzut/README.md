# Same model, same prompt: 29, 29 and 9 out of 29

Qwen3.6 27B built the same pixel art editor 3 times: 29, 29 and 9 out of 29. The 9/29 run looks finished, but a JavaScript error on load means nothing draws. Without rules, 7 of the 12 models swing by 8 points or more between runs; in 6 of those 7 the lowest run is a page where nothing can be drawn. Task: Pixel_Art_Editor from Prompt Vault, graded by a script with 29 checks from the prompt. Harness: Pi. LM Studio defaults, no fixed seed; the model was reloaded before every run. Full cohort measurements, representative pages and prompts are available on the episode page.

[Watch on YouTube](https://www.youtube.com/shorts/NFQZRo-lQnA)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| qwen3.6-27b_bare_r1 | qwen/qwen3.6-27b | bare | pi | 3 min 41 s | 8,254 | 3.04% | 37.32 | 950 | [open](https://lab.pcmagik.pl/episodes/15-pixel-rozrzut/qwen3.6-27b_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/15-pixel-rozrzut/qwen3.6-27b_bare_r1/screenshot-1920.png) |
| qwen3.6-27b_bare_r2 | qwen/qwen3.6-27b | bare | pi | 3 min 08 s | 6,850 | 3.28% | 36.46 | 706 | [open](https://lab.pcmagik.pl/episodes/15-pixel-rozrzut/qwen3.6-27b_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/15-pixel-rozrzut/qwen3.6-27b_bare_r2/screenshot-1920.png) |
| qwen3.6-27b_bare_r3 | qwen/qwen3.6-27b | bare | pi | 3 min 25 s | 7,576 | 5.33% | 36.98 | 763 | [open](https://lab.pcmagik.pl/episodes/15-pixel-rozrzut/qwen3.6-27b_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/15-pixel-rozrzut/qwen3.6-27b_bare_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| qwen3.6-27b_bare_r1 | qwen/qwen3.6-27b | not recorded | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| qwen3.6-27b_bare_r2 | qwen/qwen3.6-27b | not recorded | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| qwen3.6-27b_bare_r3 | qwen/qwen3.6-27b | not recorded | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: not recorded

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
