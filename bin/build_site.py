"""Build the static lab from the publisher's local feed, with no external repository access."""
import argparse
from collections import defaultdict
from datetime import date
from html import escape
import json
import math
import os
from pathlib import Path
import re
import sys
import tempfile
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parents[1]
NUMBERS = ['sekundy', 'tokeny', 'tokeny_myslenia', 'myslenie_pct', 'tok_s', 'linie', 'efekty']
ARTIFACTS = ['metrics', 'prompt']


def text(value):
    return escape(str(value), quote=True)


def number(value):
    return 'not measured yet' if value is None else f'{value:,}'


def template(name, **values):
    def render(filename, context):
        source = (ROOT / 'bin/templates' / filename).read_text()
        return re.sub(r'\{\{(\w+)\}\}', lambda m: context[m[1]], source)
    home = name == 'home.html'
    content = render(name, values)
    context = dict(values, body=content, asset_prefix='' if home else '/',
                   home_url='./' if home else '/', nav_prefix='' if home else '/',
                   extra_styles='' if home else '  <link rel="stylesheet" href="/assets/interior.css">\n')
    if home:
        context.update(title='PC Magik Lab — Intelligence, under the microscope.',
                       og_title='PC Magik Lab — AI benchmarks, measured across repeated runs',
                       description='Independent AI experiments on real hardware. Inspect published model outputs, prompts and measurements.', path='/')
    else:
        context['og_title'] = context['title']
    return render('layout.html', context)


def artifact(path, slug):
    if not isinstance(path, str) or not path.startswith(f'episodes/{slug}/') or '\\' in path or any(c in path for c in ['?', '#', '\x00']):
        raise ValueError(f'{slug}: invalid artifact path {path!r}')
    relative = Path(path)
    if '..' in relative.parts or relative.is_absolute() or len(relative.parts) < 4:
        raise ValueError(f'{slug}: unsafe artifact path {path!r}')
    target = (ROOT / relative).resolve()
    if not target.is_relative_to(ROOT.resolve()) or not target.is_file():
        raise ValueError(f'{slug}: missing or unsafe artifact {path}')
    return target


def load():
    feed = json.loads((ROOT / 'data/episodes.json').read_text())
    if not isinstance(feed, dict) or not isinstance(feed.get('episodes'), list):
        raise ValueError('data/episodes.json must contain an episodes array')
    if feed.get('schema_version') != 2:
        raise ValueError('Re-export measurements with publication schema_version 2')
    date.fromisoformat(feed['generated'])
    if not isinstance(feed.get('note', ''), str):
        raise ValueError('Feed note must be text')
    seen = set()
    for episode in feed['episodes']:
        if not isinstance(episode, dict):
            raise ValueError('Each episode must be an object')
        slug = episode.get('slug', '')
        if not isinstance(slug, str) or not re.fullmatch(r'[a-z0-9]+(?:[.-][a-z0-9]+)*', slug) or slug in seen:
            raise ValueError(f'Invalid or duplicate episode slug: {slug!r}')
        seen.add(slug)
        for key in ['title', 'opis', 'task', 'youtube']:
            if not isinstance(episode.get(key), str):
                raise ValueError(f'{slug}: {key} must be text')
        if not episode['title'].strip():
            raise ValueError(f'{slug}: title is empty')
        video = urlparse(episode['youtube'])
        if episode['youtube'] and (video.scheme != 'https' or video.hostname not in ['youtube.com', 'www.youtube.com', 'youtu.be'] or video.username):
            raise ValueError(f'{slug}: expected an HTTPS YouTube URL')
        if not isinstance(episode.get('runs'), list):
            raise ValueError(f'{slug}: runs must be an array')
        if not isinstance(episode.get('measurements'), list) or not episode['measurements']:
            raise ValueError(f'{slug}: full measurements are required')
        runs = set()
        for run in episode['measurements']:
            if not isinstance(run, dict):
                raise ValueError(f'{slug}: each run must be an object')
            for key in ['bieg', 'model', 'wariant', 'harness']:
                if not isinstance(run.get(key), str) or not run[key].strip():
                    raise ValueError(f'{slug}: run {key} must be non-empty text')
            if run['bieg'] in runs:
                raise ValueError(f'{slug}: duplicate run {run["bieg"]}')
            runs.add(run['bieg'])
            for key in NUMBERS:
                value = run.get(key)
                if value is not None and (type(value) not in (int, float) or not math.isfinite(value) or value < 0):
                    raise ValueError(f'{slug}: {key} must be a nonnegative finite number or null')
            for key in ['effort_zadany', 'effort_otrzymany']:
                if run.get(key) is not None and not isinstance(run[key], str):
                    raise ValueError(f'{slug}: {key} must be text or null')
            if run.get('model_przeladowany') is not None and type(run['model_przeladowany']) is not bool:
                raise ValueError(f'{slug}: model_przeladowany must be boolean or null')
            for key in ARTIFACTS:
                artifact(run.get(key), slug)
            for key in ['strona', 'zrzut']:
                if run.get(key):
                    artifact(run[key], slug)
            validate_evidence(run, slug)
        if not isinstance(episode.get('cohorts'), list) or not episode['cohorts']:
            raise ValueError(f'{slug}: declared cohorts are required')
        if 'cohorts' in episode:
            declared = {(g['model'], g['wariant']): g['n'] for g in episode['cohorts']}
            actual = defaultdict(int)
            for run in episode['measurements']:
                actual[(run['model'], run['wariant'])] += 1
            if len(declared) != len(episode['cohorts']) or declared != dict(actual):
                raise ValueError(f'{slug}: incomplete declared cohort')
        for run in episode['runs']:
            if run not in episode['measurements']:
                raise ValueError(f'{slug}: representative differs from full measurements')
            for key in ['strona', 'zrzut']:
                artifact(run.get(key), slug)
        if len({r['bieg'] for r in episode['runs']}) != len(episode['runs']):
            raise ValueError(f'{slug}: duplicate representative')
    return feed


def validate_evidence(run, slug):
    raw = json.loads(artifact(run['metrics'], slug).read_text())
    usage = raw.get('usage') or {}
    expected = {
        'model': raw.get('model'), 'wariant': raw.get('variant'), 'harness': raw.get('harness'),
        'sekundy': raw.get('seconds'), 'tokeny': usage.get('completion_tokens'),
        'tokeny_myslenia': (usage.get('completion_tokens_details') or {}).get('reasoning_tokens'),
        'tok_s': raw.get('tokens_per_second'), 'linie': raw.get('html_lines'),
        'effort_zadany': raw.get('effort_zadany') or raw.get('effort'),
        'effort_otrzymany': raw.get('effort_otrzymany'), 'model_przeladowany': raw.get('model_reloaded'),
    }
    for key, value in expected.items():
        if run.get(key) != value:
            raise ValueError(f'{slug}/{run["bieg"]}: {key} differs from metrics.json')
    total, thinking = run.get('tokeny'), run.get('tokeny_myslenia')
    if total is not None and thinking is not None and thinking > total:
        raise ValueError(f'{slug}: thinking exceeds output tokens')
    percent = round(thinking / total * 100, 2) if total and thinking is not None else None
    if run.get('myslenie_pct') != percent:
        raise ValueError(f'{slug}: thinking percentage differs from measured tokens')
    effects_path = run.get('efekty_plik')
    effects = json.loads(artifact(effects_path, slug).read_text()) if effects_path else {}
    if run.get('efekty') != effects.get('razem', effects.get('suma')):
        raise ValueError(f'{slug}: effects differ from evidence')


def episode_date(episode, generated):
    if episode.get('date'):
        date.fromisoformat(episode['date'])
        return episode['date'], 'Run date'
    # Legacy run identifiers may contain a measurement date.
    dates = [run['bieg'][:10] for run in episode['runs'] if re.match(r'^\d{4}-\d{2}-\d{2}_', run['bieg'])]
    for value in dates:
        date.fromisoformat(value)
    return (max(dates), 'Run date') if dates else (generated, 'Updated')


def cards(episodes, feed):
    result = []
    for ep in episodes:
        day, label = episode_date(ep, feed['generated'])
        summary = re.split(r'(?<=\.)\s+', ep['opis'], maxsplit=1)[0]
        models = ', '.join(dict.fromkeys(r['model'] for r in ep['runs']))
        result.append(f'''<article class="episode-card glass spotlight">
<div class="ep-meta"><span class="chip">{len(ep['runs'])} PUBLISHED OUTPUTS</span><time datetime="{day}">{label}: {day}</time></div>
<p class="eyebrow">{text(models)}</p><h3><a href="/episodes/{ep['slug']}/">{text(ep['title'])} <span aria-hidden="true">↗</span></a></h3>
<p class="episode-thesis">{text(summary)}</p><p class="measurement-note">{text(feed.get('note', ''))}</p></article>''')
    return '\n'.join(result) or '<p class="study-note">No episodes published yet.</p>'


def episode_result(runs):
    """Conclude only from complete, repeated, non-overlapping effect ranges."""
    groups = {v: [r.get('efekty') for r in runs if r['wariant'] == v] for v in ['bare', 'karpathy']}
    if any(len(g) < 3 or any(x is None for x in g) for g in groups.values()):
        return '<strong class="result-number">not measured yet</strong><span>Repeated effect comparison</span>'
    bare, karpathy = groups['bare'], groups['karpathy']
    if max(karpathy) < min(bare):
        reduction = round((1 - (sum(karpathy)/len(karpathy)) / (sum(bare)/len(bare))) * 100)
        return f'<strong class="result-number">−{reduction}%</strong><span>fewer counted effects</span><p class="result-repeat">{len(karpathy)} / {len(karpathy)} Karpathy runs below every bare run · mean reduction</p>'
    if min(karpathy) > max(bare):
        return '<strong class="result-number result-words">More effects</strong><span>Every Karpathy run above every bare run</span>'
    return '<strong class="result-number result-words">Ranges overlap</strong><span>No demonstrated difference in counted effects</span>'


def episode_heading(title):
    """Break at the title's clause boundary; keep short closing phrases together."""
    if ': ' not in title:
        return text(title)
    subject, detail = title.split(': ', 1)
    phrases = ', '.join(f'<span class="title-phrase">{text(part)}</span>' for part in detail.split(', '))
    words = subject.split(' ')
    subject_html = text(subject) + ':'
    if len(words) > 2:
        subject_html = text(' '.join(words[:-2])) + ' ' + f'<span class="title-phrase">{text(" ".join(words[-2:]))}:</span>'
    return f'{subject_html}<br>{phrases}'


def episode_body(ep, feed):
    slug = ep['slug']
    title = ep['title'].removesuffix(' | PC Magik Lab')
    repo = f'https://github.com/pcmagik/pcmagik-lab/tree/main/episodes/{slug}'
    body = [f'''<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Lab</a><span>/</span><a href="/episodes/">Episodes</a></nav>
<section class="episode-intro"><p class="eyebrow">THE EXPERIMENT / {text(ep['task'].upper())}</p><h1 class="page-title">{episode_heading(title)}</h1></section>''']
    grouped = defaultdict(list)
    for run in ep['measurements']:
        grouped[run['model']].append(run)
    for group_id, (model, runs) in enumerate(grouped.items()):
        body.append(f'<section class="episode-results" aria-label="{text(model)} results"><div class="result-hero glass"><div><p class="eyebrow">{text(model)}</p>{episode_result(runs)}<p class="measurement-note">Effects count CSS/JS constructs, not visual quality.</p></div><a class="button" href="#runs-{group_id}">Explore all {len(runs)} runs ↓</a></div>')
        group_ep = dict(ep, measurements=runs)
        body.append(home_comparison(group_ep, study_for(group_ep), f'comparison-{group_id}', detailed=True))
        previews = [r for r in ep['runs'] if r['model'] == model]
        if previews:
            body.append('<div class="output-previews runs">')
            for r in previews:
                color = r['wariant'] if r['wariant'] in ['bare', 'karpathy'] else 'other'
                body.append(f'''<div class="run spotlight"><a class="shot" href="/{text(r['strona'])}"><img src="/{text(r['zrzut'])}" alt="{text(model)} / {text(r['wariant'])} live output" loading="lazy"></a><div class="body"><div class="name"><b class="v-{color}">{text(r['wariant'].upper())}</b><span class="tag">Published output</span></div><div class="foot"><a href="/{text(r['strona'])}">Explore live output ↗</a><a href="/{text(r['zrzut'])}">Screenshot ↗</a></div></div></div>''')
            body.append('</div>')
        body.append(f'<div id="runs-{group_id}" class="section-head"><h2>Every run. Every result.</h2></div><div class="cohort-grid">')
        variants = dict.fromkeys(r['wariant'] for r in runs)
        for variant in variants:
            color = variant if variant in ['bare', 'karpathy'] else 'other'
            description = {'bare': 'NO RULES, NO EXTRAS', 'karpathy': 'ONE RULES FILE'}.get(variant, '')
            cohort = [r for r in runs if r['wariant'] == variant]
            body.append(f'<div class="cohort"><div class="cohort-heading"><h3 class="v-{color}">{text(variant.upper())}</h3><span>{text(description)} · n={len(cohort)}</span></div>')
            for i, r in enumerate(cohort, 1):
                metrics = ''.join(f'<div><strong>{number(r.get(key))}{suffix if r.get(key) is not None else ""}</strong><span>{label}</span></div>' for key, label, suffix in [('sekundy','time',' s'),('tokeny','output tokens',''),('myslenie_pct','thinking','%'),('tok_s','tok/s',''),('linie','lines of code','')])
                links = ''.join(f'<a href="/{text(r[key])}">{label} ↗</a>' for key,label in [('strona','Live output'),('zrzut','Screenshot')] if r.get(key))
                body.append(f'''<article class="run-result glass" data-run="{text(r['bieg'])}"><div class="run-result-head"><h4>Run {i:02}</h4><div class="run-effects v-{color}"><strong>{number(r.get('efekty'))}</strong><span>effects</span></div></div><div class="run-metrics">{metrics}</div><p class="run-id">{text(r['bieg'])}</p>{f'<div class="foot">{links}</div>' if links else ''}</article>''')
            body.append('</div>')
        body.append('</div><p class="measurement-note">output = thinking + final code. Lines of code show the page size the model chose, not the cost of equivalent work.</p></section>')
    if ep['youtube']:
        video = urlparse(ep['youtube'])
        video_id = video.path.strip('/') if video.hostname == 'youtu.be' else (parse_qs(video.query).get('v') or [video.path.split('/')[-1]])[0]
        if re.fullmatch(r'[A-Za-z0-9_-]{11}', video_id):
            body.append(f'<section class="episode-video"><h2>Watch the experiment.</h2><iframe src="https://www.youtube-nocookie.com/embed/{video_id}" title="{text(title)}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></section>')
        body.append(f'<a class="button" href="{text(ep["youtube"])}">Watch episode ↗</a>')
    body.append(f'''<section id="materials" class="episode-materials glass"><div id="task-prompt"><p class="eyebrow">REPRODUCE THE EXPERIMENT</p><h2>One prompt. All the evidence.</h2><p class="study-note">Compare runs within the same model. Inspect the shared prompt, settings and raw measurements in the repository.</p><a class="button" href="{repo}">Prompt &amp; test materials on GitHub ↗</a></div></section>''')
    return '\n'.join(body)


def study_for(ep):
    runs = ep['measurements']
    models = {r['model'] for r in runs}
    if len(models) != 1:
        return None
    cohorts = defaultdict(lambda: {'runs': []})
    for r in runs:
        cohorts[r['wariant']]['runs'].append({
            'id': r['bieg'], 'seconds': r.get('sekundy'), 'output_tokens': r.get('tokeny'),
            'tok_s': r.get('tok_s'), 'effects': r.get('efekty'),
            'thinking': r.get('myslenie_pct'), 'lines': r.get('linie'),
        })
    return {'model': next(iter(models)), 'cohorts': dict(cohorts)}


def duration(value):
    if value is None:
        return 'not measured yet'
    seconds = round(value)
    return f'{seconds // 60} min {seconds % 60:02} s'


def home_comparison(ep, study, ident, detailed=False):
    if study:
        cohorts = study['cohorts']
        model = study['model']
        groups = {v: group['runs'] for v, group in cohorts.items()}
        fields = ['seconds', 'output_tokens', 'tok_s', 'effects']
    else:
        groups = defaultdict(list)
        models = {r['model'] for r in ep['measurements']}
        if len(models) != 1:
            return '<p class="ep-subtitle">See the episode for comparisons within each model.</p>'
        model = next(iter(models))
        for run in ep['measurements']:
            groups[run['wariant']].append(run)
        fields = ['sekundy', 'tokeny', 'tok_s', 'efekty']
    if set(groups) != {'bare', 'karpathy'} or any(len(g) < 3 for g in groups.values()):
        return '<p class="ep-subtitle">Published examples; repeated ranges not measured yet in the supplied data.</p>'
    panels, buttons = [], []
    metrics = list(zip(['time', 'tokens', 'throughput', 'effects'], ['Time', 'output tokens', 'tok/s', 'Effects'], fields))
    if detailed:
        metrics = [metrics[-1]] + metrics[:-1] + [('thinking', 'thinking', 'thinking'), ('lines', 'lines of code', 'lines')]
    for i, (key, label, field) in enumerate(metrics):
        if any(r.get(field) is None for group in groups.values() for r in group):
            continue
        ranges = {v: (min(r[field] for r in g), max(r[field] for r in g)) for v, g in groups.items()}
        maximum = max(hi for lo, hi in ranges.values()) or 1
        rows = []
        for variant in ['bare', 'karpathy']:
            lo, hi = ranges[variant]
            if key == 'time':
                value = f'{round(lo)//60}:{round(lo)%60:02}–{round(hi)//60}:{round(hi)%60:02} min:s'
            elif key == 'throughput':
                value = f'{lo:.2f}–{hi:.2f} tok/s'
            else:
                value = f'{number(lo)}–{number(hi)}' + ('%' if key == 'thinking' else '')
            rows.append(f'<div class="compare-row"><span class="compare-label">{variant.upper()}</span><div class="bar-track" aria-hidden="true"><div class="bar-fill {variant}-bar" style="width:{hi/maximum*100:.4f}%"></div></div><strong class="compare-value">{value}</strong></div>')
        overlap = max(lo for lo, hi in ranges.values()) <= min(hi for lo, hi in ranges.values())
        summary = f'On {model}: ranges overlap; no demonstrated difference.' if overlap else f'On {model}: ranges do not overlap.'
        if key == 'effects' and ranges['karpathy'][1] < ranges['bare'][0]:
            bare_mean = sum(r[field] for r in groups['bare']) / len(groups['bare'])
            karpathy_mean = sum(r[field] for r in groups['karpathy']) / len(groups['karpathy'])
            reduction = round((1 - karpathy_mean / bare_mean) * 100)
            summary = f'On {model}: {reduction}% fewer counted effects on average; every Karpathy run below every bare run.'
        caveat = 'CSS/JS CONSTRUCTS, NOT VISUAL QUALITY' if key == 'effects' else 'OPEN-ENDED TASK / NOT EQUIVALENT-WORK COST'
        if key == 'thinking':
            caveat = 'output = thinking + final code'
        elif key == 'lines':
            caveat = 'PAGE SIZE CHOSEN BY THE MODEL, NOT COST'
        selected = not panels
        panels.append(f'<div data-metric-panel="{key}" id="{ident}-{key}"{ "" if selected else " hidden" }><div class="compare-rows">'+''.join(rows)+f'</div><div class="compare-footer"><p class="compare-summary">{text(summary)}</p><span>{caveat}</span></div></div>')
        buttons.append(f'<button type="button" data-metric="{key}" aria-controls="{ident}-{key}" aria-pressed="{str(selected).lower()}">{label}</button>')
    if not panels:
        return ''
    sample = ' / '.join(f'{v}: n={len(groups[v])}' for v in ['bare','karpathy'])
    return f'<div class="comparison" data-comparison><div class="compare-top"><h4>Repeated ranges · {sample}</h4><div class="metric-switch" role="group" aria-label="Compare a metric" hidden>'+''.join(buttons)+'</div></div><div aria-live="polite" aria-atomic="true">'+''.join(panels)+'</div></div>'


def home_cards(episodes, feed):
    result = []
    for ep in episodes:
        study = study_for(ep)
        day, date_label = episode_date(ep, feed['generated'])
        slug = ep['slug']
        models = ', '.join(dict.fromkeys(r['model'] for r in ep['runs']))
        title = ep['title'].split(' | ')[0]
        video = f'<a class="soon" href="{text(ep["youtube"])}">Watch episode ↗</a>' if ep['youtube'] else '<span class="soon"><span class="dot"></span>Video coming soon</span>'
        header = f'<article class="ep glass reveal" data-episode="{slug}"><div class="ep-h"><div><div class="ep-meta"><span class="chip">{text(slug.split("-")[0].upper())} / EXPERIMENT</span><time datetime="{day}">{date_label}: {day}</time><span>TASK: {text(ep["task"].upper())}</span></div><h3><a href="/episodes/{slug}/">{text(title)}</a></h3><p class="ep-subtitle">{text(models)} <span>/</span> Published model outputs</p></div><div class="episode-links">{video}<a class="button" href="/episodes/{slug}/">Test materials ↗</a></div></div>'
        representatives = ep['runs'] if len({r['model'] for r in ep['runs']}) == 1 else []
        previews = []
        for r in representatives[:2]:
            variant = r['wariant']
            color = variant if variant in ['bare','karpathy'] else 'other'
            description = {'bare':'NO RULES, NO EXTRAS','karpathy':'ONE RULES FILE'}.get(variant,'PUBLISHED OUTPUT')
            previews.append(f'''<div class="run spotlight"><a class="shot" href="/{text(r['strona'])}"><img src="/{text(r['zrzut'])}" alt="{text(r['model'])} {text(variant)} live output" loading="lazy"></a><div class="body"><div class="name"><b class="v-{color}">{text(variant.upper())}</b><span class="tag">{description}</span></div><div class="kv"><div><b>{duration(r.get('sekundy'))}</b><small>time</small></div><div><b>{number(r.get('tokeny'))}</b><small>output tokens</small></div><div><b>{number(r.get('myslenie_pct'))}{'%' if r.get('myslenie_pct') is not None else ''}</b><small>thinking</small></div><div><b>{number(r.get('linie'))}</b><small>lines of code</small></div></div><div class="foot"><a href="/{text(r['strona'])}">Open live demo ↗</a><a href="/{text(r['zrzut'])}">Screenshot</a><a href="/{text(r['metrics'])}">metrics.json</a><a href="/episodes/{slug}/#task-prompt">Prompt</a></div></div></div>''')
        notes = '<p class="ep-subtitle">Representative outputs only · output = thinking + final code.<br>Lines of code show the page size the model chose, not the cost of equivalent work. Effects count code constructs, not visual quality.</p>'
        result.append(header+home_comparison(ep,study,'home-'+slug)+'<div class="runs">'+''.join(previews)+'</div>'+notes+'</article>')
    return '\n'.join(result) or '<p class="ep-subtitle">No episodes published yet.</p>'


def build(check=False):
    feed = load()
    episodes = sorted(feed['episodes'], key=lambda ep: (episode_date(ep, feed['generated'])[0], ep['slug']), reverse=True)
    latest = episodes[0] if episodes else None
    model = latest['runs'][0]['model'].split('/')[-1] if latest and latest['runs'] else 'Explore the lab'
    model_parts = model.rsplit('-', 1)
    model_label = text(model_parts[0].capitalize()) + (f' <span>{text(model_parts[1].upper())}</span>' if len(model_parts) > 1 else '')
    variants = ' VS '.join(dict.fromkeys(r['wariant'].upper() for r in latest['runs'])) if latest else 'EXPLORE THE EPISODES'
    telemetry = f'<a class="telemetry telemetry-run glass" href="/episodes/{latest["slug"]+"/" if latest else ""}"><span class="tiny-label">LATEST EXPERIMENT <span>↗</span></span><strong>{model_label}</strong><small><span class="violet-dot"></span>{text(variants)}</small></a>'
    outputs = {'index.html': template('home.html', cards=home_cards(episodes[:3], feed), telemetry=telemetry, episode_count=f'{len(episodes):02}', prompt_link=f'/episodes/{latest["slug"]}/#task-prompt' if latest else '/episodes/')}
    listing = '<section><div class="section-head"><div><p class="eyebrow">THE EXPERIMENTS / ALL EPISODES</p><h1 class="page-title">The evidence.<br><span>One experiment at a time.</span></h1></div></div><p class="study-note">Newest run dates first. Each episode includes its published measurements, prompts and model outputs.</p><div class="episode-list">'+cards(episodes, feed)+'</div></section>'
    outputs['episodes/index.html'] = template('page.html', title='All episodes | PC Magik Lab', description='Published experiments, prompts and model outputs.', path='/episodes/', body=listing, episode_count=f'{len(episodes):02}')
    for ep in episodes:
        path = f'/episodes/{ep["slug"]}/'
        outputs[path.strip('/')+'/index.html'] = template('page.html', title=text(ep['title']), description=text(ep['opis']), path=path, body=episode_body(ep, feed), episode_count=f'{len(episodes):02}')
    outputs['assets/homepage-benchmarks.json'] = json.dumps(feed, ensure_ascii=False, indent=2, allow_nan=False)+'\n'
    # Complete validation and rendering before touching any published file.
    for filename in outputs:
        target = ROOT / filename
        if not target.resolve().is_relative_to(ROOT.resolve()) or (target.exists() and not target.is_file()):
            raise ValueError(f'Unsafe output path: {filename}')
    # Only withdraw previously generated wrappers, never raw model directories.
    obsolete = [p for p in (ROOT / 'episodes').glob('*/index.html')
                if not p.is_symlink() and p.resolve().is_relative_to(ROOT.resolve()) and p.relative_to(ROOT).as_posix() not in outputs
                and '<!-- Generated from data/episodes.json;' in p.read_text()]
    if check:
        if obsolete:
            raise ValueError('Obsolete generated episode pages remain')
        for filename, content in outputs.items():
            target = ROOT / filename
            if not target.is_file() or target.read_text() != content:
                raise ValueError(f'Generated file differs: {filename}; run bin/po-publikacji.sh')
    else:
        (ROOT / '.tmp').mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='publication-', dir=ROOT / '.tmp') as staging:
            for filename, content in outputs.items():
                staged = Path(staging) / filename
                staged.parent.mkdir(parents=True, exist_ok=True)
                staged.write_text(content)
            originals = {}
            try:
                for target in obsolete:
                    originals[target] = target.read_bytes()
                    target.unlink()
                for filename in outputs:
                    target = ROOT / filename
                    originals[target] = target.read_bytes() if target.exists() else None
                    target.parent.mkdir(parents=True, exist_ok=True)
                    os.replace(Path(staging) / filename, target)
            except OSError:
                for target, content in originals.items():
                    if content is None:
                        target.unlink(missing_ok=True)
                    else:
                        target.write_bytes(content)
                raise
    print(f'PASS feed build: {len(episodes)} episodes, {sum(len(ep["measurements"]) for ep in episodes)} measurements, {sum(len(ep["runs"]) for ep in episodes)} published outputs; HTML and snapshot {"verified" if check else "rebuilt"}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    try:
        build(parser.parse_args().check)
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f'Publication build failed: {error}', file=sys.stderr)
        sys.exit(1)
