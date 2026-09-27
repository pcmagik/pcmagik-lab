"""Verify empty, first-publication and four-film states in one fresh local clone."""
import argparse
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def prepare(destination, source):
    destination = destination.resolve()
    if not destination.is_relative_to(Path('/tmp')) or destination.exists():
        raise ValueError('Choose a new local clone directory under /tmp')
    exporter = source/'seria/harness/publikuj.py'
    if not exporter.is_file():
        raise ValueError('Measurement exporter not found')
    env = dict(os.environ, PYTHONDONTWRITEBYTECODE='1')
    subprocess.run(['git','clone','--local','--no-hardlinks','--single-branch','--branch',
                    'fix/publication-data-integrity',str(ROOT),str(destination)],check=True)
    subprocess.run(['git','-C',str(destination),'remote','remove','origin'],check=True)

    def ci(state):
        for command in [['python3','-m','unittest','discover','-s','bin','-p','test_*.py'],
                        ['bash','bin/po-publikacji.sh'],
                        ['python3','bin/package_site.py','.tmp/pages']]:
            print(f'{state}: {command}',flush=True)
            subprocess.run(command,cwd=destination,env=env,check=True)
        (destination/'.tmp/pages').rename(destination/f'.tmp/pages-{state}')
        print(f'PASS CI {state}: 3/3 commands exit 0',flush=True)

    ci('empty')
    for number in ['01','02','04','13']:
        matches = list((source/'seria/odcinki').glob(number+'-*/odcinek.json'))
        if len(matches) != 1:
            raise ValueError(f'Expected one episode for {number}')
        command = ['python3',str(exporter),matches[0].parent.name,'--no-push','--destination',str(destination)]
        print(command,flush=True)
        subprocess.run(command,env=env,check=True)
        if number == '01':
            ci('01')
    ci('01-02-04-13')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination',type=Path)
    parser.add_argument('--source',type=Path,default=ROOT.parent/'projekt-wiedza-z-yt')
    args = parser.parse_args()
    prepare(args.destination,args.source)
