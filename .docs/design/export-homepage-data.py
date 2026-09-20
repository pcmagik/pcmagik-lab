"""Compatibility entry point: the shared builder reads only data/episodes.json."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).resolve().parents[2] / 'bin/build_site.py'), run_name='__main__')
