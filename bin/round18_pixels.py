"""Pixel measurements in the screenshot's native viewport, RGB brightness / 255."""
import json
import sys
from PIL import Image, ImageChops, ImageStat


def box(value):
    b = json.loads(value)
    return tuple(round(v) for v in (b['x'], b['y'], b['x']+b['width'], b['y']+b['height']))


def brightness(image):
    return sum(ImageStat.Stat(image.convert('RGB')).mean)/3


mode, path, *args = sys.argv[1:]
im = Image.open(path).convert('RGB')
if mode == 'glow':
    x, y, right, bottom = box(args[0])
    if y < 80:
        raise ValueError('Glow sample requires 80px of free space above the card')
    # Centre half avoids rounded corners; both strips have identical width.
    inset = (right-x)//4
    value = brightness(im.crop((x+inset,y-16,right-inset,y-8))) - brightness(im.crop((x+inset,y-80,right-inset,y-60)))
elif mode == 'diff':
    other = Image.open(args[0]).convert('RGB')
    value = brightness(ImageChops.difference(im.crop(box(args[1])),other.crop(box(args[1]))))
elif mode == 'range':
    crop = im.crop(box(args[0]))
    values = [sum(pixel)/3 for pixel in crop.getdata()]
    value = max(values)-min(values)
else:
    raise ValueError(mode)
print(json.dumps(round(value,3)))
