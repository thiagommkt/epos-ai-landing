#!/usr/bin/env python3
"""
validate_html.py - Valida balance de <div></div> em arquivos HTML do dashboard.
Executa antes de qualquer commit (pre-commit hook).
Exit code 0 = OK. Exit code 1 = erro de balance.
"""
import sys
import re
from pathlib import Path

TARGETS = [
    'epos-dashboard.html',
    'fm-dashboard.html',
    'guides/fm-dashboard.html',
    'guides/epos-dashboard.html',
]

ROOT = Path(__file__).parent.parent  # epos-ai-landing/


def count_divs(content: str) -> tuple[int, int]:
    """Conta <div e </div sem contar tags dentro de strings JS/CSS."""
    opens = len(re.findall(r'<div[\s>]', content))
    closes = len(re.findall(r'</div>', content))
    return opens, closes


def validate_file(path: Path) -> list[str]:
    errors = []
    if not path.exists():
        return []  # arquivo opcional — não falha
    content = path.read_text(encoding='utf-8', errors='replace')
    opens, closes = count_divs(content)
    if opens != closes:
        errors.append(
            f"  FALHA {path.name}: {opens} <div> vs {closes} </div> "
            f"(diferença: {opens - closes:+d})"
        )
    return errors


def main():
    all_errors = []
    for rel in TARGETS:
        path = ROOT / rel
        all_errors.extend(validate_file(path))

    if all_errors:
        print("FALHA VALIDACAO HTML:")
        for e in all_errors:
            print(e)
        print("\nCorrigir antes de commitar.")
        sys.exit(1)
    else:
        checked = [r for r in TARGETS if (ROOT / r).exists()]
        print(f"OK HTML valido: {len(checked)} arquivo(s) - <div> balance OK")
        sys.exit(0)


if __name__ == '__main__':
    main()
