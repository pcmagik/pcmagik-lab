"""Package only validated public artifacts for Pages, never the whole repository."""
import argparse
from pathlib import Path
import shutil
from build_site import ROOT, build, load


def package(destination):
    build(check=True)
    feed = load()
    files = {'index.html', 'episodes/index.html', 'CNAME', '.nojekyll', 'data/episodes.json', 'README.md', 'LICENSE'}
    files.update(str(p.relative_to(ROOT)) for p in (ROOT/'assets').rglob('*') if p.is_file())
    files.update(str(p.relative_to(ROOT)) for p in (ROOT/'tasks').glob('*.txt'))
    for ep in feed['episodes']:
        files.add(f'episodes/{ep["slug"]}/index.html')
        if (ROOT/f'episodes/{ep["slug"]}/README.md').is_file():
            files.add(f'episodes/{ep["slug"]}/README.md')
        for r in ep['measurements']:
            if r.get('strona'):
                mobile = str(Path(r['strona']).with_name('screenshot-390.png'))
                if (ROOT/mobile).is_file():
                    files.add(mobile)
            files.update(r[key] for key in ['strona','zrzut','metrics','prompt','efekty_plik'] if r.get(key))
    destination = destination.resolve()
    if destination.exists():
        raise ValueError('Package destination must not exist')
    if not destination.is_relative_to(ROOT/'.tmp'):
        raise ValueError('Package destination must be inside .tmp')
    for name in sorted(files):
        source = ROOT/name
        if not source.is_file() or source.is_symlink() or not source.resolve().is_relative_to(ROOT):
            raise ValueError(f'Unsafe public file: {name}')
    for name in sorted(files):
        target = destination/name
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(ROOT/name,target)
    print(f'PASS public package: {len(files)} files → {destination}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination',type=Path)
    package(parser.parse_args().destination)
