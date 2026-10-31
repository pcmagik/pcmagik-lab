# PC Magik Lab

Prompts and results from [PC Magik Lab](https://www.youtube.com/@PCMagikLab), a YouTube channel testing AI models on real hardware. Same prompt, same rig, check for yourself. Pages: https://lab.pcmagik.pl

| # | Episode | Task | Runs | Video |
|---|---|---|---|---|
| 14 | [Only 1 of 12 local model files never dropped below 28/29](episodes/14-pixel-ranking/README.md) | Pixel_Art_Editor | 36 | [YouTube](https://www.youtube.com/shorts/97iBgMEQLAE) |
| 13 | [One rules file. Twelve models.](episodes/13-jeden-model-z-dwunastu/README.md) | easy | 72 | [YouTube](https://www.youtube.com/shorts/GTVkK2dTcNs) |
| 12 | [Muse Glimmer 30B spends a third of its output thinking. Do rules change that?](episodes/12-muse-glimmer-30b/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/79nWI3PeOyI) |
| 11 | [Ornith 1.0 35B writes 945 lines for one web page. Do rules trim it?](episodes/11-ornith-1.0-35b/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/JZv6WS69qyg) |
| 10 | [Ornith 1.5 35B A3B puts 95+ effects on every page. Do rules cut them?](episodes/10-ornith-1.5-35b-a3b/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/z0Mz3Af-2_4) |
| 09 | [Nemotron 3.5 Lightning broke 1 page in 6. Can a rules file prevent that?](episodes/09-nemotron-3.5-lightning/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/90bUpSN-zUE) |
| 08 | [Gemma 4 26B A4B: 110 tokens per second. Does a rules file change the page?](episodes/08-gemma-4-26b-a4b/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/D_1GVPUnn5c) |
| 07 | [Qwen 3.6 35B A3B puts 70+ effects on every page. Do rules tone it down?](episodes/07-qwen3.6-35b-a3b/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/LI1199MruQ4) |
| 06 | [Muse Glimmer builds a web page in 2.5 minutes. What changes with Karpathy rules?](episodes/06-muse-glimmer/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/e8FWKxCOrPg) |
| 05 | [Nemotron 3 Nano spends 76% of its output thinking, and 2 of 6 pages broke](episodes/05-nemotron-3-nano/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/i1rk2hLmOXU) |
| 04 | [GLM 4.7 Flash builds a full web page in under 2 minutes. Do rules slow it down?](episodes/04-glm-4.7-flash/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/l_IVcUg-V2E) |
| 03 | [Gemma 4 31B needs 7 minutes for one web page. Do rules speed it up?](episodes/03-gemma-4-31b/README.md) | easy | 6 | [YouTube](https://www.youtube.com/shorts/18ERHNd9M-0) |
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
