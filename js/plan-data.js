/*
 * Floor 4 apartment — geometry for the 3D model.
 *
 * Every number is in CENTIMETRES and matches the 2D plan in index.html.
 * Plan axes: x runs left → right, y runs top → bottom of the 2D plan.
 * The 3D model maps plan x → world X and plan y → world Z.
 *
 * Change a number here, reload index.html, and the 3D model follows.
 * (The 2D drawing is hand-drawn SVG and does not read this file.)
 */
window.HOME_PLAN = {

	// Heights were not in the sketch — these are standard assumptions.
	heights: {
		wall: 280,     // floor to ceiling
		door: 210,     // door opening height
		sill: 90,      // window sill above floor
		head: 220,     // window head above floor
		parapet: 100,  // balcony parapet
	},

	// Wall rectangles. Openings run along each wall's long side (from → to).
	walls: [
		// exterior walls, 25 cm
		{ id: 'north', x: [ - 25, 1250 ], y: [ - 25, 0 ] },
		{ id: 'west', x: [ - 25, 0 ], y: [ 0, 655 ], openings: [
			{ tag: 'W1', type: 'window', from: 35, to: 135 },
			{ tag: 'D6', type: 'door', from: 175, to: 255 },
			{ tag: 'W2', type: 'window', from: 430, to: 540 },
		] },
		{ id: 'south', x: [ 0, 1040 ], y: [ 630, 655 ] },
		{ id: 'east', x: [ 1225, 1250 ], y: [ 0, 410 ], openings: [
			{ tag: 'W3', type: 'window', from: 50, to: 150 },
			{ tag: 'W4', type: 'window', from: 200, to: 300 },
		] },
		{ id: 'recess', x: [ 1015, 1225 ], y: [ 385, 410 ] },
		{ id: 'entrance', x: [ 1015, 1040 ], y: [ 410, 630 ], openings: [
			{ tag: 'D1', type: 'door', from: 475, to: 570 },
		] },

		// partitions, 10 cm
		{ id: 'bedrooms', x: [ 385, 395 ], y: [ 0, 630 ], openings: [
			{ tag: 'D3', type: 'door', from: 180, to: 265 },
			{ tag: 'D2', type: 'door', from: 295, to: 380 },
			{ tag: 'D4', type: 'door', from: 540, to: 615 },
		] },
		{ id: 'small-master', x: [ 0, 385 ], y: [ 275, 285 ] },
		{ id: 'wet-block', x: [ 395, 865 ], y: [ 420, 430 ] },
		{ id: 'shower-bath', x: [ 655, 665 ], y: [ 430, 630 ] },
		{ id: 'bath-hall', x: [ 855, 865 ], y: [ 430, 630 ], openings: [
			{ tag: 'D5', type: 'door', from: 540, to: 615 },
		] },
	],

	// Door leaves: hinge point on the wall face, the direction the closed leaf
	// runs along the wall, and the direction it swings open into — exactly as
	// the swing arcs on the 2D plan.
	doors: [
		{ tag: 'D1', name: 'Main entrance', width: 95, hinge: [ 1015, 475 ], along: [ 0, 1 ], swing: [ - 1, 0 ], main: true },
		{ tag: 'D2', name: 'Master room', width: 85, hinge: [ 385, 295 ], along: [ 0, 1 ], swing: [ - 1, 0 ] },
		{ tag: 'D3', name: 'Small room', width: 85, hinge: [ 385, 180 ], along: [ 0, 1 ], swing: [ - 1, 0 ] },
		{ tag: 'D4', name: 'Shower', width: 75, hinge: [ 395, 540 ], along: [ 0, 1 ], swing: [ 1, 0 ] },
		{ tag: 'D5', name: 'Bathroom / WC', width: 75, hinge: [ 855, 540 ], along: [ 0, 1 ], swing: [ - 1, 0 ] },
		{ tag: 'D6', name: 'Balcony door', width: 80, hinge: [ - 25, 175 ], along: [ 0, 1 ], swing: [ - 1, 0 ] },
	],

	// Floor zones. `finish` picks the floor material: oak | stone | tile | paver.
	// `label` is where the room name sits on the floor.
	rooms: [
		{ name: 'Small room', area: '10.6', finish: 'oak', label: [ 235, 155 ], note: 'home office',
			poly: [ [ 0, 0 ], [ 385, 0 ], [ 385, 275 ], [ 0, 275 ] ] },
		{ name: 'Master room', area: '13.3', finish: 'oak', label: [ 192, 470 ],
			poly: [ [ 0, 285 ], [ 385, 285 ], [ 385, 630 ], [ 0, 630 ] ] },
		{ name: 'Living room', area: '24.7', finish: 'oak', label: [ 700, 372 ],
			poly: [ [ 395, 0 ], [ 975, 0 ], [ 975, 385 ], [ 1015, 385 ], [ 1015, 425 ], [ 865, 425 ], [ 865, 420 ], [ 395, 420 ] ] },
		{ name: 'Kitchen', area: '9.6', finish: 'stone', label: [ 1100, 192 ], note: 'open to living',
			poly: [ [ 975, 0 ], [ 1225, 0 ], [ 1225, 385 ], [ 975, 385 ] ] },
		{ name: 'Shower', area: '5.2', finish: 'tile', label: [ 540, 515 ],
			poly: [ [ 395, 430 ], [ 655, 430 ], [ 655, 630 ], [ 395, 630 ] ] },
		{ name: 'Bathroom', area: '3.8', finish: 'tile', label: [ 755, 505 ],
			poly: [ [ 665, 430 ], [ 855, 430 ], [ 855, 630 ], [ 665, 630 ] ] },
		{ name: 'Entrance', area: '3.0', finish: 'stone', label: [ 935, 600 ],
			poly: [ [ 865, 425 ], [ 1015, 425 ], [ 1015, 630 ], [ 865, 630 ] ] },
		{ name: 'Balcony', area: '1.1', finish: 'paver', label: [ - 70, 210 ], outdoor: true,
			poly: [ [ - 115, 150 ], [ - 25, 150 ], [ - 25, 270 ], [ - 115, 270 ] ] },
	],

	// The small balcony off the small room: slab plus a U-shaped parapet.
	balcony: {
		slab: { x: [ - 129, - 25 ], y: [ 136, 284 ] },
		// U-shaped parapet, 10 cm thick, open towards the flat
		parapet: [ [ - 125, 140 ], [ - 25, 140 ], [ - 25, 150 ], [ - 115, 150 ], [ - 115, 270 ], [ - 25, 270 ], [ - 25, 280 ], [ - 125, 280 ] ],
	},

	// Interior design: Japandi, for a couple. The living room is built around
	// the TV and the 8-seat set (two 3-seat sofa beds and two armchairs; guests
	// sleep on the sofa beds); the small room is a home office.
	// Each piece: type, footprint in plan cm [ x0, y0, x1, y1 ], the way its
	// front faces ('n' | 's' | 'e' | 'w'), and heights in cm (base = how far
	// above the floor it starts). home3d.js and furnish2d.js draw from this list.
	furniture: [

		// living: the set in a U facing the TV. 93 cm walkway behind the south
		// sofa, 70 cm path to the office door behind the west sofa.
		// Sizes assumed: 3-seat sofa beds 210 × 90 cm (bed = how far the opened
		// bed reaches from the back), armchairs 85 × 85 cm.
		{ type: 'rug', at: [ 520, 45, 740, 275 ], tone: 'oat' },
		{ type: 'tvUnit', at: [ 540, 0, 720, 40 ], face: 's', h: 45 },
		{ type: 'tv', at: [ 557, 0, 703, 5 ], face: 's', base: 68, h: 84 },
		{ type: 'sofa', at: [ 560, 237, 770, 327 ], face: 'n', seats: 3, bed: 140 },
		{ type: 'sofa', at: [ 465, 25, 555, 235 ], face: 'e', seats: 3, bed: 140 },
		{ type: 'armchair', at: [ 705, 55, 790, 140 ], face: 'w' },
		{ type: 'armchair', at: [ 705, 145, 790, 230 ], face: 'w' },
		{ type: 'coffeeTable', at: [ 600, 80, 660, 190 ], h: 38, shape: 'oval' },
		{ type: 'sideTable', at: [ 488, 252, 532, 296 ], h: 50 },
		{ type: 'tableLamp', at: [ 498, 262, 522, 286 ], base: 50 },
		{ type: 'plant', at: [ 735, 5, 779, 49 ], kind: 'olive' },
		{ type: 'pendant', at: [ 600, 105, 660, 165 ], kind: 'globe', base: 185 },

		// dining for four, between the armchairs and the kitchen
		{ type: 'diningTable', at: [ 895, 95, 975, 235 ], face: 'e', h: 75 },
		{ type: 'chair', at: [ 847, 117, 892, 162 ], face: 'e' },
		{ type: 'chair', at: [ 847, 168, 892, 213 ], face: 'e' },
		{ type: 'chair', at: [ 978, 117, 1023, 162 ], face: 'w' },
		{ type: 'chair', at: [ 978, 168, 1023, 213 ], face: 'w' },
		{ type: 'bowl', at: [ 920, 150, 950, 180 ], base: 75 },
		{ type: 'pendant', at: [ 913, 143, 957, 187 ], kind: 'dome', base: 150 },

		// kitchen: a U. Hob and hood on the north wall; sink, dishwasher and
		// washing machine under the windows; on the recess wall the framed
		// side-by-side fridge, then a base cabinet with the water heater in the
		// wall cabinet above it. fronts: [ from, to, kind ] along each run (cm).
		{ type: 'counter', at: [ 975, 0, 1165, 60 ], face: 's', cooktop: 1065,
			fronts: [ [ 975, 1035, 'drawers' ], [ 1035, 1095, 'drawers' ], [ 1095, 1165, 'door' ] ] },
		{ type: 'counter', at: [ 1165, 0, 1225, 385 ], face: 'w', sink: 250,
			fronts: [ [ 0, 60, 'blank' ], [ 60, 90, 'door' ], [ 90, 150, 'washer' ], [ 150, 210, 'dishwasher' ], [ 210, 290, 'sink' ], [ 290, 325, 'door' ], [ 325, 385, 'blank' ] ] },
		{ type: 'counter', at: [ 1109, 325, 1165, 385 ], face: 'n', fronts: [ [ 1109, 1165, 'door' ] ] },
		{ type: 'fridge', at: [ 1015, 311, 1109, 385 ], face: 'n', h: 178, kind: 'sideBySide', frame: true },
		{ type: 'heaterCabinet', at: [ 1109, 350, 1165, 385 ], face: 'n', base: 145, h: 70, tag: 'WH' },
		{ type: 'tiles', at: [ 975, 0, 1165, 1 ], face: 's', base: 90, h: 55 },
		{ type: 'tiles', at: [ 1109, 384, 1165, 385 ], face: 'n', base: 90, h: 55 },
		{ type: 'uppers', at: [ 975, 0, 1035, 35 ], face: 's', base: 145, h: 70, light: true },
		{ type: 'uppers', at: [ 1095, 0, 1165, 35 ], face: 's', base: 145, h: 70 },
		{ type: 'hood', at: [ 1035, 0, 1095, 50 ], face: 's', base: 155 },
		{ type: 'plant', at: [ 1182, 62, 1204, 84 ], kind: 'herb', base: 90 },

		// entrance hall
		{ type: 'shoeCabinet', at: [ 865, 432, 895, 532 ], face: 'e', h: 90 },
		{ type: 'mirror', at: [ 865, 452, 867, 512 ], face: 'e', base: 115, shape: 'round' },
		{ type: 'hooks', at: [ 900, 628, 1000, 630 ], face: 'n', base: 168 },
		{ type: 'rug', at: [ 930, 498, 1008, 552 ], tone: 'mat' },

		// master bedroom: queen bed on the south wall, sliding wardrobe opposite
		{ type: 'rug', at: [ 72, 400, 312, 570 ], tone: 'sand' },
		{ type: 'bed', at: [ 107, 420, 277, 630 ], face: 'n' },
		{ type: 'nightstand', at: [ 52, 588, 97, 628 ], face: 'n', h: 50, book: - 1 },
		{ type: 'nightstand', at: [ 287, 588, 332, 628 ], face: 'n', h: 50, book: 1 },
		{ type: 'tableLamp', at: [ 55, 594, 79, 618 ], base: 50, power: 1.8 },
		{ type: 'tableLamp', at: [ 310, 594, 334, 618 ], base: 50, dark: true }, // shares the other lamp's light
		{ type: 'wardrobe', at: [ 25, 285, 265, 345 ], face: 's', h: 220 },
		{ type: 'art', at: [ 132, 628, 252, 630 ], face: 'n', base: 125, h: 70, motif: 'lines' },
		{ type: 'curtains', at: [ 0, 395, 6, 575 ], face: 'e', window: [ 430, 540 ] },

		// small room: home office. The desk sits on the north wall with the window
		// to the left: side light, no glare behind the screen.
		{ type: 'rug', at: [ 100, 92, 290, 228 ], tone: 'sand' },
		{ type: 'desk', at: [ 15, 0, 155, 70 ], face: 's', h: 75 },
		{ type: 'monitor', at: [ 55, 6, 115, 24 ], face: 's', base: 75 },
		{ type: 'deskLamp', at: [ 20, 12, 40, 32 ], base: 75 },
		{ type: 'officeChair', at: [ 58, 80, 113, 135 ], face: 'n' },
		{ type: 'bookshelf', at: [ 350, 5, 385, 175 ], face: 'w', h: 190 },
		{ type: 'sideboard', at: [ 80, 235, 200, 275 ], face: 'n', h: 60 },
		{ type: 'art', at: [ 95, 273, 185, 275 ], face: 'n', base: 110, h: 62, motif: 'arc' },
		{ type: 'blind', at: [ 0, 35, 4, 135 ], face: 'e', base: 150, h: 70 },

		// shower room, reached from the master bedroom
		{ type: 'tiles', at: [ 565, 430, 655, 431 ], face: 's', h: 210, tone: 'wet' },
		{ type: 'tiles', at: [ 654, 430, 655, 570 ], face: 'w', h: 210, tone: 'wet' },
		{ type: 'shower', at: [ 565, 430, 655, 570 ], face: 'w', glass: [ 430, 510 ] },
		{ type: 'vanity', at: [ 420, 430, 500, 476 ], face: 's', base: 45, mirror: 'rect' },
		{ type: 'towelRail', at: [ 470, 628, 530, 630 ], face: 'n', base: 100 },

		// WC off the hall
		{ type: 'toilet', at: [ 715, 430, 805, 502 ], face: 's' },
		{ type: 'vanity', at: [ 665, 530, 700, 580 ], face: 'e', base: 45, mirror: 'round', small: true },

		// balcony: two planters, clear of the door's swing
		{ type: 'planter', at: [ - 112, 152, - 84, 174 ], kind: 'herb', level: 'balcony' },
		{ type: 'planter', at: [ - 112, 243, - 84, 268 ], kind: 'geranium', level: 'balcony' },
	],

	// Structural floor slab: the outer wall line pushed out 4 cm, so it reads
	// as a thin plinth under the model.
	slab: [ [ - 29, - 29 ], [ 1254, - 29 ], [ 1254, 414 ], [ 1044, 414 ], [ 1044, 659 ], [ - 29, 659 ] ],
};
