# PC Magik Lab

Prompts and results from [PC Magik Lab](https://www.youtube.com/@PCMagikLab), a YouTube channel testing AI models on real hardware. Same prompt, same rig, check for yourself. Pages: https://lab.pcmagik.pl

| # | Episode | Task | Representative outputs | Video |
|---|---|---|---|---|
| 01 | [Karpathy skills on Qwen3.8 27B: what you gain, what you lose \| PC Magik Lab](episodes/01-karpathy-vs-bare/README.md) | easy | 2 | soon |

## Layout

```
tasks/<level>.txt               the prompt sent to the model, byte for byte
episodes/<NN-slug>/README.md    prompt, run table, links
episodes/<NN-slug>/<date>_<model>_<variant>/  index.html metrics.json prompt.txt screenshot-1920.png screenshot-390.png
```

License: MIT for prompts, scripts and layout. Generated pages are model output.
