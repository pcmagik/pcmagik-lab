"""Read-only audit: exported evidence must match the measurement repository byte for byte."""
import argparse
from pathlib import Path
import json
from build_site import ROOT, load


def verify(source):
    feed = load()
    files = 0
    for ep in feed['episodes']:
        meta_path = source/'seria/odcinki'/ep['slug']/'odcinek.json'
        meta = json.loads(meta_path.read_text())
        base = source/meta['katalog_biegow'] if meta.get('katalog_biegow') else meta_path.parent/'biegi'
        for run in ep['measurements']:
            original = (base/run['source_run']).resolve()
            if not original.is_relative_to(source.resolve()):
                raise ValueError('Unsafe source path')
            for key, filename in [('strona','index.html'),('zrzut','zrzut-1920.png'),('metrics','metrics.json'),('prompt','prompt.txt'),('efekty_plik','efekty.json')]:
                if not run.get(key):
                    continue
                if (original/filename).read_bytes() != (ROOT/run[key]).read_bytes():
                    raise ValueError(f'Source differs: {ep["slug"]}/{run["source_run"]}/{filename}')
                files += 1
    print(f'PASS source audit: {files} public evidence files match the measurement repository byte for byte')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',type=Path)
    verify(parser.parse_args().source)
