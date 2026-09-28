"""Build the static lab from the publisher's local feed, with no external repository access."""
import argparse
from collections import Counter, defaultdict
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
CLOUDFLARE_ANALYTICS_TOKEN = '07bc67564faa42ceb381c751c2b66861'


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
    if home and values.get('episode_count') == '00':
        content = content.replace('<a href="/episodes/">Read the task ↗</a> or open', 'Open')
    path = values.get("path", "/")
    episodes_current = ' aria-current="page"' if path == "/episodes/" else ' aria-current="true"' if path.startswith("/episodes/") else ""
    context = dict(values, body=content, analytics_token=CLOUDFLARE_ANALYTICS_TOKEN, asset_prefix='' if home else '/',
                   home_url='./' if home else '/', episodes_current=episodes_current,
                   benchmarks_url='#episodes' if home else '/#episodes',
                   episodes_counter=f' <sup>{values["episode_count"]}</sup>' if values['episode_count'] != '00' else '',
                   extra_styles='' if home else '  <link rel="stylesheet" href="/assets/interior.css">\n')
    card = values.get('social_card')
    context.update(social_image='https://lab.pcmagik.pl/' + text(card) if card else 'https://lab.pcmagik.pl/assets/avatar-400.png',
                   social_width='1200' if card else '400', social_height='630' if card else '400',
                   social_alt=values['title'] if card else 'PC Magik Lab logo',
                   twitter_card='summary_large_image' if card else 'summary')
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


def episode_prompt(path, slug):
    # Episode-level prompts have three segments; run artifacts require four.
    if path != f'episodes/{slug}/prompt.txt':
        raise ValueError(f'{slug}: invalid episode prompt_file path {path!r}')
    target = ROOT / path
    if target.is_symlink() or not target.resolve().is_relative_to(ROOT.resolve()) or not target.is_file():
        raise ValueError(f'{slug}: missing or unsafe prompt_file')
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
        if episode.get('social_card') is not None:
            card = episode['social_card']
            if card != f'episodes/{slug}/card.jpg':
                raise ValueError(f'{slug}: invalid social_card path {card!r}')
            target = ROOT / card
            if target.is_symlink() or not target.resolve().is_relative_to(ROOT.resolve()) or not target.is_file():
                raise ValueError(f'{slug}: missing or unsafe social_card')
        if episode.get('prompt_file') is not None:
            episode_prompt(episode['prompt_file'], slug)
        if episode.get('task_file') is not None:
            task = episode['task_file']
            if not isinstance(task, str) or not re.fullmatch(r'tasks/[A-Za-z0-9_.-]+\.txt', task) or not (ROOT/task).is_file() or (ROOT/task).is_symlink():
                raise ValueError(f'{slug}: invalid task_file')
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
            rules = (run.get('odtworzenie') or {}).get('rules')
            if rules is not None:
                artifact(rules, slug)
                if (ROOT / rules).is_symlink():
                    raise ValueError(f'{slug}: unsafe rules symlink')
            for key in ['strona', 'zrzut', 'zrzut_390', 'zrzut_390_kadr']:
                if run.get(key):
                    artifact(run[key], slug)
            if run.get('checks'):
                checks = run['checks']
                evidence = json.loads(artifact(checks.get('plik'), slug).read_text())
                if checks.get('passed') != evidence.get('score') or checks.get('total') != evidence.get('total'):
                    raise ValueError(f'{slug}: checks differ from grader evidence')
                if any(type(checks.get(k)) is not int for k in ['passed', 'total']) or not 0 <= checks['passed'] <= checks['total']:
                    raise ValueError(f'{slug}: invalid checks score')
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


def publication_time(episode):
    """Display only an explicit publication date, never a measurement fallback."""
    day = episode.get('published')
    if not day:
        return '<span>Publication date: not measured yet</span>'
    date.fromisoformat(day)
    return f'<time datetime="{day}">Published {day}</time>'


EMPTY_FEED = 'First results will arrive with the first film.'


def episode_number(ep):
    """Only a two-digit film prefix constitutes an episode number."""
    match = re.match(r'^(\d{2})-', ep['slug'])
    return f'<span class="chip episode-number">EP {match[1]}</span>' if match else ''


def cards(episodes, feed):
    # Match the homepage's three-card height grouping even in longer archives.
    teasers = [episode_teaser(ep, feed, i == 0) for i, ep in enumerate(episodes)]
    return '\n'.join('<div class="episode-teasers">' + '\n'.join(teasers[i:i + 3]) + '</div>'
                     for i in range(0, len(teasers), 3))


def episode_result(runs):
    """Conclude only from complete, repeated, non-overlapping effect ranges."""
    groups = {v: [r.get('efekty') for r in runs if r['wariant'] == v] for v in ['bare', 'karpathy']}
    if any(len(g) < 3 or any(x is None for x in g) for g in groups.values()):
        return '<span class="result-verdict">Repeated effect comparison: not measured yet</span>'
    bare, karpathy = groups['bare'], groups['karpathy']
    below = sum(value < min(bare) for value in karpathy)
    above = sum(value > max(bare) for value in karpathy)
    change = round((sum(karpathy)/len(karpathy) / (sum(bare)/len(bare)) - 1) * 100) if sum(bare) else None
    repeat = f'{below} / {len(karpathy)} Karpathy runs below every bare run'
    if below == len(karpathy):
        value, caption = f'−{abs(change)}%', 'fewer counted effects'
        repeat += ' · mean reduction'
    elif above == len(karpathy):
        value = f'+{change}%' if change is not None else f'{above} / {len(karpathy)}'
        caption = 'more counted effects'
        repeat = f'{above} / {len(karpathy)} Karpathy runs above every bare run'
    else:
        return '<span class="result-verdict">Ranges overlap · no demonstrated difference</span>'
    return f'<span class="result-verdict">{value} {caption} · {repeat}</span>'


CLASSES = {'karpathy-mniej': 'Every Karpathy run below every bare run',
           'nakladaja-sie': 'Ranges overlap · no demonstrated difference',
           'karpathy-wiecej': 'Every Karpathy run above every bare run',
           'brak-danych': 'No complete comparison', 'jeden-wariant': 'One variant'}


def thesis_result(ep):
    thesis = ep['thesis']
    verdict = text(thesis['claim'])
    if ep.get('kind') == 'para-wariantow':
        model = thesis['models'][0]
        change = model.get('zmiana_sredniej_pct')
        if model['class'] in ('karpathy-mniej', 'karpathy-wiecej') and change is not None:
            percentage = f'{change:+.1f}%'.replace('-', '−')
            verdict += f' · {percentage} mean change'
    elif ep.get('kind') == 'pixel' and thesis.get('pary'):
        verdict += ' · ' + ' · '.join(
            f"{text(p['wariant'].upper())}: {p['rozstrzygniete']} / {p['wszystkie']} model pairs with separated ranges"
            for p in thesis['pary'])
    elif ep.get('kind') == 'pixel':
        ranges = []
        for model in thesis['models']:
            for variant in ['bare', 'karpathy']:
                measured = model.get(variant)
                if measured:
                    ranges.append(f'<span class="v-{variant}">{text(model["model"])} · {variant.upper()}: {number(measured["min"])}–{number(measured["max"])}</span>')
        if ranges:
            verdict += ' · ' + ' · '.join(ranges) + f' checks / {thesis["total"]}'
    return f'<span class="result-verdict">{verdict}</span>'


def table_samples(ep):
    return {v: Counter(m[v]['n'] for m in ep['thesis']['models'] if m.get(v)).most_common(1)[0][0]
            for v in ['bare', 'karpathy'] if any(m.get(v) for m in ep['thesis']['models'])}


def model_table(ep):
    rows = []
    samples = table_samples(ep)
    has_overlap = any(m['class'] == 'nakladaja-sie' for m in ep['thesis']['models'])
    for model in ep['thesis']['models']:
        cells = []
        for variant in ['bare', 'karpathy']:
            r = model.get(variant)
            value = f"{number(r['min'])}–{number(r['max'])}" if r else '—'
            if r and r['n'] != samples[variant]:
                value += f" · n={r['n']}"
            cells.append(f'<td class="v-{variant}">{value}</td>')
        overlap = model['class'] == 'nakladaja-sie'
        row_class = 'model-summary' + (' result-separated' if has_overlap and model['class'] in ('karpathy-mniej', 'karpathy-wiecej') else '')
        verdict = 'overlap' if overlap else CLASSES[model['class']]
        result_class = 'result-overlap' if overlap else 'model-verdict'
        rows.append(f'<tr class="{row_class}"><th scope="row">{text(model["model"])}{selection_note(ep, model["model"])}</th>'+''.join(cells)+f'<td class="{result_class}">{text(verdict)}</td></tr>')
    caption = f"Checks passed / {ep['thesis']['total']}" if ep['thesis']['metric'] == 'checks' else 'Counted effects · CSS/JS constructs, not visual quality'
    headings = ''.join(f'<th class="v-{v}">{v.upper()}' + (f' · n={samples[v]}' if v in samples else '') + '</th>' for v in ['bare', 'karpathy'])
    note = '<p class="table-verdict">Overlap: Ranges overlap · no demonstrated difference. This does not establish equivalence.</p>' if has_overlap else ''
    collapsible = ep.get('kind') == 'zbiorczy' and has_overlap and any('result-separated' in row for row in rows)
    control = (f'<button class="button model-table-toggle" data-model-toggle data-model-count="{len(rows)}" '
               'aria-expanded="true" aria-controls="model-results" hidden>Show fewer models ▾</button>') if collapsible else ''
    table_id = ' id="model-results"' if collapsible else ''
    return f'<div class="model-table-wrap"><table class="model-table"{table_id}><caption>{caption}</caption><thead><tr><th>Model</th>{headings}<th>Result</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table></div>'+control+note


def model_count(count):
    return f'{count} model' + ('' if count == 1 else 's')


def model_label(ep):
    models = list(dict.fromkeys(r['model'] for r in ep['measurements']))
    return models[0] if len(models) == 1 else model_count(len(models))


def result_card(runs, href, ep=None):
    """The same result tile on the home, archive and episode pages."""
    model = ('COMPARISON RESULTS' if len({r['model'] for r in runs}) > 1 else model_label(ep)) if ep else runs[0]['model']
    result = thesis_result(ep) if ep and ep.get('thesis') else episode_result(runs)
    note = 'Checks measure completed requirements.' if ep and ep.get('kind') == 'pixel' else 'Effects count CSS/JS constructs, not visual quality.'
    return f'<div class="result-hero glass" data-fx="fx-border fx-pulse"><div><p class="eyebrow">{text(model)}</p>{result}<p class="measurement-note">{note}</p></div><a class="button" href="{text(href)}">Explore all {len(runs)} runs ↓</a></div>'


def thinking(value):
    return 'not measured yet' if value is None else f'{value:.1f}%'


def effort_text(run):
    effort = run.get('effort', {})
    requested = effort.get('zadany', run.get('effort_zadany')) or 'unknown'
    received = effort.get('otrzymany', run.get('effort_otrzymany')) or 'unknown'
    note = ' · differs from requested effort' if received != 'unknown' and received != requested else ''
    source_label = effort.get('zrodlo') or ''
    if '/' in source_label or '\\' in source_label:
        source_label = 'LM Studio server log'
    source = f" · source: {source_label}" if source_label else ''
    return f'Effort requested: {requested}; received: {received}{note}{source}. Effort is not comparable across models.'


def effort_note(run):
    return f'<p class="effort-note">{text(effort_text(run))}</p>'


def episode_heading(ep):
    """Use the publisher's film title without rebuilding it from run metadata."""
    return text(ep['title'])


def episode_description(ep):
    # Keep the opening story in view without repeating the long method section.
    opening = re.split(r'(?<=[.!?])\s+(?=[A-Z])', ep['opis'])[0]
    story = f'<p class="episode-description">{text(opening)}</p>'
    if model_label(ep) not in ep.get('thesis', {}).get('claim', ''):
        story = f'<p class="episode-subject">{text(model_label(ep))}</p>' + story
    # A unique score explicitly present in the story links to its evidence.
    scores = re.findall(r'(?<![\d/])(\d+)\s*/\s*(\d+)(?![\d/])', opening)
    for passed, total in dict.fromkeys(scores):
        matches = [r for r in ep['measurements'] if r.get('checks', {}).get('passed') == int(passed)
                   and r['checks']['total'] == int(total)]
        if len(matches) == 1:
            r = matches[0]
            story += f'<p class="story-evidence">{passed} / {total}: <a href="#run-{text(r["bieg"])}">{text(r["bieg"])}</a></p>'
    return story


def selection_note(ep, model):
    notes = []
    for cohort in ep['cohorts']:
        if cohort['model'] != model or not cohort.get('wybor') or cohort.get('n_w_badaniu', cohort['n']) <= cohort['n']:
            continue
        rule = {'seria/film/build_seria.py:13-jeden-model': 'lowest, middle, highest — as in the film'}.get(cohort['wybor'], 'selected as in the film')
        note = f"{cohort['n']} of {cohort['n_w_badaniu']} runs ({rule})"
        if note not in notes:
            notes.append(note)
    return ''.join(f'<p class="selection-note">{text(note)}</p>' for note in notes)


def reproduction_settings(ep):
    """Show every recorded setting, once per model and distinct value."""
    if not any(r.get('odtworzenie') for r in ep['measurements']):
        return ''
    fields = [('model', 'Model'), ('quantization', 'Quantization'),
              ('context_window', 'Context window'), ('kv_cache', 'K/V cache'),
              ('max_tokens', 'max_tokens'), ('engine', 'Engine'),
              ('harness', 'Harness'), ('effort', 'Effort requested')]
    grouped = defaultdict(list)
    for run in ep['measurements']:
        record = run.get('odtworzenie') or {}
        grouped[record.get('model')].append(record)
    rows = []
    headings = ''.join(f'<th scope="col">{label}</th>' for key, label in fields)
    thesis_models = ep.get('thesis', {}).get('models', [])
    has_overlap = any(m['class'] == 'nakladaja-sie' for m in thesis_models)
    separated = {m['model'] for m in thesis_models if has_overlap and m['class'] in ('karpathy-mniej', 'karpathy-wiecej')}
    highlighted = {r.get('odtworzenie', {}).get('model') for r in ep['measurements'] if r['model'] in separated}
    for model, records in grouped.items():
        cells = []
        for key, label in fields:
            values = {}
            for record in records:
                value = record.get(key)
                source = None
                if isinstance(value, dict):
                    source = value.get('source')
                    if source:
                        source = re.sub(r'(?:,\s*)?\bseria/[^\s;,()]+', '', source)
                        source = re.sub(r'\s*\(\s*\)', '', source).strip()
                    value = value.get('value')
                sources = values.setdefault(value, [])
                if source and source not in sources:
                    sources.append(source)
            parts = []
            for value, sources in values.items():
                display = 'not recorded' if value is None else number(value) if isinstance(value, int) else text(value)
                title = f' title="{text("; ".join(sources))}"' if sources else ''
                parts.append(f'<span{title}>{display}</span>')
            tag = 'th' if key == 'model' else 'td'
            scope = ' scope="row"' if key == 'model' else ''
            cells.append(f'<{tag}{scope} data-field="{key}">' + '<br>'.join(parts) + f'</{tag}>')
        emphasis = ' result-separated' if model in highlighted else ''
        rows.append(f'<details class="reproduction-model{emphasis}"><summary>{text(model)}</summary>'
                    '<div class="reproduction-scroll" tabindex="0" role="region" aria-label="Reproduction settings">'
                    '<table class="reproduction-table"><caption>Run settings by model</caption>'
                    f'<thead><tr>{headings}</tr></thead><tbody><tr data-model="{text(model)}">'
                    + ''.join(cells) + '</tr></tbody></table></div></details>')
    links = []
    rules = dict.fromkeys((r.get('odtworzenie') or {}).get('rules')
                          for r in ep['measurements'] if r['wariant'] == 'karpathy')
    links.extend(f'<a class="button" href="/{text(path)}">Karpathy rules file ↗</a>'
                 for path in rules if path)
    return ('<section id="reproduce" class="reproduction">'
            '<h2>How to reproduce</h2>'
            '<p class="study-note">Settings recorded for these runs. Multiple values show differences between runs. '
            'Effort is requested, not necessarily received; it is not comparable across models. '
            '<span class="hover-instruction">Hover over quantization, K/V cache or engine values for their sources.</span></p>'
            + ''.join(rows) +
            '<div class="actions">' + ''.join(links) + '</div></section>')


def episode_body(ep, feed):
    slug = ep['slug']
    title = ep['title'].removesuffix(' | PC Magik Lab')
    repo = f'https://github.com/pcmagik/pcmagik-lab/tree/main/episodes/{slug}'
    body = [f'''<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Lab</a><span>/</span><a href="/episodes/">Episodes</a></nav>
<section class="episode-intro"><div class="ep-meta">{episode_number(ep)}{publication_time(ep)}</div><h1 class="page-title">{episode_heading(ep)}</h1>{episode_description(ep)}</section>''']
    grouped = defaultdict(list)
    for run in ep['measurements']:
        grouped[run['model']].append(run)
    compact = ep.get('kind') == 'zbiorczy' or (ep.get('kind') == 'pixel' and ep['thesis']['summary']['models'] > 1)
    if compact:
        body.append('<section class="episode-results ep glass" aria-label="Episode results">')
        body.append(result_card(ep['measurements'], '#all-runs', ep))
        body.append('<section id="all-runs" class="model-details">')
        body.append('<div class="section-head"><h2>Every run. Every result.</h2></div>')
    for group_id, (model, runs) in enumerate(grouped.items()):
        if compact:
            body.append(f'<details class="model-runs glass" name="model-runs"><summary>{text(model)} · {len(runs)} runs</summary>')
        body.append(f'<section class="{"model-results" if compact else "episode-results ep glass"}" aria-label="{text(model)} results">'+('' if compact else result_card(runs, '#all-runs', ep)))
        group_ep = dict(ep, measurements=runs)
        if ep.get('thesis'):
            group_ep['thesis'] = dict(ep['thesis'], models=[m for m in ep['thesis']['models'] if m['model'] == model])
        if ep.get('kind') == 'zbiorczy':
            category = group_ep['thesis']['models'][0]['class']
            group_ep['thesis']['claim'] = {
                'nakladaja-sie': 'Ranges overlap (counted effects)',
                'karpathy-mniej': 'Karpathy below every bare run (counted effects)',
                'karpathy-wiecej': 'Karpathy above every bare run (counted effects)',
            }.get(category, CLASSES[category])
        body.append(selection_note(ep, model))
        body.append(home_comparison(group_ep, study_for(group_ep), f'comparison-{group_id}', detailed=True))
        previews = [r for r in ep['runs'] if r['model'] == model]
        for cohort in ep['cohorts']:
            if cohort['model'] == model and 'reprezentant' in cohort and cohort['reprezentant'] is None:
                body.append(f'<p class="representative-reason">{text(cohort["wariant"].upper())}: {text(cohort.get("reprezentant_powod") or "No representative available")}</p>')
        if previews:
            body.append('<div class="output-previews runs">')
            body.extend(preview_card(r, slug, ep.get("prompt_file")) for r in previews)
            body.append('</div>')
        if not compact:
            body.append('<div id="all-runs" class="section-head"><h2>Every run. Every result.</h2></div>')
        body.append('<div class="cohort-grid">')
        variants = dict.fromkeys(r['wariant'] for r in runs)
        for variant in variants:
            color = variant if variant in ['bare', 'karpathy'] else 'other'
            description = {'bare': 'NO RULES, NO EXTRAS', 'karpathy': 'ONE RULES FILE'}.get(variant, '')
            cohort = [r for r in runs if r['wariant'] == variant]
            sample = f' · n={len(cohort)}'
            body.append(f'<div class="cohort"><div class="cohort-heading"><h3 class="v-{color}">{text(variant.upper())}</h3><span>{text(description)}{sample}</span></div>')
            for i, r in enumerate(cohort, 1):
                metrics = ''.join(f'<div><strong>{duration(r.get(key)) if key == 'sekundy' else thinking(r.get(key)) if key == 'myslenie_pct' else number(r.get(key))}</strong><span>{label}</span></div>' for key, label, suffix in [('sekundy','time',' s'),('tokeny','output tokens',''),('myslenie_pct','thinking','%'),('tok_s','tok/s',''),('linie','lines of code','')])
                links = evidence_links(r)
                if ep.get('prompt_file') is None and 'prompt_file' in ep:
                    links += f'<a href="/{text(r["prompt"])}">Prompt ↗</a>'
                body.append(f'''<article class="run-result glass" id="run-{text(r['bieg'])}" data-run="{text(r['bieg'])}"><div class="run-result-head"><h4>Run {r.get("powtorzenie", f"{i:02}")}</h4><div class="run-effects v-{color}"><strong>{run_score(r)}</strong><span>{'checks' if ep.get('kind') == 'pixel' else 'effects'}</span></div></div><div class="run-metrics">{metrics}</div>{effort_note(r)}<p class="run-id">{text(r['bieg'])}</p>{f'<div class="foot">{links}</div>' if links else ''}</article>''')
            body.append('</div>')
        body.append('</div><p class="measurement-note">output = thinking + final code. Lines of code show the page size the model chose, not the cost of equivalent work.</p></section>')
        if compact:
            body.append('</details>')
    if compact:
        body.append('</section>')
        body.append('<p class="measurement-note">Sample sizes in the table below apply to all run metrics. Overlap means no demonstrated difference, not equivalence.</p>')
        body.append(home_comparison(ep, None, 'aggregate') if ep.get('kind') == 'pixel' else model_table(ep))
        body.append('</section>')
    body.append(reproduction_settings(ep))
    if ep['youtube']:
        video = urlparse(ep['youtube'])
        video_id = video.path.strip('/') if video.hostname == 'youtu.be' else (parse_qs(video.query).get('v') or [video.path.split('/')[-1]])[0]
        if re.fullmatch(r'[A-Za-z0-9_-]{11}', video_id):
            body.append(f'<section class="episode-video"><h2>Watch the experiment.</h2><iframe src="https://www.youtube-nocookie.com/embed/{video_id}" title="{text(title)}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></section>')
        body.append(f'<a class="button" href="{text(ep["youtube"])}">Watch episode ↗</a>')
    materials = f'<a class="button" href="{repo}">Test materials on GitHub ↗</a>'
    if ep.get('prompt_file'):
        materials = f'<a class="button" href="/{text(ep["prompt_file"])}">Prompt ↗</a>' + materials
    if ep.get('task_file'):
        materials += f'<a class="button" href="/{text(ep["task_file"])}">Task ↗</a>'
    body.append(f'''<section id="materials" class="episode-materials glass fx-aurora"><div id="task-prompt"><p class="eyebrow">REPRODUCE THE EXPERIMENT</p><h2>One prompt.<br>All the evidence.</h2><p class="study-note">Compare runs within the same model. Inspect the shared prompt, settings and raw measurements in the repository.</p><div class="actions">{materials}</div></div></section>''')
    return '\n'.join(body)


def run_score(run):
    checks = run.get('checks')
    if checks:
        return f'<a href="/{text(checks["plik"])}">{checks["passed"]} / {checks["total"]}</a>'
    return number(run.get('efekty'))


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
    return f'{seconds // 60}:{seconds % 60:02} min:s'


def thesis_comparison(ep, ident):
    thesis = ep['thesis']
    sizes = sorted({m[v]['n'] for m in thesis['models'] for v in ['bare', 'karpathy'] if m.get(v)})
    sample_in_heading = ep.get('_sample_in_heading') and len(sizes) == 1
    key, label = ('checks', 'Checks') if thesis['metric'] == 'checks' else ('effects', 'Effects')
    rows = []
    maximum = max((m[v]['max'] for m in thesis['models'] for v in ['bare', 'karpathy'] if m.get(v)), default=1) or 1
    for m in thesis['models']:
        for v in ['bare', 'karpathy']:
            r = m.get(v)
            if not r:
                continue
            suffix = f" / {thesis['total']}" if key == 'checks' else ''
            name = text(m["model"])+" · " if len(thesis["models"]) > 1 else ""
            shared_sample = sample_in_heading or ep.get('_table_samples', {}).get(v) == r['n']
            sample = '' if shared_sample else f' · n={r["n"]}'
            rows.append(f'<div class="compare-row"><span class="compare-label v-{v}">{name}<span class="variant-sample">{v.upper()}{sample}</span></span><div class="bar-track" aria-hidden="true"><div class="bar-fill {v}-bar" style="width:{r["max"]/maximum*100:.4f}%"></div></div><strong class="compare-value">{number(r["min"])}–{number(r["max"])}{suffix}</strong></div>')
    caveat = 'Checks measure completed requirements.' if key == 'checks' else 'CSS/JS CONSTRUCTS, NOT VISUAL QUALITY'
    button = f'<button type="button" data-metric="{key}" aria-controls="{ident}-{key}" aria-pressed="true">{label}</button>'
    claim = 'Overlap' if ep.get('_concise_verdict') and all(m['class'] == 'nakladaja-sie' for m in thesis['models']) else thesis['claim']
    panel = f'<div data-metric-panel="{key}" id="{ident}-{key}"><div class="compare-rows">'+''.join(rows)+f'</div><div class="compare-footer"><p class="compare-summary">{text(claim)}</p><span>{caveat}</span></div></div>'
    # Secondary metrics are only compared within one model, never across models.
    if len(thesis['models']) == 1:
        legacy = dict(ep)
        legacy.pop('thesis')
        extra = home_comparison(legacy, study_for(legacy), ident)
        for b in re.findall(r'<button .*?</button>', extra):
            if f'data-metric="{key}"' not in b and 'data-metric="effects"' not in b:
                button += b.replace('aria-pressed="true"', 'aria-pressed="false"')
        for p in re.findall(r'(<div data-metric-panel="([^"]+)".*?</span></div></div>)', extra):
            if p[1] not in (key, 'effects'):
                panel += p[0].replace(f'id="{ident}-{p[1]}"', f'id="{ident}-{p[1]}" hidden') if ' hidden' not in p[0].split('>')[0] else p[0]
    sample_heading = ''
    if sample_in_heading:
        sample_heading = ' · ' + ' / '.join(f'n={n}' for n in sizes) + ' per variant'
    aggregate = ' aggregate-comparison' if len(thesis['models']) > 1 else ''
    return f'<div class="comparison{aggregate}" data-comparison><div class="compare-top"><h4>Repeated ranges{sample_heading}</h4><div class="metric-switch" role="group" aria-label="Compare a metric" hidden>{button}</div></div><div aria-live="polite" aria-atomic="true">{panel}</div></div>'


def home_comparison(ep, study, ident, detailed=False):
    if ep.get('thesis'):
        if ep['thesis']['metric'] == 'efekty' and len(ep['thesis']['models']) > 1:
            return model_table(ep)
        return thesis_comparison(ep, ident)
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
                value = duration(lo).removesuffix(' min:s') + '–' + duration(hi)
            elif key == 'throughput':
                value = f'{lo:.2f}–{hi:.2f} tok/s'
            else:
                value = thinking(lo) + '–' + thinking(hi) if key == 'thinking' else f'{number(lo)}–{number(hi)}'
            rows.append(f'<div class="compare-row"><span class="compare-label v-{variant}">{variant.upper()}</span><div class="bar-track" aria-hidden="true"><div class="bar-fill {variant}-bar" style="width:{hi/maximum*100:.4f}%"></div></div><strong class="compare-value">{value}</strong></div>')
        overlap = max(lo for lo, hi in ranges.values()) <= min(hi for lo, hi in ranges.values())
        summary = f'On {model}: ranges overlap; no demonstrated difference.' if overlap else f'On {model}: ranges do not overlap.'
        if overlap and ep.get('_concise_verdict'):
            summary = 'Overlap'
        if key == 'effects' and ranges['karpathy'][1] < ranges['bare'][0]:
            bare_mean = sum(r[field] for r in groups['bare']) / len(groups['bare'])
            karpathy_mean = sum(r[field] for r in groups['karpathy']) / len(groups['karpathy'])
            reduction = round((1 - karpathy_mean / bare_mean) * 100)
            summary = f'On {model}: {reduction}% fewer counted effects on average; every Karpathy run below every bare run.'
        caveat = 'CSS/JS CONSTRUCTS, NOT VISUAL QUALITY' if key == 'effects' else 'OPEN-ENDED TASK / NOT EQUIVALENT-WORK COST'
        if key == 'thinking':
            caveat = 'output = thinking + final code. ' + text(' '.join(dict.fromkeys(effort_text(r) for r in ep['measurements'])))
        elif key == 'lines':
            caveat = 'PAGE SIZE CHOSEN BY THE MODEL, NOT COST'
        selected = not panels
        panels.append(f'<div data-metric-panel="{key}" id="{ident}-{key}"{ "" if selected else " hidden" }><div class="compare-rows">'+''.join(rows)+f'</div><div class="compare-footer"><p class="compare-summary">{text(summary)}</p><span>{caveat}</span></div></div>')
        buttons.append(f'<button type="button" data-metric="{key}" aria-controls="{ident}-{key}" aria-pressed="{str(selected).lower()}">{label}</button>')
    if not panels:
        return ''
    sample = ' / '.join(f'{v}: n={len(groups[v])}' for v in ['bare','karpathy'])
    return f'<div class="comparison" data-comparison><div class="compare-top"><h4>Repeated ranges · {sample}</h4><div class="metric-switch" role="group" aria-label="Compare a metric" hidden>'+''.join(buttons)+'</div></div><div aria-live="polite" aria-atomic="true">'+''.join(panels)+'</div></div>'


def preview_picture(r):
    variant = r['wariant']
    picture = f'<img data-preview="{'pixel' if r.get('checks') else 'page'}" src="/{text(r["zrzut"])}" alt="{text(r["model"])} {text(variant)} live output" loading="lazy">'
    mobile = r.get('zrzut_390_kadr') or r.get('zrzut_390')
    if r.get('zrzut_390_kadr'):
        picture = picture.replace('<img ', '<img data-mobile-crop="publisher" ')
    if mobile:
        picture = f'<picture><source media="(max-width: 600px)" srcset="/{text(mobile)}">{picture}</picture>'
    if r.get('zrzut_pusty'):
        picture = '<span class="preview-placeholder">Preview unavailable<br>Open the live output ↗</span>'
    return picture


def evidence_links(run):
    labels = [('strona', 'Live output ↗'), ('zrzut', 'Screenshot ↗'), ('metrics', 'metrics.json')]
    return ''.join(f'<a href="/{text(run[key])}">{label}</a>' for key, label in labels if run.get(key))


def preview_card(r, slug, prompt_file=None):
    """One published-output component for every page."""
    variant = r['wariant']
    color = variant if variant in ['bare', 'karpathy'] else 'other'
    description = {'bare': 'NO RULES, NO EXTRAS', 'karpathy': 'ONE RULES FILE'}.get(variant, 'PUBLISHED OUTPUT')
    prompt_link = '' if prompt_file else f'<a href="/{text(r["prompt"])}">Prompt ↗</a>'
    picture = preview_picture(r)
    return f'''<div class="run spotlight"><a class="shot" href="/{text(r['strona'])}">{picture}</a><div class="body"><div class="name"><b class="v-{color}">{text(variant.upper())}</b><span class="tag">{description}</span></div><div class="kv">{f'<div><b>{run_score(r)}</b><small>checks</small></div>' if r.get("checks") else ""}<div><b>{duration(r.get('sekundy'))}</b><small>time</small></div><div><b>{number(r.get('tokeny'))}</b><small>output tokens</small></div><div><b>{thinking(r.get('myslenie_pct'))}</b><small>thinking</small></div><div><b>{number(r.get('linie'))}</b><small>lines of code</small></div>{effort_note(r)}</div><div class="foot">{evidence_links(r)}{prompt_link}</div></div></div>'''


def episode_teaser(ep, feed, latest=False):
    slug = text(ep['slug'])
    title = text(ep['title'].split(' | ')[0])
    return f'''<article class="ep ep-teaser glass reveal fx-border{" fx-comet" if latest else ""}" data-episode="{slug}"><div class="ep-h"><div><div class="ep-meta">{episode_number(ep)}{publication_time(ep)}</div><h3><a href="/episodes/{slug}/">{title}</a></h3><p class="ep-subtitle">{text(model_label(ep))}</p></div><a class="button" href="/episodes/{slug}/">See the results →</a></div></article>'''


def home_cards(episodes, feed):
    """Use the same result-free invitation for every kind of episode."""
    result = [episode_teaser(ep, feed, i == 0) for i, ep in enumerate(episodes)]
    return '<div class="episode-teasers">' + '\n'.join(result) + '</div>' if result else '<p class="ep-subtitle">No episodes published yet.</p>'


def method_samples(episodes):
    counts = []
    for ep in episodes:
        groups = defaultdict(int)
        for run in ep['measurements']:
            groups[(run['model'], run['wariant'])] += 1
        counts.extend(groups.values())
    repeated = sorted(set(n for n in counts if n >= 3))
    if not repeated:
        return 'Repeat each variant and compare the measured ranges.'
    sizes = ' / '.join(f'n={n}' for n in repeated)
    return f'Published cohorts: {sizes} per variant. See each episode for cohort details.'


def build(check=False):
    feed = load()
    def publication_order(ep):
        published = ep.get('published', episode_date(ep, feed['generated'])[0])
        date.fromisoformat(published)
        number_match = re.match(r'^(\d+)-', ep['slug'])
        return published, int(number_match[1]) if number_match else -1, ep['slug']

    episodes = sorted(feed['episodes'], key=publication_order, reverse=True)
    latest = episodes[0] if episodes else None
    model = model_label(latest).split('/')[-1] if latest else 'Explore the lab'
    model_parts = model.rsplit('-', 1)
    hero_model = text(model_parts[0].capitalize()) + (f' <span>{text(model_parts[1].upper())}</span>' if len(model_parts) > 1 else '')
    variants = ' VS '.join(f'<span class="v-{text(v)}">{text(v.upper())}</span>' for v in dict.fromkeys(r['wariant'] for r in latest['runs'])) if latest else 'BROWSE EPISODES'
    telemetry_title = 'LATEST EXPERIMENT' if latest else 'EXPLORE THE LAB'
    telemetry = f'<a class="telemetry telemetry-run glass" href="/episodes/{latest["slug"]+"/" if latest else ""}" data-fx="fx-border fx-glass"><span class="tiny-label">{telemetry_title} <span>↗</span></span><strong>{hero_model}</strong><small><span class="violet-dot"></span>{variants}</small>{f"<small>{publication_time(latest)}</small>" if latest else ""}</a>'
    latest_section = (ROOT / 'bin/templates/latest.html').read_text().replace('{{cards}}', home_cards(episodes[:3], feed)).replace('{{episode_count}}', f'{len(episodes):02}') if episodes else f'<section id="episodes" class="empty-experiments" aria-labelledby="experiments-title"><p class="eyebrow"><span class="section-number">01 /</span> THE EXPERIMENTS</p><h2 id="experiments-title">The next experiment<br><span>starts here.</span></h2><p class="ep-subtitle">{EMPTY_FEED}</p><a class="text-link" href="https://www.youtube.com/@PCMagikLab">Watch the experiments on YouTube ↗</a></section>'
    outputs = {'index.html': template('home.html', latest_section=latest_section, method_samples=method_samples(episodes), telemetry=telemetry, episode_count=f'{len(episodes):02}', prompt_link=('/'+latest['prompt_file'] if latest.get('prompt_file') else '/'+latest['measurements'][0]['prompt']) if latest else '/episodes/')}
    listing = '<section><div class="section-head"><div><p class="eyebrow">THE EXPERIMENTS / ALL EPISODES</p><h1 class="page-title">The evidence.<br><span>One experiment<br>at a time.</span></h1></div></div><p class="study-note">Newest episodes first. Each episode includes its published measurements, prompts and model outputs.</p><div class="episode-list">'+cards(episodes, feed)+'</div></section>'
    if not episodes:
        listing = listing[:listing.index('<p class="study-note">')] + f'<p class="ep-subtitle">{EMPTY_FEED}</p><a class="text-link" href="https://www.youtube.com/@PCMagikLab">Watch the experiments on YouTube ↗</a></section>'
    outputs['404.html'] = template('page.html', title='Page not found | PC Magik Lab', description='Return to the lab or browse published episodes.', path='/404.html', body='<section><h1 class="page-title">Page not found</h1><div class="actions not-found-actions"><a class="button" href="/">Return to the lab</a><a class="button" href="/episodes/">Browse episodes</a></div></section>', episode_count=f'{len(episodes):02}')
    outputs['episodes/index.html'] = template('page.html', title='All episodes | PC Magik Lab', description='Published experiments, prompts and model outputs.', path='/episodes/', body=listing, episode_count=f'{len(episodes):02}')
    outputs['privacy/index.html'] = template('privacy.html', title='Privacy policy | PC Magik Lab', description='Privacy policy for lab.pcmagik.pl.', path='/privacy/', episode_count=f'{len(episodes):02}')
    for ep in episodes:
        path = f'/episodes/{ep["slug"]}/'
        outputs[path.strip('/')+'/index.html'] = template('page.html', title=text(ep['title']), description=text(ep['opis']), path=path, body=episode_body(ep, feed), social_card=ep.get('social_card'), episode_count=f'{len(episodes):02}')
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
