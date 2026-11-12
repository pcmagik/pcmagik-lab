# 16 GB VRAM for Qwen3.8 27B? At 64k context it used 20.6–23.3 GB

Same model (Qwen3.8 27B Q4_K_M), same 64k window, same task (Pixel_Art_Editor), three K/V cache types, 3 runs each, model reloaded before every run, RTX 3090 24 GB. VRAM used after loading, desktop subtracted: f16 23.3 GB, q8_0 21.6 GB, q4_0 20.6 GB — apart in every run. Past 16k of context f16 generated faster than q8_0 in every run (56.1–57.6 vs 49.8–54.3 tok/s, MTP on); at the start of a run the types overlap. Run time is not compared: the output limit cut thinking in 5 of 9 runs. Card memory cap (gpuStrictVramCap) was on in these runs.

[Watch on YouTube](https://www.youtube.com/shorts/jcQGUPrtWcA)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| kv-f16_r1 | qwen/qwen3.8-27b | bare | pi | 19 min 15 s | 56,428 | 65.0% | 48.87 | 813 | [open](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-f16_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-f16_r1/screenshot-1920.png) |
| kv-f16_r2 | qwen/qwen3.8-27b | bare | pi | 8 min 42 s | 31,000 | 61.04% | 59.39 | 821 | [open](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-f16_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-f16_r2/screenshot-1920.png) |
| kv-f16_r3 | qwen/qwen3.8-27b | bare | pi | 9 min 00 s | 32,811 | 99.73% | 60.78 | 0 | no page | — |
| kv-q8_0_r1 | qwen/qwen3.8-27b | bare | pi | 9 min 44 s | 31,781 | 53.88% | 54.38 | 851 | [open](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q8_0_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q8_0_r1/screenshot-1920.png) |
| kv-q8_0_r2 | qwen/qwen3.8-27b | bare | pi | 31 min 39 s | 79,906 | 64.28% | 42.09 | 1,007 | [open](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q8_0_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q8_0_r2/screenshot-1920.png) |
| kv-q8_0_r3 | qwen/qwen3.8-27b | bare | pi | 29 min 29 s | 69,519 | 67.18% | 39.3 | 791 | [open](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q8_0_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q8_0_r3/screenshot-1920.png) |
| kv-q4_0_r1 | qwen/qwen3.8-27b | bare | pi | 23 min 00 s | 64,575 | 63.93% | 46.78 | 851 | [open](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q4_0_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q4_0_r1/screenshot-1920.png) |
| kv-q4_0_r2 | qwen/qwen3.8-27b | bare | pi | 23 min 24 s | 66,849 | 55.45% | 47.61 | 919 | [open](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q4_0_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q4_0_r2/screenshot-1920.png) |
| kv-q4_0_r3 | qwen/qwen3.8-27b | bare | pi | 21 min 44 s | 59,161 | 64.78% | 45.37 | 797 | [open](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q4_0_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/21-okno-kv-qwen38/kv-q4_0_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| kv-f16_r1 | qwen/qwen3.8-27b | Q4_K_M | 65536 | K f16 / V f16 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | harness default | none (bare) |
| kv-f16_r2 | qwen/qwen3.8-27b | Q4_K_M | 65536 | K f16 / V f16 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | harness default | none (bare) |
| kv-f16_r3 | qwen/qwen3.8-27b | Q4_K_M | 65536 | K f16 / V f16 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | harness default | none (bare) |
| kv-q8_0_r1 | qwen/qwen3.8-27b | Q4_K_M | 65536 | K q8_0 / V q8_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | harness default | none (bare) |
| kv-q8_0_r2 | qwen/qwen3.8-27b | Q4_K_M | 65536 | K q8_0 / V q8_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | harness default | none (bare) |
| kv-q8_0_r3 | qwen/qwen3.8-27b | Q4_K_M | 65536 | K q8_0 / V q8_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | harness default | none (bare) |
| kv-q4_0_r1 | qwen/qwen3.8-27b | Q4_K_M | 65536 | K q4_0 / V q4_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | harness default | none (bare) |
| kv-q4_0_r2 | qwen/qwen3.8-27b | Q4_K_M | 65536 | K q4_0 / V q4_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | harness default | none (bare) |
| kv-q4_0_r3 | qwen/qwen3.8-27b | Q4_K_M | 65536 | K q4_0 / V q4_0 | 32768 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | harness default | none (bare) |

Sources: engine: metrics.json; kv_cache: metrics.json; quantization: metrics.json

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
