"""Package only generated routes, fonts, client bundles and current VANTA assets."""
from pathlib import Path
import shutil
import zipfile

root = Path(__file__).resolve().parents[1]
export = root / '.next-static'
destination = root / 'dist' / 'pages'
images = {f'{name}-v5.webp' for name in (
    'hero', 'profile', 'campaign', 'sakura', 'lagoon', 'citrus',
    'detail-upper', 'detail-heel', 'detail-sole',
)}
assert (export / 'index.html').is_file(), 'Static export missing'
if destination.exists():
    shutil.rmtree(destination)
destination.mkdir(parents=True)
for file in export.rglob('*'):
    if not file.is_file():
        continue
    relative = file.relative_to(export)
    include = (relative.parts[0] == '_next'
               or (len(relative.parts) == 1 and file.suffix in {'.html', '.txt'})
               or (relative.parts[0] == 'images' and file.name in images)
               or relative.as_posix() == 'models/form-01-v5.glb')
    if include:
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(file, target)
for name in images:
    assert (destination / 'images' / name).is_file(), name
assert (destination / 'models/form-01-v5.glb').is_file()
files = sorted(p for p in destination.rglob('*') if p.is_file())
assert len(files) <= 1000
assert all(p.stat().st_size < 25 * 1024 * 1024 for p in files)
archive = destination.parent / 'vanta-form-01.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
    for file in files:
        bundle.write(file, file.relative_to(destination))
print(f'Pages package: {len(files)} files; {sum(p.stat().st_size for p in files)} bytes')
print(f'Upload: {archive} ({archive.stat().st_size} bytes)')
