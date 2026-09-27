"""Export the round-four acceptance feed into a fresh local clone under /tmp."""
import argparse
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def prepare(destination, source):
    destination = destination.resolve()
    if not destination.is_relative_to(Path('/tmp')) or destination.exists():
        raise ValueError('Choose a new clone directory under /tmp')
    exporter = source / 'seria/harness/publikuj.py'
    if not exporter.is_file():
        raise ValueError('Measurement exporter not found')
    subprocess.run(['git', 'clone', '--local', '--no-hardlinks', '--branch',
                    'fix/publication-data-integrity', str(ROOT), str(destination)], check=True)
    subprocess.run(['git', '-C', str(destination), 'remote', 'remove', 'origin'], check=True)
    for number in ['01', '02', '05', '13', '14', '15', '16', '17']:
        matches = sorted((source/'seria/odcinki').glob(number+'-*/odcinek.json'))
        if len(matches) != 1:
            raise ValueError(f'Expected one episode for {number}')
        subprocess.run(['python3', str(exporter), matches[0].parent.name, '--no-push',
                        '--destination', str(destination)], check=True)
    subprocess.run(['bash', str(destination/'bin/po-publikacji.sh')], check=True)
    subprocess.run(['python3', str(destination/'bin/package_site.py'),
                    str(destination/'.tmp/public')], check=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--source', type=Path, default=ROOT.parent/'projekt-wiedza-z-yt')
    args = parser.parse_args()
    prepare(args.destination, args.source)
