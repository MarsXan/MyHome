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
		{ name: 'Small room', area: '10.6', finish: 'oak', label: [ 192, 150 ],
			poly: [ [ 0, 0 ], [ 385, 0 ], [ 385, 275 ], [ 0, 275 ] ] },
		{ name: 'Master room', area: '13.3', finish: 'oak', label: [ 192, 470 ],
			poly: [ [ 0, 285 ], [ 385, 285 ], [ 385, 630 ], [ 0, 630 ] ] },
		{ name: 'Living room', area: '24.7', finish: 'oak', label: [ 685, 215 ],
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

	// Structural floor slab: the outer wall line pushed out 4 cm, so it reads
	// as a thin plinth under the model.
	slab: [ [ - 29, - 29 ], [ 1254, - 29 ], [ 1254, 414 ], [ 1044, 414 ], [ 1044, 659 ], [ - 29, 659 ] ],
};
