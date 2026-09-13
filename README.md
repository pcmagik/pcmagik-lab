# PC Magik Lab

Prompts and results from [PC Magik Lab](https://www.youtube.com/@PCMagikLab), a YouTube channel testing AI models on real hardware. Same prompt, same rig, check for yourself. Pages: https://lab.pcmagik.pl

| # | Episode | Task | Runs | Video |
|---|---|---|---|---|
| 01 | [Qwen3.8 27B: Karpathy skills vs bare | PC Magik Lab](odcinki/01-karpathy-vs-bare/README.md) | easy | 2 | soon |

## Layout

```
zadania/<level>.txt              the prompt sent to the model, byte for byte
odcinki/<NN-slug>/README.md     prompt, run table, links
odcinki/<NN-slug>/<date>_<model>_<variant>/  index.html metrics.json prompt.txt zrzut-1920.png zrzut-390.png
```

License: MIT for prompts, scripts and layout. Generated pages are model output.
