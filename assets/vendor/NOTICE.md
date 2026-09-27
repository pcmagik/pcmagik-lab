# Third-party libraries

- GSAP 3.15.0 and ScrollTrigger 3.15.0: unmodified distribution files from the npm `gsap@3.15.0` package. Copyright © 2008–2026 GreenSock. Standard license: https://gsap.com/standard-license/ . The original license headers are preserved.
- Three.js 0.186.0: `three.core.js` and `three.module.js` from npm `three@0.186.0`, minified with esbuild 0.28.2 (`--minify --format=esm`); the module's local import points to `three.core.min.js`. The MIT license is included in `three-0.186.0/LICENSE`.

All runtime libraries are served locally. Updating a library requires replacing the pinned files and repeating the browser checks documented in `.docs/design/`.
