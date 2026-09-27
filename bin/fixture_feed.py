"""Independent renderer examples; never read the publication feed."""

def feed():
    runs = []
    for variant in ['bare', 'karpathy']:
        for i in range(1, 6):
            name = f'fixture_{variant}_r{i}'
            prefix = f'episodes/fixture/{name}'
            runs.append(dict(bieg=name, model='fixture/model', wariant=variant, powtorzenie=i,
                harness='pi', sekundy=60+i, tokeny=1000+i, tokeny_myslenia=100,
                myslenie_pct=9.99, tok_s=20+i, linie=100+i,
                efekty=(100 if variant == 'bare' else 50)+i,
                effort_zadany='medium', effort_otrzymany=None, model_przeladowany=True,
                strona=f'{prefix}/index.html', zrzut=f'{prefix}/screenshot.png',
                metrics=f'{prefix}/metrics.json', prompt=f'{prefix}/prompt.txt'))
    ep = dict(slug='fixture', title='Fixture experiment', published='2026-09-22', task='easy', youtube='',
        opis='A measured example.', measurements=runs, runs=[runs[1], runs[6]],
        cohorts=[dict(model='fixture/model', wariant=v, n=5) for v in ['bare','karpathy']])
    return dict(schema_version=2, generated='2026-09-22', source='fixture', note='Fixture only', episodes=[ep])
