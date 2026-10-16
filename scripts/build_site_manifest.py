#!/usr/bin/env python3
"""Inventory the static student website; exclude authoring files and test assets."""

import json
from pathlib import Path


SITE_ROOT = Path(__file__).resolve().parents[1]
MEDIA_SUFFIXES = {".pptx", ".pdf", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".mp4", ".webm", ".avif"}
EXCLUDED_PARTS = {"source", "sources", "__pycache__", "node_modules", ".cache", "tests", "test-results"}


def runtime_files(root=SITE_ROOT):
    paths = {"site-files.json"}
    for path in root.iterdir():
        if path.is_file() and path.suffix in {".html", ".css", ".js"} and not path.name.startswith(("test_", "test-", ".")):
            paths.add(path.name)
    for name in ("GUIDE.md", "CONTENT_NOTES.md", "RESOURCE_LIBRARY.md", "LESSON_INTRO_SOURCES.md"):
        if (root / name).is_file():
            paths.add(name)

    # The page uses the minified KaTeX runtime; its CSS references local fonts.
    for name in ("katex.min.js", "katex.min.css", "contrib/auto-render.min.js", "LICENSE"):
        path = root / "vendor" / "katex" / name
        if path.is_file():
            paths.add(path.relative_to(root).as_posix())
    fonts = root / "vendor" / "katex" / "fonts"
    if fonts.exists():
        paths.update(path.relative_to(root).as_posix() for path in fonts.iterdir() if path.is_file() and path.suffix in {".woff2", ".woff", ".ttf"})

    # Shared local typography and its redistribution notices travel with exports.
    for path in (root / "fonts").rglob("*"):
        relative = path.relative_to(root)
        if not path.is_file() or (set(relative.parts) & EXCLUDED_PARTS) or any(part.startswith(".") for part in relative.parts):
            continue
        name = path.name.lower()
        if path.suffix.lower() in {".woff", ".woff2", ".ttf", ".otf", ".md", ".txt"} or "license" in name or name.startswith(("ofl", "gfl", "copying")):
            paths.add(relative.as_posix())

    for folder in ("worked_media", "resources"):
        for path in (root / folder).rglob("*"):
            relative = path.relative_to(root)
            if path.is_file() and not (set(relative.parts) & EXCLUDED_PARTS) and not any(part.startswith(".") for part in relative.parts) and path.suffix.lower() in MEDIA_SUFFIXES:
                paths.add(relative.as_posix())
    for path in (root / "resources").rglob("README.md"):
        if not (set(path.relative_to(root).parts) & EXCLUDED_PARTS):
            paths.add(path.relative_to(root).as_posix())
    return sorted(paths)


def main():
    paths = runtime_files()
    required = {"index.html", "lesson-resources-data.js", "lesson-resources.js", "resource-export.js"}
    missing = required - set(paths)
    if missing:
        raise SystemExit("Runtime files are not ready: " + ", ".join(sorted(missing)))
    destination = SITE_ROOT / "site-files.json"
    destination.write_text(json.dumps({"version": 1, "files": paths}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {destination}: {len(paths)} runtime files")


if __name__ == "__main__":
    main()
