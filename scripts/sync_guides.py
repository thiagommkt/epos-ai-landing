#!/usr/bin/env python3
"""
sync_guides.py - Sincroniza guides/ a partir dos arquivos raiz.

Problema resolvido: 5 cópias manuais → 2 arquivos raiz + sync automático.

Hierarquia:
  epos-ai-landing/epos-dashboard.html   → epos-ai-landing/guides/epos-dashboard.html
  epos-ai-landing/fm-dashboard.html     → epos-ai-landing/guides/fm-dashboard.html
  epos-ai-landing/fm-dashboard.html     → whatsapp-ai-system/guides/fm-dashboard.html

Usage: python scripts/sync_guides.py [--dry-run] [--validate]
"""
import sys
import shutil
import argparse
import re
from pathlib import Path

ROOT_LANDING = Path(__file__).parent.parent  # epos-ai-landing/
ROOT_WAS = ROOT_LANDING.parent / 'whatsapp-ai-system'

COPIES = [
    {
        'src': ROOT_LANDING / 'epos-dashboard.html',
        'dst': ROOT_LANDING / 'guides' / 'epos-dashboard.html',
        'label': 'epos guides',
    },
    {
        'src': ROOT_LANDING / 'fm-dashboard.html',
        'dst': ROOT_LANDING / 'guides' / 'fm-dashboard.html',
        'label': 'fm guides (landing)',
    },
    {
        'src': ROOT_LANDING / 'fm-dashboard.html',
        'dst': ROOT_WAS / 'guides' / 'fm-dashboard.html',
        'label': 'fm guides (WAS)',
    },
]


def count_divs(content: str) -> tuple[int, int]:
    opens = len(re.findall(r'<div[\s>]', content))
    closes = len(re.findall(r'</div>', content))
    return opens, closes


def sync(dry_run: bool = False, validate: bool = True) -> int:
    errors = 0
    for entry in COPIES:
        src: Path = entry['src']
        dst: Path = entry['dst']
        label: str = entry['label']

        if not src.exists():
            print(f"  SKIP {label}: source not found ({src})")
            continue

        content = src.read_text(encoding='utf-8')

        if validate:
            opens, closes = count_divs(content)
            if opens != closes:
                print(f"  FALHA {label}: source {src.name} has unbalanced divs "
                      f"({opens} open vs {closes} close) — aborting copy")
                errors += 1
                continue

        if dry_run:
            same = dst.exists() and dst.read_text(encoding='utf-8') == content
            status = 'UP-TO-DATE' if same else 'WOULD COPY'
            print(f"  [{status}] {label}: {src.name} -> {dst.relative_to(ROOT_LANDING.parent)}")
        else:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            print(f"  OK {label}: {src.name} -> {dst.relative_to(ROOT_LANDING.parent)}")

    return errors


def main():
    parser = argparse.ArgumentParser(description='Sync dashboard guides from root files')
    parser.add_argument('--dry-run', action='store_true', help='Preview without writing')
    parser.add_argument('--no-validate', action='store_true', help='Skip div balance check')
    args = parser.parse_args()

    print(f"{'[DRY RUN] ' if args.dry_run else ''}Syncing guides...")
    errors = sync(dry_run=args.dry_run, validate=not args.no_validate)

    if errors:
        print(f"\nFALHA {errors} erro(s) - nenhum arquivo copiado com falha de validacao")
        sys.exit(1)
    elif not args.dry_run:
        print("\nOK Sync concluido")
    sys.exit(0)


if __name__ == '__main__':
    main()
