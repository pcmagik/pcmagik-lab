"""Assemble unscaled screenshots for side-by-side review (requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path('.screenshots/runda16')
for width in [1920, 390]:
    for label, names, suffix in [
        ('episodes', ['02', '13'], 'results'),
        ('full-episodes', ['02', '13'], 'full'),
        ('cards', ['home', 'list'], 'card'),
        ('pages', ['home', 'list'], 'full'),
    ]:
        images = [Image.open(root / f'{name}-{width}-{suffix}.png').convert('RGB') for name in names]
        canvas = Image.new('RGB', (sum(i.width for i in images) + 24, max(i.height for i in images) + 36), '#060b15')
        draw, x = ImageDraw.Draw(canvas), 0
        for name, image in zip(names, images):
            draw.text((x + 12, 10), f'{name} | {width}px', fill='white')
            canvas.paste(image, (x, 36))
            x += image.width + 24
        canvas.save(root / f'compare-{label}-{width}.png')
