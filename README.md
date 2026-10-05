# PC Magik Lab

Prompts and results from [PC Magik Lab](https://www.youtube.com/@PCMagikLab), a YouTube channel testing AI models on real hardware. Same prompt, same rig, check for yourself. Pages: https://lab.pcmagik.pl

| # | Episode | Task | Runs | Video |
|---|---|---|---|---|
| 04 | [GLM 4.7 Flash with and without Karpathy rules](episodes/04-glm-4.7-flash/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/l_IVcUg-V2E) |
| 03 | [Gemma 4 31B with and without Karpathy rules](episodes/03-gemma-4-31b/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/18ERHNd9M-0) |
| 02 | [Qwen 3.6 27B builds a web page in 4 minutes. Do rules make it leaner?](episodes/02-qwen3.6-27b/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/Djku896tncg) |
| 01 | [Qwen 3.8 27B with Karpathy skills: what you gain, what you lose](episodes/01-karpathy-vs-bare/README.md) | easy | 10 | [YouTube](https://www.youtube.com/shorts/5xvHtb7y0zY) |

## Layout

```
tasks/<task>.txt                the task file (placeholders unfilled)
episodes/<NN-slug>/README.md    prompt, run table, links
episodes/<NN-slug>/prompt.txt   the prompt every run got, byte for byte
episodes/<NN-slug>/card.jpg     1200x630 share card (the episode thumbnail)
episodes/<NN-slug>/<model>_<variant>_r<N>/  index.html metrics.json prompt.txt screenshot-1920.png screenshot-390.png
```

License: MIT for prompts, scripts and layout. Generated pages are model output.
