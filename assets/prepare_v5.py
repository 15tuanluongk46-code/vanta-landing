"""Encode graphic renders only after full-product alpha framing passes."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
NAMES = ['hero', 'profile', 'sakura', 'lagoon', 'citrus', 'detail-upper', 'detail-heel', 'detail-sole', 'campaign']
report = {}
sheet = Image.new('RGB', (900, 990), '#e6e0d6')
for i, name in enumerate(NAMES):
    source = ROOT / 'public/images' / f'{name}-v5.png'
    with Image.open(source) as image:
        expected = (1200, 1200) if name.startswith('detail-') else (1600, 1500) if name == 'campaign' else (1800, 1200)
        assert image.size == expected, (name, image.size, expected)
        if name != 'campaign':
            alpha = image.getchannel('A').point(lambda value: 255 if value > 12 else 0)
            bbox = alpha.getbbox()
            assert bbox, f'{name}: empty product'
            w, h = image.size
            margins = [bbox[0]/w, bbox[1]/h, (w-bbox[2])/w, (h-bbox[3])/h]
            assert min(margins) >= .08, f'{name}: product cropped or under 8% margin: {margins}'
            report[name] = {'bbox': bbox, 'margins': margins, 'passed': True}
        image.save(source.with_suffix('.webp'), quality=90, method=6)
        report.setdefault(name, {})['webp_bytes'] = source.with_suffix('.webp').stat().st_size
        thumb = ImageOps.contain(image, (300, 295))
        tile = Image.new('RGB', (300, 330), '#e6e0d6')
        tile.paste(thumb, ((300-thumb.width)//2, (295-thumb.height)//2), thumb.getchannel('A'))
        ImageDraw.Draw(tile).text((12, 305), name, fill='#151515')
        sheet.paste(tile, ((i%3)*300, (i//3)*330))
sheet.save('/tmp/opencode/vanta-v5-sheet.jpg', quality=82)
(ROOT / 'assets/framing-v5.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
