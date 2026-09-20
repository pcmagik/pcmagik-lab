"""Export the measured homepage cohorts without publishing private logs or changing demos."""
import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT.parent / 'projekt-wiedza-z-yt'


def export(check=False):
    evidence = {}

    def read(relative):
        content = (SOURCE / relative).read_bytes()
        evidence[relative] = hashlib.sha256(content).hexdigest()
        return content

    subprocess.run([sys.executable, str(SOURCE / 'seria/harness/liczby.py'), '--sprawdz'], check=True, cwd=SOURCE)
    numbers = read('seria/pomiary/LICZBY.md').decode()
    state = re.search(r'^# LICZBY — stan na (\d{4}-\d{2}-\d{2})', numbers).group(1)
    overlapping, models = map(int, re.search(r'zakresy sie nakladaja: \*\*(\d+) z (\d+)\*\*', numbers).groups())
    film = numbers.split('## Film 01', 1)[1]
    expected_counts = list(map(int, re.search(r'biegów: \*\*(\d+) bare \+ (\d+) karpathy', film).groups()))
    expected_effects = list(map(int, re.search(r'efekty bare: \*\*(\d+)–(\d+)\*\*, karpathy: \*\*(\d+)–(\d+)', film).groups()))
    reduction = int(re.search(r'spadek średniej: \*\*(\d+) %', film).group(1))
    registry = [json.loads(line) for line in read('seria/pomiary/biegi.jsonl').splitlines() if line.strip()]
    episode = json.loads(read('seria/odcinki/01-karpathy-vs-bare/odcinek.json'))
    cohorts = {}
    copies = {}
    for variant, code in [('bare', 'D01-BAREMED'), ('karpathy', 'D01-KARPMED')]:
        selected = sorted((r for r in registry if r.get('odcinek') == code), key=lambda r: r['sciezka'])
        assert len(selected) == 5, (variant, len(selected))
        runs = []
        for record in selected:
            path = record['sciezka']
            metrics = json.loads(read(path + '/metrics.json'))
            effects = json.loads(read(path + '/efekty.json'))
            assert metrics['model_reloaded'] and metrics['effort'] == 'medium'
            assert metrics['seconds'] == record['sekundy']
            assert metrics['usage']['completion_tokens'] == record['tokeny_odpowiedzi']
            assert metrics['tokens_per_second'] == record['tokeny_na_sekunde']
            assert metrics['html_lines'] == record['linie_kodu']
            assert record['tokeny_myslenia'] + record['tokeny_tresci'] == record['tokeny_odpowiedzi']
            runs.append({
                'id': Path(path).name, 'source': path,
                'seconds': record['sekundy'], 'output_tokens': record['tokeny_odpowiedzi'],
                'thinking_tokens': record['tokeny_myslenia'], 'final_code_tokens': record['tokeny_tresci'],
                'thinking_percent': record['udzial_myslenia_pct'], 'tok_s': record['tokeny_na_sekunde'],
                'lines_of_code': record['linie_kodu'], 'effects': effects['razem']
            })
        representative = sorted(runs, key=lambda r: r['seconds'])[2]
        assert representative['id'] in episode['biegi']
        assert (SOURCE / representative['source'] / 'index.html').is_file()
        image = read(representative['source'] + '/zrzut-pelny-1920.png')
        image_path = f'assets/film01-{variant}-preview.png'
        copies[image_path] = image
        prompt = read(representative['source'] + '/prompt.txt')
        copies[f'assets/film01-{variant}-prompt.txt'] = prompt
        cohorts[variant] = {'n': len(runs), 'runs': runs, 'representative': representative['id'], 'preview': image_path}
    for i, variant in enumerate(['bare', 'karpathy']):
        runs = cohorts[variant]['runs']
        assert len(runs) == expected_counts[i], 'LICZBY.md run count mismatch'
        values = [r['effects'] for r in runs]
        assert [min(values), max(values)] == expected_effects[i * 2:i * 2 + 2], 'LICZBY.md effects mismatch'
    mean = lambda variant: sum(r['effects'] for r in cohorts[variant]['runs']) / cohorts[variant]['n']
    assert round((1 - mean('karpathy') / mean('bare')) * 100) == reduction
    data = {
        'model': 'Qwen3.8 27B', 'effort': 'medium',
        'cohorts': cohorts, 'effects_mean_reduction_percent': reduction,
        'series_context': {'model_count': models, 'overlapping_count': overlapping, 'as_of': state},
        'provenance': {'repository': 'Local measurement repository: projekt-wiedza-z-yt', 'files_sha256': evidence}
    }
    copies['assets/homepage-benchmarks.json'] = (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode()
    for relative, content in copies.items():
        target = ROOT / relative
        if check:
            assert target.read_bytes() == content, f'Export differs from source: {relative}'
        else:
            target.write_bytes(content)
    print('PASS source export: Film 01 and LICZBY.md summaries verified; unpublished series details excluded')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    export(parser.parse_args().check)
