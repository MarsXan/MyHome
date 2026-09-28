# Floor 4 apartment — plan and 3D model

A 72 m² fourth-floor apartment, redrawn from a hand sketch as an interactive
3D model and a measured 2D plan.

## Open it

Double-click `index.html`. It opens straight from disk: no server, no internet.
Tested in Chrome.

Keep the folder together. The page loads its files from `css/`, `js/`,
`vendor/`, `fonts/` and `img/`.

## What's on the page

**3D model**

- Drag to orbit, scroll or pinch to zoom, right-drag to pan.
- Five views: Overview, Top, Bedrooms, Living (eye level), Entrance.
- **Wall height** lowers every wall like a section cut, so you can see into
  the shower and bathroom. The dark tops mark where the walls are cut.
- **Doors open**, **Room names** and **Door & window tags** switch those on and off.
- Double-click anywhere on the model to glide the camera to that spot.
- Add `#top`, `#bedrooms`, `#living` or `#entrance` to the address to open
  straight on that view.

**2D plan**: the measured drawing with dimensions, the room schedule, the door
and window schedule, and the original sketch for comparison.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page |
| `css/style.css` | Page styles, light and dark theme |
| `js/plan-data.js` | All geometry for the 3D model, in centimetres |
| `js/home3d.js` | The 3D scene (plain script, no build step) |
| `vendor/three.bundle.min.js` | three.js r186 and the add-ons used, as one script |
| `vendor/three-entry.js` | How that bundle was built |
| `vendor/LICENSE-three.txt` | three.js licence (MIT) |
| `fonts/` | Archivo Narrow, IBM Plex Sans, IBM Plex Mono (SIL Open Font License) |
| `img/sketch.jpg` | The original hand sketch |

## Changing the model

Edit `js/plan-data.js` and reload. Walls, openings, door swings, room
outlines, floor finishes and heights all live there.

The 2D plan is hand-drawn SVG inside `index.html` and does not read that file.
If a wall moves, change both.

## Assumptions

No measurements were given. Every dimension comes from scaling the sketch's
proportions until the area inside the exterior walls is 72 m².

Heights are standard assumptions: ceiling 2.80 m, doors 2.10 m, windows
0.90–2.20 m above the floor, balcony parapet 1.00 m. The floor finishes (oak,
stone, tile) are there only to tell the zones apart.

Nothing was added that isn't in the sketch: no furniture, fixtures or closets.

## Rebuilding the three.js bundle

Only needed to upgrade three.js. From this folder:

    npm i three@0.186.1 esbuild
    npx esbuild vendor/three-entry.js --bundle --minify --format=iife \
        --legal-comments=eof --outfile=vendor/three.bundle.min.js
