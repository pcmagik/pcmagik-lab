"""Export the measured homepage cohorts without publishing private logs or changing demos."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT.parent / 'projekt-wiedza-z-yt'


def export(check=False):
    evidence = {}

    def read(relative):
        content = (SOURCE / relative).read_bytes()
        evidence[relative] = hashlib.sha256(content).hexdigest()
        return content

    registry = [json.loads(line) for line in read('seria/pomiary/biegi.jsonl').splitlines() if line.strip()]
    episode = json.loads(read('seria/odcinki/01-karpathy-vs-bare/odcinek.json'))
    read('seria/badania/04-seria-modeli-n3/OCENA.md')
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
    series = {}
    for file in sorted((SOURCE / 'seria/badania/04-seria-modeli-n3/biegi').glob('*/metrics.json')):
        relative = file.relative_to(SOURCE).as_posix()
        metrics = json.loads(read(relative))
        effects = json.loads(read(relative.replace('metrics.json', 'efekty.json')))
        series.setdefault(metrics['model'], {'bare': [], 'karpathy': []})[metrics['variant']].append({
            'id': file.parent.name, 'effects': effects['razem']
        })
    assert len(series) == 11
    for model, variants in series.items():
        assert all(len(runs) == 3 for runs in variants.values()), model
        bare = [r['effects'] for r in variants['bare']]
        karpathy = [r['effects'] for r in variants['karpathy']]
        assert max(min(bare), min(karpathy)) <= min(max(bare), max(karpathy)), model
    mean = lambda variant: sum(r['effects'] for r in cohorts[variant]['runs']) / cohorts[variant]['n']
    reduction = round((1 - mean('karpathy') / mean('bare')) * 100)
    assert reduction == 22
    data = {
        'model': 'Qwen3.8 27B', 'effort': 'medium',
        'cohorts': cohorts, 'effects_mean_reduction_percent': reduction,
        'series04': {'models': series, 'runs_per_variant': 3, 'total_runs': sum(len(runs) for variants in series.values() for runs in variants.values())},
        'provenance': {'repository': 'Local measurement repository: projekt-wiedza-z-yt', 'files_sha256': evidence}
    }
    copies['assets/homepage-benchmarks.json'] = (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode()
    for relative, content in copies.items():
        target = ROOT / relative
        if check:
            assert target.read_bytes() == content, f'Export differs from source: {relative}'
        else:
            target.write_bytes(content)
    print('PASS source export: 10 film runs, 66 series runs, 11 overlapping model ranges, representative previews and prompts')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    export(parser.parse_args().check)
