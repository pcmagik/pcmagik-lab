"""Expose the publication regression suite through the standard tests directory."""
from pathlib import Path


def load_tests(loader, tests, pattern):
    directory = str(Path(__file__).resolve().parents[1] / 'bin')
    return loader.discover(directory, pattern='test_*.py', top_level_dir=directory)
