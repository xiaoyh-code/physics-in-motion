"""Copy rendered scenes and build offline browser data.

Usage: python3 build_assets.py /absolute/path/to/videos/worked_scenes/720p24
       python3 build_assets.py /absolute/path/to/videos/worked_scenes/720p24 --topics motion
Requires ffmpeg for the poster images. Render worked_scenes.py first.
"""
from pathlib import Path
import argparse
import json
import shutil
import subprocess

source = Path(__file__).resolve().parent
site = source.parents[1]
prompts = json.loads((site / "worked_prompts.json").read_text())
scenes = {
    "motion": "MotionSolution",
    "displacement": "DisplacementSolution",
    "vectors": "VectorSolution",
    "newton": "NewtonSolution",
}
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("render_dir", type=Path)
parser.add_argument("--topics", nargs="+", choices=scenes, default=list(scenes))
args = parser.parse_args()
render_dir = args.render_dir.resolve()
data_path = site / "worked-data.js"
if data_path.exists():
    data = json.loads(data_path.read_text().split("window.WORKED_SOLUTIONS = ", 1)[1].strip().removesuffix(";"))
else:
    if set(args.topics) != set(scenes):
        parser.error("Build every topic once before updating individual topics.")
    data = {}
for topic in args.topics:
    scene = scenes[topic]
    chapter_marks = json.loads((source / f"{topic}_chapters.json").read_text())
    entry = prompts[topic]
    assert len(chapter_marks) == len(entry["steps"]) + 1
    entry["src"] = f"worked_media/{topic}.mp4"
    entry["poster"] = f"worked_media/{topic}.jpg"
    for index, step in enumerate(entry["steps"]):
        step["time"] = chapter_marks[index]["time"]
        step["end"] = chapter_marks[index + 1]["time"]
    shutil.copy2(render_dir / f"{scene}.mp4", site / entry["src"])
    # The motion proof is most useful as its poster after the two area terms appear.
    poster_time = chapter_marks[-2]["time"] - 1 if topic == "motion" else 2.0
    subprocess.run([
        "ffmpeg", "-y", "-ss", str(poster_time), "-i", str(site / entry["src"]),
        "-frames:v", "1", "-q:v", "3", "-loglevel", "error",
        str(site / entry["poster"]),
    ], check=True)
    data[topic] = entry
data_path.write_text(
    "// Generated from worked_prompts.json and Manim chapter timings.\n"
    "window.WORKED_SOLUTIONS = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
)
print(f"Updated {len(args.topics)} worked animations; {sum(len(d['steps']) for d in data.values())} observation steps in total.")
