#!/usr/bin/env python3
"""Fail if any source file still imports SafeAreaView from react-native."""
from __future__ import annotations

import re
from pathlib import Path

root = Path('/home/ubuntu/sokdak')
pattern = re.compile(
    r"import\s*\{(?P<members>[^}]+)\}\s*from\s*'react-native';",
    re.DOTALL,
)
violations: list[str] = []
uses = 0
context_imports = 0

for path in [*root.glob('app/**/*.tsx'), *root.glob('components/**/*.tsx'), *root.glob('constants/**/*.ts')]:
    text = path.read_text(encoding='utf-8')
    if 'SafeAreaView' not in text:
        continue
    uses += 1
    for match in pattern.finditer(text):
        members = {member.strip() for member in match.group('members').split(',')}
        if 'SafeAreaView' in members:
            violations.append(str(path.relative_to(root)))
    if "from 'react-native-safe-area-context'" in text:
        context_imports += 1

if violations:
    raise SystemExit('Deprecated imports remain: ' + ', '.join(violations))
if uses != context_imports:
    raise SystemExit(f'SafeAreaView use/import mismatch: uses={uses}, context_imports={context_imports}')

print(f'Validated {uses} SafeAreaView screens; all use react-native-safe-area-context')
