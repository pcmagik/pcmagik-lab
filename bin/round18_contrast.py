"""WCAG contrast against the brightest rendered background pixel under text."""
import json
import re
import sys
from PIL import Image


def lum(rgb):
    c = [v/255 for v in rgb]
    c = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in c]
    return sum(a*b for a,b in zip(c,[.2126,.7152,.0722]))


image = Image.open(sys.argv[1]).convert('RGB')
values=[]
for b in json.loads(sys.argv[2]):
    x,y,w,h=[b[k] for k in ['x','y','width','height']]
    crop=image.crop((max(0,round(x)),max(0,round(y)),min(image.width,round(x+w)),min(image.height,round(y+h))))
    bg=max(map(lum,crop.getdata()))
    colors=re.findall(r'rgb\((\d+), (\d+), (\d+)\)',b['gradient']) if b['gradient']!='none' else []
    if not colors:
        colors=[re.findall(r'[\d.]+',b['color'])[:3]]
    fg=min(lum(list(map(float,c))) for c in colors)
    values.append(round((fg+.05)/(bg+.05),3))
print(json.dumps(values))
