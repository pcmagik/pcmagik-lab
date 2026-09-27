# PC Magik Lab

Prompts and results from [PC Magik Lab](https://www.youtube.com/@PCMagikLab), a YouTube channel testing AI models on real hardware. Same prompt, same rig, check for yourself. Pages: https://lab.pcmagik.pl

| # | Episode | Task | Runs | Video |
|---|---|---|---|---|

## Layout

```
tasks/<task>.txt                the task file (placeholders unfilled)
episodes/<NN-slug>/README.md    prompt, run table, links
episodes/<NN-slug>/prompt.txt   the prompt every run got, byte for byte
episodes/<NN-slug>/<model>_<variant>_r<N>/  index.html metrics.json prompt.txt screenshot-1920.png screenshot-390.png
```

License: MIT for prompts, scripts and layout. Generated pages are model output.
