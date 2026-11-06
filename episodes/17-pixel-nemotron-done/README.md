# Nemotron 3.5 Lightning said "Done." It overwrote its own work

In one of 72 pixel art editor runs, Nemotron 3.5 Lightning (no rules) ended with a last write that replaced its editor with one line of text starting with "Done." The file that was left scores 3 of 29. The deleted editor (651 lines, rebuilt from the run log) scores 5 of 29, all for static HTML and none for a working script: a JavaScript error on load stops the whole script, so not one pixel gets drawn. The other 71 runs left an HTML editor in the file, but in 13 of them nothing can be drawn, and in one more a click paints the wrong spot. Task: Pixel_Art_Editor from Prompt Vault, graded by a script with 29 checks from the prompt. Harness: Pi. LM Studio defaults, no fixed seed; the model was reloaded before every run. Full cohort measurements, representative pages and prompts are available on the episode page.

[Watch on YouTube](https://www.youtube.com/shorts/3qSZqhZ6HAU)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1 | nvidia-nemotron-3.5-lightning-30b-a3b | bare | pi | 12 min 59 s | 48,706 | 32.38% | 62.51 | 679 | [open](https://lab.pcmagik.pl/episodes/17-pixel-nemotron-done/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/17-pixel-nemotron-done/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2 | nvidia-nemotron-3.5-lightning-30b-a3b | bare | pi | 9 min 56 s | 36,322 | 25.27% | 60.92 | 638 | [open](https://lab.pcmagik.pl/episodes/17-pixel-nemotron-done/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/17-pixel-nemotron-done/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2/screenshot-1920.png) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3 | nvidia-nemotron-3.5-lightning-30b-a3b | bare | pi | 3 min 35 s | 13,393 | 15.92% | 62.21 | 1 | [open](https://lab.pcmagik.pl/episodes/17-pixel-nemotron-done/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/17-pixel-nemotron-done/nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r1 | nvidia-nemotron-3.5-lightning-30b-a3b | not recorded | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r2 | nvidia-nemotron-3.5-lightning-30b-a3b | not recorded | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| nvidia-nemotron-3.5-lightning-30b-a3b_bare_r3 | nvidia-nemotron-3.5-lightning-30b-a3b | not recorded | 262144 | K f16 / V f16 (LM Studio default) | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |

Sources: engine: engine locked on the rig since 2026-09-19 01:20 (D58, seria/harness/wersje.json); not logged by this run; kv_cache: rig model settings read 2026-09-21 18:20 (seria/pomiary/ustawienia-modeli-2026-09-21.json); K/V unchanged on the rig until 2026-09-26; not logged by this run; quantization: not recorded

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
