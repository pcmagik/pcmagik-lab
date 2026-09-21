# Karpathy skills on Qwen3.8 27B: what you gain, what you lose | PC Magik Lab

Same model, same prompt, same rig. Five runs with nothing added, five with one Karpathy rules file, all at reasoning effort medium. Model reloaded before each run; every number comes from the run logs. "Effects" = occurrences of @keyframes, animation, transition, :hover, gradients, box-shadow, backdrop-filter, transform, event listeners, IntersectionObserver and inline SVG in the page code. Full cohort measurements, representative pages and prompts are available on the episode page. Harness: Pi 0.85.1 (it sends reasoning effort medium by default). Sampling: LM Studio defaults, no fixed seed. Your numbers will differ from run to run; the pattern is what repeats.

Video: coming soon

## Prompt

```
Create a single HTML file for the landing page of PC Magik Lab, a YouTube series about running AI models on real, local GPUs. Tagline, use verbatim: "Local models, real GPUs."

The site should include a polished hero section, a section on how the series measures things (same prompt, same rig, one variable changed per test, the model reloaded before every run, every prompt and result file published), a hardware section (one rig: NVIDIA RTX 3090 24 GB, LM Studio as the model server), an about section, links to the YouTube channel (https://www.youtube.com/@PCMagikLab) and to the repository with prompts and result files (https://github.com/pcmagik/pcmagik-lab), and a footer crediting the author PC Magik (Mateusz Piekut), computer service and homelab operator from Poland.

Make it look like a real, modern tech series website with a dark glass-and-neon style, glowing accents, responsive layout, smooth scrolling, hover effects, and interactive cards. All visible text in English; code and identifiers in English.

Use only the facts given in this prompt. Do not invent episodes, results, statistics or numbers.

Keep everything in one HTML file with the CSS and JavaScript included, no external files, no network requests, no raster images (inline SVG and CSS-drawn graphics are fine). Name the file index.html and write it to the current working directory.

Once finished, review your code, make sure everything works correctly, and fix anything broken or incomplete before giving the final answer.
```

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-19_qwen3.8-27b_bare_pi_emedium | qwen/qwen3.8-27b | bare | pi | 5 min 49 s | 19,321 | 1.73% | 55.33 | 1,059 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/2026-09-19_qwen3.8-27b_bare_pi_emedium/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/2026-09-19_qwen3.8-27b_bare_pi_emedium/screenshot-1920.png) |
| 2026-09-19_qwen3.8-27b_karpathy_pi_emedium | qwen/qwen3.8-27b | karpathy | pi | 5 min 06 s | 15,659 | 2.52% | 51.26 | 902 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/2026-09-19_qwen3.8-27b_karpathy_pi_emedium/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/2026-09-19_qwen3.8-27b_karpathy_pi_emedium/screenshot-1920.png) |

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
