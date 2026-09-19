# Qwen3.8 27B: Karpathy skills vs bare | PC Magik Lab

Same model, same prompt, same rig. One run with nothing added, one with a single Karpathy rules file. Model reloaded before each run; every number comes from the run log, not from memory.

Video: coming soon

## Prompt

```
Create a single HTML file for the website of PC Magik Lab, a YouTube series about running AI models on real, local GPUs. Tagline, use verbatim: "Local models, real GPUs."

The site should include a polished hero section, an episodes section built from the episode data below, a hardware section (one rig: NVIDIA RTX 3090 24 GB, LM Studio as the model server), an about section explaining that every episode is one measurement with one changed variable and one number on screen, links to the YouTube channel (https://www.youtube.com/@PCMagikLab) and to the repository with prompts and result files (https://github.com/pcmagik/pcmagik-lab), and a footer crediting the author PC Magik (Mateusz Piekut), computer service and homelab operator from Poland.

Make it look like a real, modern tech series website with a dark glass-and-neon style, glowing accents, responsive layout, smooth scrolling, hover effects, animated numbers, and interactive episode cards. All visible text in English; code and identifiers in English.

Episode data (real measurements, use them exactly; more episodes will be added later):
[
  {
    "id": "s1",
    "tag": "Karpathy vs bare",
    "date": "2026-09-08",
    "title": "Qwen3.8 27B: Karpathy rules vs no rules",
    "headline_number": "−37% tokens",
    "result": "With rules: 174.87 s and 9,764 tokens. Without rules: 282.55 s and 15,391 tokens.",
    "models": ["Qwen3.8 27B"],
    "files": 2,
    "work_url": "./work/s1/",
    "video_url": "https://www.youtube.com/@PCMagikLab"
  }
]

Keep everything in one HTML file with the CSS and JavaScript included, no external files, no network requests, no raster images (inline SVG and CSS-drawn graphics are fine). Name the file index.html and write it to the current working directory.

Once finished, review your code, make sure everything works correctly, and fix anything broken or incomplete before giving the final answer.
```

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-19_qwen3.8-27b_bare_pi | qwen/qwen3.8-27b | bare | pi | 26 min 34 s | 60,318 | 60% | 38 | 965 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/2026-09-19_qwen3.8-27b_bare_pi/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/2026-09-19_qwen3.8-27b_bare_pi/screenshot-1920.png) |
| 2026-09-19_qwen3.8-27b_karpathy_pi | qwen/qwen3.8-27b | karpathy | pi | 19 min 37 s | 47,903 | 53% | 41 | 780 | [open](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/2026-09-19_qwen3.8-27b_karpathy_pi/index.html) | [png](https://lab.pcmagik.pl/episodes/01-karpathy-vs-bare/2026-09-19_qwen3.8-27b_karpathy_pi/screenshot-1920.png) |

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
