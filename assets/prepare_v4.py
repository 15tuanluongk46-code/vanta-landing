"""Encode versioned studio renders and report alpha bounds for framing QA."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
names = ['hero', 'profile', 'chalk', 'carbon', 'clay', 'detail-upper', 'detail-heel', 'detail-sole', 'campaign']
sheet = Image.new('RGB', (900, 990), '#e6e0d6')
for i, name in enumerate(names):
    source = root / 'public/images' / f'{name}-v4.png'
    with Image.open(source) as image:
        image.save(source.with_suffix('.webp'), quality=88, method=6)
        print(name, image.size, image.getbbox(), source.with_suffix('.webp').stat().st_size)
        thumb = ImageOps.contain(image, (300, 295))
        tile = Image.new('RGB', (300, 330), '#e6e0d6')
        tile.paste(thumb, ((300-thumb.width)//2, (295-thumb.height)//2), thumb.getchannel('A') if thumb.mode == 'RGBA' else None)
        ImageDraw.Draw(tile).text((12, 305), name, fill='#151515')
        sheet.paste(tile, ((i%3)*300, (i//3)*330))
sheet.save('/tmp/opencode/vanta-v4-sheet.jpg', quality=80)
