# context-mode on Qwen3.8 27B: its own tools used in 1 of 3 runs

Same model (Qwen3.8 27B), same task (an HTML report from 144 JSON files of our own measurements, 22 checks, raport-check), Pi, LM Studio, effort medium, 3 runs per variant, model reloaded before every run. Variants: BARE (Pi without extensions) and CONTEXT-MODE (context-mode 1.0.169). Input (prompt tokens, all requests of a run): BARE 35.6k–168.3k, CONTEXT-MODE 113.3k–397.0k — the ranges overlap. No saving: every CONTEXT-MODE request carried 7.0k more prompt tokens; the first one started at 8.6k against 1.6k (15 tools instead of 4). With one run each, run 1 would have shown the opposite (CONTEXT-MODE 113.3k, BARE 168.3k). The model used context-mode's own tools in 1 of 3 runs. In every run it read the data with one script; the largest tool output was 7,525 characters, so there was little to trim. Score of 22: BARE 19, CONTEXT-MODE 21–22; the values were right on all 6 pages, the BARE misses were the layout of the answer. 3 runs each: an observation on one model and one task, not a rule.

[Watch on YouTube](https://www.youtube.com/shorts/XT8H1uD5-eE)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| bare_r1 | qwen/qwen3.8-27b | bare | pi | 3 min 51 s | 10,472 | 25.85% | 45.24 | 173 | [open](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/bare_r1/screenshot-1920.png) |
| bare_r2 | qwen/qwen3.8-27b | bare | pi | 1 min 52 s | 5,873 | 6.79% | 52.55 | 256 | [open](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/bare_r2/screenshot-1920.png) |
| bare_r3 | qwen/qwen3.8-27b | bare | pi | 1 min 35 s | 5,476 | 7.58% | 57.81 | 284 | [open](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/bare_r3/screenshot-1920.png) |
| context-mode_r1 | qwen/qwen3.8-27b | contextmode | pi | 3 min 06 s | 7,883 | 24.75% | 42.45 | 192 | [open](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/context-mode_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/context-mode_r1/screenshot-1920.png) |
| context-mode_r2 | qwen/qwen3.8-27b | contextmode | pi | 7 min 59 s | 19,990 | 30.46% | 41.74 | 330 | [open](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/context-mode_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/context-mode_r2/screenshot-1920.png) |
| context-mode_r3 | qwen/qwen3.8-27b | contextmode | pi | 2 min 46 s | 7,195 | 12.3% | 43.33 | 171 | [open](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/context-mode_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/25-context-mode-qwen38/context-mode_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| bare_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| bare_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| bare_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| context-mode_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| context-mode_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| context-mode_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |

Sources: engine: metrics.json; kv_cache: metrics.json; quantization: metrics.json

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
