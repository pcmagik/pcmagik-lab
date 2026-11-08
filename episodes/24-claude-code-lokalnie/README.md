# Claude Code for free on your own GPU? Qwen3.8 27B: 29 of 29, Pi 25–29

Claude Code 2.1.310 with a local model: Qwen3.8 27B (Q4_K_M) in LM Studio 2.41.0 on one RTX 3090 24 GB, no subscription and no API key. Same task (Pixel_Art_Editor, Medium in Prompt Vault, 29 checks) in Pi 0.85.1, 3 runs each, model reloaded before every run, effort medium. Score after checking every lost point by hand in a browser: Claude Code 29 of 29 in every run, Pi 25–29 — the ranges overlap (Pi also reached 29); that is not proof of equal quality. Claude Code worked longer in every run (826–2202 s vs 156–199 s), wrote more output tokens (29132–56152 vs 8561–10645) and generated slower (32.5–41.1 vs 60.0–61.2 tok/s). These are properties of the whole setup (harness, system prompt, tools, protocol), not of the model alone. "Free" means no subscription or API key, not free hardware or power.

[Watch on YouTube](https://www.youtube.com/shorts/Xrn5v-s47O8)

Prompt: [prompt.txt](prompt.txt)

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| claude-code_r1 | qwen/qwen3.8-27b | bare | claude | 13 min 46 s | 29,132 | not measured yet | 35.26 | 754 | [open](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/claude-code_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/claude-code_r1/screenshot-1920.png) |
| claude-code_r2 | qwen/qwen3.8-27b | bare | claude | 32 min 09 s | 56,152 | not measured yet | 29.11 | 969 | [open](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/claude-code_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/claude-code_r2/screenshot-1920.png) |
| claude-code_r3 | qwen/qwen3.8-27b | bare | claude | 36 min 42 s | 55,333 | not measured yet | 25.13 | 771 | [open](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/claude-code_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/claude-code_r3/screenshot-1920.png) |
| pi-agent_r1 | qwen/qwen3.8-27b | bare | pi | 3 min 19 s | 10,288 | 17.89% | 51.63 | 677 | [open](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/pi-agent_r1/index.html) | [png](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/pi-agent_r1/screenshot-1920.png) |
| pi-agent_r2 | qwen/qwen3.8-27b | bare | pi | 3 min 16 s | 10,645 | 38.92% | 54.31 | 644 | [open](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/pi-agent_r2/index.html) | [png](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/pi-agent_r2/screenshot-1920.png) |
| pi-agent_r3 | qwen/qwen3.8-27b | bare | pi | 2 min 36 s | 8,561 | 10.92% | 54.98 | 732 | [open](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/pi-agent_r3/index.html) | [png](https://lab.pcmagik.pl/episodes/24-claude-code-lokalnie/pi-agent_r3/screenshot-1920.png) |

## How to reproduce

Each run below lists what it ran with. A value no run file proves is shown as "not recorded".

| Run | Model | Quantization | Context | K/V cache | max_tokens (largest request) | Engine | Harness | Effort | Rules |
|---|---|---|---|---|---|---|---|---|---|
| claude-code_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 128000 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | claude 2.1.310 (Claude Code) sha256:b73676430af12f97316a798b8371f81d640f90a58bdcb8f3ce56a835bb47df56 | medium | none (bare) |
| claude-code_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 128000 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | claude 2.1.310 (Claude Code) sha256:b73676430af12f97316a798b8371f81d640f90a58bdcb8f3ce56a835bb47df56 | medium | none (bare) |
| claude-code_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 128000 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | claude 2.1.310 (Claude Code) sha256:b73676430af12f97316a798b8371f81d640f90a58bdcb8f3ce56a835bb47df56 | medium | none (bare) |
| pi-agent_r1 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| pi-agent_r2 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |
| pi-agent_r3 | qwen/qwen3.8-27b | Q4_K_M | 262144 | K q4_0 / V q4_0 | 131072 | llama.cpp-win-x86_64-nvidia-cuda12-avx2@2.41.0 | pi 0.85.1 | medium | none (bare) |

Sources: engine: metrics.json; kv_cache: metrics.json; quantization: metrics.json

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
