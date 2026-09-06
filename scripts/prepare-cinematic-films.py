"""Join frame-matched camera moves and encode one film for responsive scroll seeking.

Requires ffmpeg/ffprobe and Pillow. Inputs: mill, strand, build, skyline,
mill-to-strand, strand-to-build, build-to-skyline (all .mp4).
"""
from pathlib import Path
from io import BytesIO
import argparse
import json
import subprocess
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
parser.add_argument('--destination', type=Path, default=Path(__file__).resolve().parents[1] / 'public/world/cinematic')
args = parser.parse_args()
args.destination.mkdir(parents=True, exist_ok=True)
(args.destination / 'mobile').mkdir(exist_ok=True)

# Connectors begin/end at actual frames from their adjoining source shots.
segments = [
    ('mill', 0, 6), ('mill-to-strand', 0, 4), ('strand', 0, 4),
    ('strand-to-build', 0, 4), ('build', 4, 7),
    ('build-to-skyline', 0, 4), ('skyline', 0, 5),
]
inputs, filters, labels = [], [], []
for index, (name, start, end) in enumerate(segments):
    path = args.source / f'{name}.mp4'
    if not path.exists():
        raise SystemExit(f'Missing source: {path}')
    inputs.extend(['-i', str(path)])
    filters.append(f'[{index}:v]trim=start={start}:end={end},setpts=PTS-STARTPTS,fps=24,scale=1920:1080:flags=lanczos,setsar=1[v{index}]')
    labels.append(f'[v{index}]')
filters.append(''.join(labels) + 'concat=n=7:v=1:a=0,split=2[desktop][phone]')
filters.append('[desktop]scale=1440:810:flags=lanczos[wide]')

# Smoothly follow the subject across the film, including all connectors.
def ramp(start, length):
    p = f'((t-{start})/{length})'
    return f'({p}*{p}*(3-2*{p}))'

focus = (f'if(lt(t,6),1,if(lt(t,10),1-0.44*{ramp(6,4)},'
         f'if(lt(t,14),0.56,if(lt(t,18),0.56+0.44*{ramp(14,4)},'
         f'if(lt(t,21),1,if(lt(t,25),1-0.175*{ramp(21,4)},'
         f'0.825+0.145*((t-25)/5)*((t-25)/5)))))))')
filters.append(f"[phone]crop=w=trunc(ih*9/16/2)*2:h=ih:x='(iw-ow)*({focus})':y=0,scale=720:1280:flags=lanczos[tall]")

encoding = ['-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
            '-pix_fmt', 'yuv420p', '-g', '2', '-keyint_min', '2', '-bf', '0',
            '-sc_threshold', '0', '-movflags', '+faststart', '-threads', '2']
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-filter_complex_threads', '1',
                *inputs, '-filter_complex', ';'.join(filters),
                '-map', '[wide]', *encoding, str(args.destination / 'journey.mp4'),
                '-map', '[tall]', *encoding, str(args.destination / 'mobile/journey.mp4')], check=True)

posters = {'mill': 0, 'strand': 12, 'build': 19.5, 'skyline': 28}
for directory in [args.destination, args.destination / 'mobile']:
    for name, time in posters.items():
        frame = subprocess.check_output(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-ss', str(time),
            '-i', str(directory / 'journey.mp4'), '-frames:v', '1', '-f', 'image2pipe', '-c:v', 'png', '-'])
        with Image.open(BytesIO(frame)) as image:
            image.save(directory / f'{name}.webp', 'WEBP', quality=86)

metadata = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'json', str(args.destination / 'journey.mp4')]))
duration = float(metadata['format']['duration'])
if abs(duration - 30) > 0.1:
    raise SystemExit(f'Timeline must be 30 seconds; got {duration}')
print(f'Prepared one {duration:.2f}s journey, landscape and portrait, with eight matching posters.', flush=True)
