#!/usr/bin/env python3
"""Replace pictures on the Designed for Discovery microsite.

  python3 scripts/swap_image.py --list
  python3 scripts/swap_image.py land ~/Desktop/new-aerial.jpg --alt "Aerial view of the resort and beach"
  python3 scripts/swap_image.py --folder ~/Desktop/new-images

A picture's "slot" is its file name without folder or extension (land, white-bark, quan-spa ...).
--list prints every slot with where it appears.

Several at once: put the new photos in one folder and name each file after the slot it replaces
(pond.jpg, fountain.png ...). Optionally add an alt-text.json file to that folder:
  {"pond": "Curved timber bridge over the pond", "fountain": "Fountain at the lobby entrance"}

The tool resizes each photo, saves the full and -small web versions into public/assets/, and
updates the size fields (and the alt text, if given) in src/content.json. The previous files are
copied to image-backups/ first, so any swap can be undone. JPG, PNG and WebP are supported;
export HEIC photos as JPG first.
"""
import argparse
import datetime
import json
import pathlib
import shutil
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('This tool needs Pillow. Install it with:  python3 -m pip install pillow')

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'src' / 'content.json'
FULL_EDGE, SMALL_EDGE, QUALITY = 2000, 760, 82  # longest side in pixels, WebP quality
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}


def slot_name(picture):
    return pathlib.PurePosixPath(picture['src']).stem


def find_pictures(data):
    """Every picture in content.json as (where it appears, dict)."""
    found = []

    def walk(value, label):
        if isinstance(value, dict):
            if 'src' in value and 'small' in value:
                found.append((label, value))
            for key, item in value.items():
                walk(item, f'{label} > {key}' if label else key)
        elif isinstance(value, list):
            for i, item in enumerate(value, 1):
                walk(item, f'{label} #{i}')

    walk(data, '')
    return found


def describe(data):
    """Rows of (slot, readable place, picture), e.g. 'Chapter 4 The Beach Drawn Inland - images #1'."""
    titles = [c['title'] for c in data['chapters']]
    rows = []
    for label, pic in find_pictures(data):
        place = label
        if label.startswith('chapters #'):
            n = int(label.split('#')[1].split()[0])
            place = f"Chapter {n} {titles[n - 1]}" + label[len(f'chapters #{n}'):].replace(' > ', ' - ')
        rows.append((slot_name(pic), place, pic))
    return rows


def fit(image, edge):
    w, h = image.size
    scale = min(1.0, edge / max(w, h))
    return image.resize((round(w * scale), round(h * scale)), Image.LANCZOS) if scale < 1 else image.copy()


def load(source):
    """Open a photo upright and flatten any transparency onto white (the line drawings expect that)."""
    try:
        image = ImageOps.exif_transpose(Image.open(source))
    except Exception as error:  # unreadable or unsupported format
        sys.exit(f'Cannot read {source.name}: {error}')
    if image.mode in ('RGBA', 'LA', 'P'):
        image = image.convert('RGBA')
        flat = Image.new('RGB', image.size, 'white')
        flat.paste(image, mask=image.split()[-1])
        return flat
    return image.convert('RGB')


def swap(slot, pic, source, alt, backup, dry_run):
    """Replace one picture. Returns True if its alt text was left unchanged."""
    full = fit(load(source), FULL_EDGE)
    small = fit(full, SMALL_EDGE)
    old_w, old_h = pic['width'], pic['height']
    new_w, new_h = full.size
    print(f'{slot}: {old_w} x {old_h}  ->  {new_w} x {new_h}')
    if abs((new_w / new_h) / (old_w / old_h) - 1) > 0.05:
        print('   NOTE: the shape differs from the old picture. The layout crops pictures to fit, so check the preview.')
    if max(new_w, new_h) < 0.6 * max(old_w, old_h):
        print('   NOTE: much smaller than the old picture; it may look soft on large screens.')
    if dry_run:
        return not alt
    for name in (pic['src'], pic['small']):
        shutil.copy2(ROOT / 'public' / name, backup / pathlib.Path(name).name)
    full.save(ROOT / 'public' / pic['src'], 'WEBP', quality=QUALITY, method=6)
    small.save(ROOT / 'public' / pic['small'], 'WEBP', quality=QUALITY, method=6)
    pic['width'], pic['height'], pic['smallWidth'] = new_w, new_h, small.size[0]
    if alt:
        pic['alt'] = alt
    return not alt


def main():
    parser = argparse.ArgumentParser(description='Replace pictures on the microsite.')
    parser.add_argument('slot', nargs='?', help='picture name, e.g. land (see --list)')
    parser.add_argument('photo', nargs='?', help='path to the new JPG, PNG or WebP')
    parser.add_argument('--folder', help='folder of new photos, each named after the slot it replaces')
    parser.add_argument('--alt', help='new alt text for a single swap (describe what the new picture shows)')
    parser.add_argument('--list', action='store_true', help='list every picture slot')
    parser.add_argument('--dry-run', action='store_true', help='show what would change without writing files')
    args = parser.parse_args()

    data = json.loads(CONTENT.read_text(encoding='utf-8'))
    rows = describe(data)
    by_slot = {name: pic for name, _, pic in rows}

    if args.list or not (args.slot or args.folder):
        for name, place, pic in rows:
            print(f"{name:<16} {pic['width']:>5} x {pic['height']:<5} {place}")
        return

    jobs = []  # (slot, picture, source file, alt text)
    if args.folder:
        folder = pathlib.Path(args.folder).expanduser()
        if not folder.is_dir():
            sys.exit(f'Cannot find the folder {folder}')
        alts = {}
        alt_file = folder / 'alt-text.json'
        if alt_file.is_file():
            alts = json.loads(alt_file.read_text(encoding='utf-8'))
        files = sorted(f for f in folder.iterdir() if f.suffix.lower() in EXTENSIONS and not f.name.startswith('.'))
        skipped, seen = [], set()
        for f in files:
            slot = f.stem.strip().lower().replace(' ', '-').replace('_', '-')
            if slot not in by_slot:
                skipped.append(f.name)
            elif slot in seen:
                sys.exit(f'Two files in the folder are named for the same picture ({slot}). Keep one.')
            else:
                seen.add(slot)
                jobs.append((slot, by_slot[slot], f, alts.get(slot)))
        if skipped:
            print('Skipped (the file name is not a picture name; see --list): ' + ', '.join(skipped))
        unknown = [k for k in alts if k not in by_slot]
        if unknown:
            print('Ignored alt-text.json entries with no matching picture: ' + ', '.join(unknown))
        if not jobs:
            sys.exit('No files matched a picture name. Name each file after its slot, e.g. pond.jpg.')
    else:
        if not args.photo:
            sys.exit('Give the path to the new photo after the slot name.')
        if args.slot not in by_slot:
            sys.exit(f"No picture called '{args.slot}'. Run with --list to see the names.")
        source = pathlib.Path(args.photo).expanduser()
        if not source.is_file():
            sys.exit(f'Cannot find {source}')
        jobs.append((args.slot, by_slot[args.slot], source, args.alt))

    backup = ROOT / 'image-backups' / f"{datetime.datetime.now():%Y%m%d-%H%M%S}-{jobs[0][0] if len(jobs) == 1 else 'batch'}"
    if not args.dry_run:
        backup.mkdir(parents=True, exist_ok=True)
        shutil.copy2(CONTENT, backup / CONTENT.name)

    stale_alt = [slot for slot, pic, source, alt in jobs if swap(slot, pic, source, alt, backup, args.dry_run)]
    if args.dry_run:
        print('Dry run: nothing written.')
    else:
        CONTENT.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')  # same format as the original
        print(f'\nDone: {len(jobs)} picture(s) replaced. Old files saved in {backup.relative_to(ROOT)}/ (copy them back to undo).')
    if stale_alt:
        print('\nAlt text NOT updated for: ' + ', '.join(stale_alt))
        print('If a new picture shows something different, set its alt text (--alt, or alt-text.json in the folder).')
    if not args.dry_run:
        print('Next: preview it, then rebuild and deploy.')


if __name__ == '__main__':
    main()
