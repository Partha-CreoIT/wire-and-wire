# Homepage cinematic story

One 30-second film joins a wire mill, steel strand, concrete construction and
Kuala Lumpur with three generated camera moves. These are AI visualisations, not
documentary footage of Wire & Wire's facilities, employees, or supplied projects.
The Kuala Lumpur skyline provides geographic context; it does not imply that
Wire & Wire supplied the Petronas Twin Towers.

Generated with Seedance 2.0 at 1080p, 16:9, without audio. Original eight-second
scene briefs are in `prompts.json`; four-second connecting moves and their source
frame anchors are in `transitions.json`. The edited timeline is:

| Seconds | Camera journey |
| --- | --- |
| 0–6 | Approach the wire production line |
| 6–10 | Move from the mill into the strand |
| 10–14 | Travel along the steel wires |
| 14–18 | Follow the strand into construction |
| 18–21 | Continue through the viaduct site |
| 21–25 | Rise from construction toward the city |
| 25–30 | Reveal Kuala Lumpur |

Optimised assets are in `public/world/cinematic/`. `journey.mp4` is 1440×810;
`mobile/journey.mp4` is 720×1280 with a moving crop that follows the subject.
Both use 24 fps H.264 with a keyframe every two frames for responsive seeking.
Eight fallback posters are extracted from the same timeline.

To prepare downloaded source clips named `mill.mp4`, `strand.mp4`, `build.mp4`,
`skyline.mp4`, `mill-to-strand.mp4`, `strand-to-build.mp4` and
`build-to-skyline.mp4`, run:

```sh
python3 scripts/prepare-cinematic-films.py /path/to/source-clips
```

The homepage uses one video element and one continuous source per viewport.
Scroll position controls its full timeline, including reverse scrolling. There
is no play button, autoplay loop or source swap at a chapter boundary. Decoder
work is coalesced and stops when the frame settles, the story leaves view, or the
tab becomes hidden. Captions follow decoded frames and clear the connecting
moves. Chapter buttons scroll to stable moments in the film.

The source is released on route changes. Reduced motion and data saving use
static posters with functioning chapter navigation. A failed video also falls
back to those posters. The page labels the imagery as a cinematic visualisation.
