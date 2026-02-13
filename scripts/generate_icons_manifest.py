from pathlib import Path
import json

url_prefix = 'static/images/'
icons_directory = Path(url_prefix)
manifest_file = 'static/images/manifest.js'

extensions = {'.png', '.svg', '.jpg', '.jpeg', '.webp'}
manifest = {}

for file in sorted(icons_directory.rglob("*")):
    if file.suffix.lower() in extensions and file.is_file():
        manifest[file.stem] = url_prefix + file.relative_to(icons_directory).as_posix()

js_content = 'const iconsManifest = ' + json.dumps(manifest, indent=2) + ';'

with open(manifest_file, 'w') as file:
    file.write(js_content)