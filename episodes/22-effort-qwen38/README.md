# Effort levels on Qwen3.8 27B: none 5–6 min, xhigh 24–27 min

Same model (Qwen3.8 27B), same prompt (easy, a landing page), Pi, LM Studio; thinking level none, low, medium and xhigh, 3 runs each (8 at medium), level confirmed where reported in the LM Studio server log; for none, the log omits the field. Complete page in 20 of 20 runs. Minutes per run: none 5–6, low 15–27, medium 5–7, xhigh 24–27. Thinking tokens: none 0, low 24.9k–38.3k, medium 293–1,271, xhigh 25.7k–37.2k. Effect counts overlap in 6 of 6 pairs of levels. The task is open, so pages differ in scope: time is an observation, not the cost of the same work.

[Watch on YouTube](https://www.youtube.com/shorts/uqdMHxV4fTA)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| effort-none_r1 | qwen/qwen3.8-27b | bare | pi | 4 min 55 s | 19,253 | 0.0% | 65.3 | 1,237 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-none_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-none_r1/screenshot-1920.png) |
| effort-none_r2 | qwen/qwen3.8-27b | bare | pi | 4 min 58 s | 19,686 | 0.0% | 65.98 | 1,111 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-none_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-none_r2/screenshot-1920.png) |
| effort-none_r3 | qwen/qwen3.8-27b | bare | pi | 6 min 02 s | 22,951 | 0.0% | 63.48 | 1,246 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-none_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-none_r3/screenshot-1920.png) |
| effort-low_r1 | qwen/qwen3.8-27b | bare | pi | 15 min 24 s | 43,746 | 56.91% | 47.35 | 732 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-low_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-low_r1/screenshot-1920.png) |
| effort-low_r2 | qwen/qwen3.8-27b | bare | pi | 26 min 50 s | 62,905 | 60.86% | 39.07 | 798 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-low_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-low_r2/screenshot-1920.png) |
| effort-low_r3 | qwen/qwen3.8-27b | bare | pi | 20 min 59 s | 49,557 | 50.35% | 39.37 | 1,036 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-low_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-low_r3/screenshot-1920.png) |
| effort-medium_r1 | qwen/qwen3.8-27b | bare | pi | 7 min 00 s | 22,049 | 5.76% | 52.5 | 1,084 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r1/screenshot-1920.png) |
| effort-medium_r2 | qwen/qwen3.8-27b | bare | pi | 5 min 49 s | 19,321 | 1.73% | 55.33 | 1,059 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r2/screenshot-1920.png) |
| effort-medium_r3 | qwen/qwen3.8-27b | bare | pi | 5 min 38 s | 19,052 | 3.21% | 56.3 | 1,033 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r3/screenshot-1920.png) |
| effort-medium_r4 | qwen/qwen3.8-27b | bare | pi | 5 min 38 s | 18,858 | 1.55% | 55.83 | 1,122 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r4/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r4/screenshot-1920.png) |
| effort-medium_r5 | qwen/qwen3.8-27b | bare | pi | 6 min 04 s | 20,397 | 2.28% | 56.03 | 978 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r5/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r5/screenshot-1920.png) |
| effort-medium_r6 | qwen/qwen3.8-27b | bare | pi | 5 min 58 s | 18,311 | 5.99% | 51.12 | 1,136 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r6/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r6/screenshot-1920.png) |
| effort-medium_r7 | qwen/qwen3.8-27b | bare | pi | 4 min 36 s | 15,519 | 2.41% | 56.25 | 732 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r7/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r7/screenshot-1920.png) |
| effort-medium_r8 | qwen/qwen3.8-27b | bare | pi | 7 min 17 s | 23,002 | 3.13% | 52.63 | 1,493 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r8/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-medium_r8/screenshot-1920.png) |
| effort-xhigh_r1 | qwen/qwen3.8-27b | bare | pi | 27 min 12 s | 64,074 | 56.4% | 39.26 | 961 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-xhigh_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-xhigh_r1/screenshot-1920.png) |
| effort-xhigh_r2 | qwen/qwen3.8-27b | bare | pi | 23 min 59 s | 57,488 | 44.63% | 39.96 | 1,547 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-xhigh_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-xhigh_r2/screenshot-1920.png) |
| effort-xhigh_r3 | qwen/qwen3.8-27b | bare | pi | 26 min 21 s | 62,080 | 59.96% | 39.26 | 940 | [open](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-xhigh_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/22-effort-qwen38/effort-xhigh_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| effort-none_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | none | none (bare) |
| effort-none_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | none | none (bare) |
| effort-none_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | none | none (bare) |
| effort-low_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | low | none (bare) |
| effort-low_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | low | none (bare) |
| effort-low_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | low | none (bare) |
| effort-medium_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| effort-medium_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| effort-medium_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| effort-medium_r4 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| effort-medium_r5 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| effort-medium_r6 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| effort-medium_r7 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| effort-medium_r8 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| effort-xhigh_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | xhigh | none (bare) |
| effort-xhigh_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | xhigh | none (bare) |
| effort-xhigh_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | xhigh | none (bare) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; engine: metrics.json; kv_cache: metrics.json; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: LM Studio server log, model list at 2026-09-19T01:32:06 and 2026-09-20T13:20:21 (rig time); not logged by this run; quantization: metrics.json

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
