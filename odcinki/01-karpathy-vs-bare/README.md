# Qwen3.8 27B: Karpathy skills vs bare | PC Magik Lab

Same model, same prompt, same rig. One run with nothing added, one with a single Karpathy rules file.

Video: coming soon

## Prompt

```
Create a single HTML file for the website of Seria robocza, a YouTube series about running AI models on real, local GPUs. Tagline, Polish, use verbatim: „Lokalne modele, prawdziwe GPU".

The site should include a polished hero section, an episodes section built from the episode data below, a hardware section (one rig: NVIDIA RTX 3090 24 GB, LM Studio as the model server), an about section explaining that every episode is one measurement with one changed variable and one number on screen, links to the YouTube channel (https://www.youtube.com/) and to the repository with prompts and result files (https://github.com/pcmagik), and a footer crediting the author PC Magik (Mateusz Piekut), computer service and homelab operator from Poland.

Make it look like a real, modern tech series website with a dark glass-and-neon style, glowing accents, responsive layout, smooth scrolling, hover effects, animated numbers, and interactive episode cards. All visible text in Polish with correct diacritics (ą ć ę ł ń ó ś ź ż); code and identifiers in English.

Episode data (real measurements, use them exactly; more episodes will be added later):
[
  {
    "id": "s1",
    "tag": "Karpathy vs bare",
    "date": "2026-09-08",
    "title": "Qwen3.8 27B: reguły Karpathy'ego kontra bez reguł",
    "headline_number": "−37% tokenów",
    "result": "Z regułami: 174,87 s i 9 764 tokeny. Bez reguł: 282,55 s i 15 391 tokenów.",
    "models": ["Qwen3.8 27B"],
    "files": 2,
    "work_url": "./prace/s1/",
    "video_url": "https://www.youtube.com/"
  }
]

Keep everything in one HTML file with the CSS and JavaScript included, no external files, no network requests, no raster images (inline SVG and CSS-drawn graphics are fine). Name the file index.html and write it to the current working directory.

Once finished, review your code, make sure everything works correctly, and fix anything broken or incomplete before giving the final answer.
```

## Runs

| Run | Model | Variant | Harness | Time | Output tokens | Thinking | tok/s | Lines | Page | Screenshot |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-12_qwen3.8-27b_bare | qwen/qwen3.8-27b | bare | opencode | 52 min 01 s | 85,828 | 66% | 28 | 662 | [open](https://lab.pcmagik.pl/odcinki/01-karpathy-vs-bare/2026-09-12_qwen3.8-27b_bare/index.html) | [png](https://lab.pcmagik.pl/odcinki/01-karpathy-vs-bare/2026-09-12_qwen3.8-27b_bare/zrzut-1920.png) |
| 2026-09-12_qwen3.8-27b_karpathy | qwen/qwen3.8-27b | karpathy | opencode | 43 min 12 s | 69,130 | 63% | 27 | 986 | [open](https://lab.pcmagik.pl/odcinki/01-karpathy-vs-bare/2026-09-12_qwen3.8-27b_karpathy/index.html) | [png](https://lab.pcmagik.pl/odcinki/01-karpathy-vs-bare/2026-09-12_qwen3.8-27b_karpathy/zrzut-1920.png) |

Rig: Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio. One variable changed per test. Numbers come straight from the run's metrics.json.
