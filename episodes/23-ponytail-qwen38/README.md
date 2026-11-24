# Ponytail on Qwen3.8 27B: 6.6k–9.6k output tokens, no rules 8.1k–12.6k

Same model (Qwen3.8 27B), same task (Pixel_Art_Editor, 29 checks, grader 5.1), Pi, LM Studio, effort medium, 3 runs per variant, model reloaded before every run. Variants: BARE (no rules file), PONYTAIL (Ponytail v5.3.2, AGENTS.md as system prompt text) and FOUR RULES (four lines: DRY, KISS, YAGNI, SINE). Output tokens: BARE 8.1k–12.6k, PONYTAIL 6.6k–9.6k, FOUR RULES 9.0k–11.0k — the ranges overlap, so neither file got past the run-to-run spread. Lines of code: PONYTAIL 494–556 against BARE 605–874 in 6 runs (a shorter file, not less written). Score of 29: BARE 28–29, PONYTAIL 25–29, FOUR RULES 15–29; one FOUR RULES page opened with a blank canvas (script error at start). 3 runs each: an observation on one model and one task, not a rule.

[Watch on YouTube](https://www.youtube.com/shorts/xCGpzBTdZgY)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| bare_r1 | qwen/qwen3.8-27b | bare | pi | 2 min 32 s | 8,137 | 8.86% | 53.5 | 715 | [open](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/bare_r1/screenshot-1920.png) |
| bare_r2 | qwen/qwen3.8-27b | bare | pi | 3 min 38 s | 11,158 | 16.3% | 51.22 | 703 | [open](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/bare_r2/screenshot-1920.png) |
| bare_r3 | qwen/qwen3.8-27b | bare | pi | 3 min 57 s | 12,622 | 21.03% | 53.15 | 661 | [open](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/bare_r3/screenshot-1920.png) |
| ponytail_r1 | qwen/qwen3.8-27b | ponytail | pi | 3 min 12 s | 9,561 | 17.69% | 49.69 | 553 | [open](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/ponytail_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/ponytail_r1/screenshot-1920.png) |
| ponytail_r2 | qwen/qwen3.8-27b | ponytail | pi | 2 min 06 s | 6,648 | 17.34% | 52.63 | 556 | [open](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/ponytail_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/ponytail_r2/screenshot-1920.png) |
| ponytail_r3 | qwen/qwen3.8-27b | ponytail | pi | 2 min 32 s | 7,936 | 31.28% | 52.04 | 494 | [open](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/ponytail_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/ponytail_r3/screenshot-1920.png) |
| four-rules_r1 | qwen/qwen3.8-27b | zasady | pi | 3 min 23 s | 10,181 | 18.13% | 50.2 | 645 | [open](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/four-rules_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/four-rules_r1/screenshot-1920.png) |
| four-rules_r2 | qwen/qwen3.8-27b | zasady | pi | 2 min 48 s | 8,973 | 28.17% | 53.57 | 624 | [open](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/four-rules_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/four-rules_r2/screenshot-1920.png) |
| four-rules_r3 | qwen/qwen3.8-27b | zasady | pi | 3 min 29 s | 10,999 | 27.95% | 52.66 | 655 | [open](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/four-rules_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/23-ponytail-qwen38/four-rules_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| bare_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| bare_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| bare_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| ponytail_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| ponytail_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| ponytail_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| four-rules_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| four-rules_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| four-rules_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |

Sources: engine: metrics.json; kv_cache: metrics.json; quantization: metrics.json

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
