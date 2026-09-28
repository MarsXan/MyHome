# Floor 4 apartment — plan, 3D model and interior design

A 72 m² fourth-floor apartment, redrawn from a hand sketch as an interactive
3D model and a measured 2D plan, then furnished as a warm, minimal Japandi
home for a couple.

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
- **Doors open**, **Room names**, **Tags** (doors, windows, water heater),
  **Furniture** and **Evening light** switch those on and off. Evening light dims the sun and
  turns on the lamps at 2700 K.
- Double-click anywhere on the model to glide the camera to that spot.
- Add `#top`, `#bedrooms`, `#living` or `#entrance` to the address to open
  straight on that view.

**2D plans**: the furnished plan (the same layout as the 3D model, with the
sofa beds' opened size dashed) and the empty plan exactly as drawn, both with
dimensions; the room schedule, the door and window schedule, and the original
sketch for comparison.

**Design brief** (`design.html`): the interior-design prompts from
[MeltFlex's Claude prompt list](https://www.meltflexai.com/blog/claude-prompts-interior-design)
answered for this plan, measured against the clearances and light levels in
the [interior-design-expert skill](https://github.com/curiositech/some_claude_skills/blob/main/.claude/skills/interior-design-expert/SKILL.md):
plan review, palette, materials, room-by-room layout, lighting plan, balcony
planting, a shopping list in buying order and image prompts.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page: 3D model and 2D plan |
| `design.html` | The interior design brief |
| `css/style.css` | Page styles, light and dark theme |
| `js/plan-data.js` | All geometry and the furniture layout, in centimetres |
| `js/home3d.js` | The 3D scene: walls, doors, windows, camera, lighting |
| `js/furniture3d.js` | Builds every piece of furniture for the 3D model |
| `js/furnish2d.js` | Draws the same furniture on the 2D plan |
| `vendor/three.bundle.min.js` | three.js r186 and the add-ons used, as one script |
| `vendor/three-entry.js` | How that bundle was built |
| `vendor/LICENSE-three.txt` | three.js licence (MIT) |
| `fonts/` | Archivo Narrow, IBM Plex Sans, IBM Plex Mono (SIL Open Font License) |
| `img/sketch.jpg` | The original hand sketch |

## Changing the model

Edit `js/plan-data.js` and reload. Walls, openings, door swings, room
outlines, floor finishes, heights and the furniture layout all live there.
Each piece of furniture is a type, a footprint in plan centimetres and the
direction it faces; move a footprint and both the model and the plan follow.

The 2D plan is hand-drawn SVG inside `index.html` and does not read that file.
If a wall moves, change both.

## Assumptions

No measurements were given. Every dimension comes from scaling the sketch's
proportions until the area inside the exterior walls is 72 m².

Heights are standard assumptions: ceiling 2.80 m, doors 2.10 m, windows
0.90–2.20 m above the floor, balcony parapet 1.00 m. The floor finishes (oak,
stone, tile) are there only to tell the zones apart.

The architecture is exactly as drawn. The furniture, lamps and finishes are
a proposed interior; switch them off to see the flat as sketched.

## Rebuilding the three.js bundle

Only needed to upgrade three.js. From this folder:

    npm i three@0.186.1 esbuild
    npx esbuild vendor/three-entry.js --bundle --minify --format=iife \
        --legal-comments=eof --outfile=vendor/three.bundle.min.js
