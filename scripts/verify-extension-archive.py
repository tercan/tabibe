"""Verify every archive byte against the current build without extracting files."""

import json
from pathlib import Path
from zipfile import ZipFile

project = Path(__file__).resolve().parent.parent
version = json.loads((project / "package.json").read_text())["version"]
archive_path = project / "release" / f"tabibe-v{version}.zip"
build = project / "dist"
expected = {
    str(path.relative_to(build)): path
    for path in build.rglob("*")
    if path.is_file() and path.name not in {".DS_Store", "Thumbs.db"}
}
expected["LICENSE"] = project / "LICENSE"

with ZipFile(archive_path) as archive:
    names = archive.namelist()
    assert len(names) == len(set(names)), "Duplicate archive entries"
    files = {name for name in names if not name.endswith("/")}
    assert files == set(expected), "Archive file set differs from the current build"
    assert archive.testzip() is None, "Archive CRC failure"
    for name, source in expected.items():
        assert archive.read(name) == source.read_bytes(), f"Stale or changed archive content: {name}"
    assert json.loads(archive.read("manifest.json")) == json.loads(
        (project / "public/manifest.json").read_text()
    ), "Archive and source manifests differ"

print(f"Verified {len(expected)} archive files against the current build and license.")
