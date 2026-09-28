/*
 * Floor 4 apartment — interactive 3D model.
 *
 * A plain script with no build step. index.html loads, in this order:
 *   vendor/three.bundle.min.js   global THREE      (three.js r186 + add-ons)
 *   js/plan-data.js              global HOME_PLAN  (all geometry, in cm)
 *   js/home3d.js                 this file
 *
 * Every texture is painted on a canvas at start-up, so the model needs no
 * image files and opens straight from disk.
 */
( function () {

	'use strict';

	const stage = document.getElementById( 'stage' );
	if ( ! stage ) return;

	const note = document.getElementById( 'stage-msg' );
	const fail = ( text ) => {

		stage.classList.add( 'is-failed' );
		if ( note ) {

			note.textContent = text;
			note.hidden = false;

		}

	};

	if ( ! window.THREE ) return fail( 'The 3D engine (vendor/three.bundle.min.js) did not load. Keep the home-plan folder together and open index.html again.' );
	if ( ! window.HOME_PLAN ) return fail( 'The plan data (js/plan-data.js) did not load. Keep the home-plan folder together and open index.html again.' );

	const T = window.THREE;
	const PLAN = window.HOME_PLAN;
	const reduceMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	/* ------------------------------------------------------------ units */

	const m = ( cm ) => cm / 100; // centimetres → metres
	const CENTER = { x: 6.0, z: 3.15 }; // plan point (m) placed at the world origin
	const X = ( xm ) => xm - CENTER.x;
	const Z = ( ym ) => ym - CENTER.z;
	const rect = ( xs, ys ) => [ X( m( xs[ 0 ] ) ), X( m( xs[ 1 ] ) ), Z( m( ys[ 0 ] ) ), Z( m( ys[ 1 ] ) ) ];

	const HT = {
		wall: m( PLAN.heights.wall ),
		door: m( PLAN.heights.door ),
		sill: m( PLAN.heights.sill ),
		head: m( PLAN.heights.head ),
		parapet: m( PLAN.heights.parapet ),
	};
	const FLOOR = 0.012; // floor finish thickness
	const BALCONY_DROP = 0.03; // the balcony sits one small step down
	const SLAB = 0.22; // structural slab under the flat

	/* --------------------------------------------------------- renderer */

	let renderer;
	try {

		renderer = new T.WebGLRenderer( { antialias: false, powerPreference: 'high-performance' } );

	} catch ( err ) {

		return fail( 'This browser could not start WebGL, so the 3D model can’t be shown here. The 2D plan below has every detail.' );

	}

	const compact = Math.min( window.innerWidth, window.innerHeight ) < 700;
	renderer.setPixelRatio( Math.min( window.devicePixelRatio || 1, compact ? 1.5 : 2 ) );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = T.PCFShadowMap;
	renderer.toneMapping = T.NeutralToneMapping;
	renderer.toneMappingExposure = 1.0;
	renderer.localClippingEnabled = true; // furniture is cut by the wall-height slider
	renderer.domElement.className = 'stage-canvas';
	stage.prepend( renderer.domElement );
	renderer.domElement.addEventListener( 'webglcontextlost', ( e ) => {

		e.preventDefault();
		fail( 'The graphics card dropped the 3D view. Reload the page to bring it back.' );

	} );

	const labelRenderer = new T.CSS2DRenderer();
	labelRenderer.domElement.className = 'label-layer';
	stage.appendChild( labelRenderer.domElement );

	const scene = new T.Scene();
	const camera = new T.PerspectiveCamera( 30, 1, 0.1, 250 );

	const pmrem = new T.PMREMGenerator( renderer );
	scene.environment = pmrem.fromScene( new T.RoomEnvironment(), 0.04 ).texture;
	scene.environmentIntensity = 0.42;
	pmrem.dispose();

	/* ----------------------------------------------------------- lights */

	// low north-west sun: shadow bands fall across the floors and light
	// comes in through the two west windows
	const sun = new T.DirectionalLight( 0xfff0dc, 2.9 );
	sun.position.set( - 9, 13, - 7 );
	sun.castShadow = true;
	sun.shadow.mapSize.setScalar( compact ? 2048 : 4096 );
	Object.assign( sun.shadow.camera, { left: - 10, right: 10, top: 10, bottom: - 10, near: 2, far: 45 } );
	sun.shadow.camera.updateProjectionMatrix();
	sun.shadow.bias = - 0.0003;
	sun.shadow.normalBias = 0.02;
	sun.shadow.radius = 2;
	scene.add( sun, sun.target );

	const hemi = new T.HemisphereLight( 0xeaf1f8, 0xcfc3b2, 0.5 );
	scene.add( hemi );

	/* --------------------------------------------- procedural textures */

	const aniso = Math.min( 8, renderer.capabilities.getMaxAnisotropy() );

	// mulberry32: the same "random" pattern on every load
	function rng( seed ) {

		return function () {

			seed = ( seed + 0x6D2B79F5 ) | 0;
			let t = Math.imul( seed ^ ( seed >>> 15 ), 1 | seed );
			t = ( t + Math.imul( t ^ ( t >>> 7 ), 61 | t ) ) ^ t;
			return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;

		};

	}

	const hsl = ( h, s, l, a = 1 ) => `hsla(${ h },${ s }%,${ l }%,${ a })`;

	// `span` = metres one copy of the texture covers on the floor
	function canvasTexture( w, h, draw, span, color = true ) {

		const c = document.createElement( 'canvas' );
		c.width = w;
		c.height = h;
		draw( c.getContext( '2d' ), w, h );
		const tex = new T.CanvasTexture( c );
		tex.colorSpace = color ? T.SRGBColorSpace : T.NoColorSpace;
		tex.anisotropy = aniso;
		if ( span ) {

			tex.wrapS = tex.wrapT = T.RepeatWrapping;
			tex.repeat.set( 1 / span, 1 / span );

		}

		return tex;

	}

	// Oak boards 18.5 cm wide, 0.9–1.9 m long. One copy covers 2.4 × 2.4 m and
	// every row closes on itself, so the pattern tiles without a seam.
	function drawOak( g, S ) {

		const r = rng( 11 );
		const rows = 13;
		const rowH = S / rows;
		const joints = [];

		for ( let row = 0; row < rows; row ++ ) {

			const y = row * rowH;
			const lens = [];
			let sum = 0;
			while ( sum < S ) {

				const len = S * ( 0.37 + r() * 0.42 );
				lens.push( len );
				sum += len;

			}

			lens[ lens.length - 1 ] -= sum - S;
			if ( lens[ lens.length - 1 ] < S * 0.2 ) lens[ lens.length - 2 ] += lens.pop();

			let x = r() * S;
			for ( const len of lens ) {

				const board = {
					hue: 29 + r() * 6, sat: 32 + r() * 12, lig: 58 + r() * 10,
					grain: Array.from( { length: 30 }, () => ( {
						y: r() * rowH, amp: 0.5 + r() * 2.4, f: 1 + r() * 3.5, p: r() * 6.28,
						a: 0.03 + r() * 0.08, dark: r() < 0.72, w: 0.6 + r() * 1.3,
					} ) ),
				};
				paintBoard( g, x, y, len, rowH, board );
				paintBoard( g, x - S, y, len, rowH, board );
				joints.push( [ x % S, y ] );
				x += len;

			}

		}

		g.fillStyle = 'rgba(62,40,22,0.55)';
		for ( let row = 0; row < rows; row ++ ) g.fillRect( 0, row * rowH, S, 1.5 );
		g.fillStyle = 'rgba(255,238,214,0.10)';
		for ( let row = 0; row < rows; row ++ ) g.fillRect( 0, row * rowH + 1.5, S, 1 );
		g.fillStyle = 'rgba(62,40,22,0.5)';
		for ( const [ x, y ] of joints ) {

			g.fillRect( x, y, 1.5, rowH );
			g.fillRect( x - S, y, 1.5, rowH );

		}

	}

	function paintBoard( g, x, y, w, h, b ) {

		if ( x + w < 0 || x > g.canvas.width ) return;
		g.save();
		g.beginPath();
		g.rect( x, y, w, h );
		g.clip();
		const grad = g.createLinearGradient( x, y, x + w, y + h );
		grad.addColorStop( 0, hsl( b.hue, b.sat, b.lig - 2 ) );
		grad.addColorStop( 0.5, hsl( b.hue + 1, b.sat - 2, b.lig + 1.5 ) );
		grad.addColorStop( 1, hsl( b.hue - 1, b.sat, b.lig - 1.5 ) );
		g.fillStyle = grad;
		g.fillRect( x, y, w, h );
		for ( const l of b.grain ) {

			g.beginPath();
			for ( let t = 0; t <= w + 6; t += 6 ) {

				const k = t / w;
				const yy = y + l.y + Math.sin( l.p + k * l.f * 6.283 ) * l.amp + Math.sin( l.p * 2.1 + k * l.f * 15.1 ) * l.amp * 0.3;
				if ( t === 0 ) g.moveTo( x, yy );
				else g.lineTo( x + t, yy );

			}

			g.lineWidth = l.w;
			g.strokeStyle = l.dark
				? hsl( b.hue - 4, b.sat + 10, b.lig - 24, l.a )
				: hsl( b.hue + 3, b.sat - 8, b.lig + 16, l.a * 0.8 );
			g.stroke();

		}

		g.restore();

	}

	// Square tiles with grout; `n` tiles per side of one texture copy.
	function drawTiles( g, S, o ) {

		const r = rng( o.seed );
		const s = S / o.n;
		const gw = o.grout;
		g.fillStyle = o.groutColor;
		g.fillRect( 0, 0, S, S );
		for ( let i = 0; i < o.n; i ++ ) for ( let j = 0; j < o.n; j ++ ) {

			const x = i * s + gw / 2;
			const y = j * s + gw / 2;
			const w = s - gw;
			g.fillStyle = hsl( o.base[ 0 ] + ( r() - 0.5 ) * 2, o.base[ 1 ], o.base[ 2 ] + ( r() - 0.5 ) * o.vary );
			g.fillRect( x, y, w, w );
			g.save();
			g.beginPath();
			g.rect( x, y, w, w );
			g.clip();
			for ( let k = 0; k < o.clouds; k ++ ) {

				const cx = x + r() * w, cy = y + r() * w, rad = w * ( 0.2 + r() * 0.6 );
				const rg = g.createRadialGradient( cx, cy, 0, cx, cy, rad );
				rg.addColorStop( 0, r() < 0.5 ? `rgba(255,255,255,${ o.cloudA })` : `rgba(60,50,40,${ o.cloudA * 0.7 })` );
				rg.addColorStop( 1, 'rgba(0,0,0,0)' );
				g.fillStyle = rg;
				g.fillRect( x, y, w, w );

			}

			g.strokeStyle = 'rgba(255,255,255,0.2)';
			g.lineWidth = 1.2;
			g.strokeRect( x + 0.6, y + 0.6, w - 1.2, w - 1.2 );
			g.restore();

		}

		for ( let k = 0; k < o.speckles; k ++ ) {

			g.fillStyle = r() < 0.5 ? 'rgba(40,35,30,0.10)' : 'rgba(255,255,255,0.12)';
			const sz = 0.8 + r() * 1.4;
			g.fillRect( r() * S, r() * S, sz, sz );

		}

	}

	// Vertical-grain veneer for the door leaves.
	function drawVeneer( g, w, h, tone ) {

		const r = rng( tone.seed );
		g.fillStyle = hsl( tone.h, tone.s, tone.l );
		g.fillRect( 0, 0, w, h );
		for ( let i = 0; i < 70; i ++ ) {

			const x0 = r() * w, amp = 1 + r() * 5, f = 0.5 + r() * 2, p = r() * 6.28;
			g.beginPath();
			for ( let y = 0; y <= h; y += 8 ) {

				const x = x0 + Math.sin( p + ( y / h ) * f * 6.283 ) * amp;
				if ( y === 0 ) g.moveTo( x, y );
				else g.lineTo( x, y );

			}

			g.lineWidth = 0.6 + r() * 1.6;
			g.strokeStyle = r() < 0.7
				? hsl( tone.h - 4, tone.s + 8, tone.l - 18, 0.05 + r() * 0.08 )
				: hsl( tone.h + 3, tone.s - 6, tone.l + 14, 0.05 + r() * 0.06 );
			g.stroke();

		}

	}

	const tex = {
		oak: canvasTexture( 1024, 1024, drawOak, 2.4 ),
		stone: canvasTexture( 1024, 1024, ( g, S ) => drawTiles( g, S, { seed: 5, n: 4, grout: 3, groutColor: '#b3aca1', base: [ 36, 11, 82 ], vary: 3, clouds: 3, cloudA: 0.05, speckles: 9000 } ), 2.4 ),
		tile: canvasTexture( 1024, 1024, ( g, S ) => drawTiles( g, S, { seed: 9, n: 4, grout: 5, groutColor: '#9fa8ae', base: [ 200, 8, 86 ], vary: 1.6, clouds: 3, cloudA: 0.08, speckles: 2500 } ), 1.2 ),
		paver: canvasTexture( 512, 512, ( g, S ) => drawTiles( g, S, { seed: 3, n: 4, grout: 4, groutColor: '#8a8379', base: [ 34, 10, 70 ], vary: 5, clouds: 5, cloudA: 0.1, speckles: 5000 } ), 1.6 ),
		door: canvasTexture( 256, 640, ( g, w, h ) => drawVeneer( g, w, h, { h: 33, s: 40, l: 66, seed: 21 } ) ),
		mainDoor: canvasTexture( 256, 640, ( g, w, h ) => drawVeneer( g, w, h, { h: 24, s: 30, l: 30, seed: 34 } ) ),
	};

	/* -------------------------------------------------------- materials */

	const mat = {
		wall: new T.MeshStandardMaterial( { color: 0xeceae5, roughness: 0.94 } ),
		cap: new T.MeshStandardMaterial( { color: 0x1c2530, roughness: 0.78 } ), // the cut, like the plan's solid walls
		slab: new T.MeshStandardMaterial( { color: 0x8f8c86, roughness: 0.96 } ),
		sill: new T.MeshStandardMaterial( { color: 0xd8d2c7, roughness: 0.55 } ),
		frame: new T.MeshStandardMaterial( { color: 0x2b3139, roughness: 0.4, metalness: 0.4 } ),
		glass: new T.MeshPhysicalMaterial( { color: 0xe3f0f2, roughness: 0.02, metalness: 0, transmission: 1, thickness: 0.01, ior: 1.5, envMapIntensity: 1.5 } ),
		door: new T.MeshStandardMaterial( { map: tex.door, roughness: 0.52 } ),
		mainDoor: new T.MeshStandardMaterial( { map: tex.mainDoor, roughness: 0.45 } ),
	};

	const FINISH = {
		oak: new T.MeshStandardMaterial( { map: tex.oak, roughness: 0.6, envMapIntensity: 0.7 } ),
		stone: new T.MeshStandardMaterial( { map: tex.stone, roughness: 0.32 } ),
		tile: new T.MeshStandardMaterial( { map: tex.tile, roughness: 0.24 } ),
		paver: new T.MeshStandardMaterial( { map: tex.paver, roughness: 0.86 } ),
	};

	/* ------------------------------------------------ geometry helpers */

	const model = new T.Group();
	scene.add( model );

	const UNIT = new T.BoxGeometry( 1, 1, 1 );
	const cuttable = [];
	const blockers = []; // meshes that can stand between the camera and a label
	const faces = ( side, top ) => [ side, side, top, side, side, side ]; // +x −x +y −y +z −z

	// A box the wall-height slider can cut. x/z in world metres, y in metres.
	// `section` is the material shown on top where the cut passes through it.
	function block( x0, x1, z0, z1, y0, y1, material, section, opts = {} ) {

		const whole = faces( material, material );
		const cut = faces( material, section || material );
		const mesh = new T.Mesh( UNIT, whole );
		mesh.position.set( ( x0 + x1 ) / 2, ( y0 + y1 ) / 2, ( z0 + z1 ) / 2 );
		mesh.scale.set( x1 - x0, y1 - y0, z1 - z0 );
		mesh.castShadow = opts.cast !== false;
		mesh.receiveShadow = true;
		( opts.parent || model ).add( mesh );
		// walls that reach the ceiling always show the dark cut on top
		cuttable.push( { mesh, y0, y1, whole, cut, ceiling: y1 >= HT.wall - 1e-4 } );
		if ( material !== mat.glass ) blockers.push( mesh );
		return mesh;

	}

	// A box that is never cut (slabs, thresholds).
	function solid( x0, x1, z0, z1, y0, y1, material ) {

		const mesh = new T.Mesh( UNIT, material );
		mesh.position.set( ( x0 + x1 ) / 2, ( y0 + y1 ) / 2, ( z0 + z1 ) / 2 );
		mesh.scale.set( x1 - x0, y1 - y0, z1 - z0 );
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		model.add( mesh );
		return mesh;

	}

	// Furniture is cut by this plane instead of being rebuilt: y above it is hidden.
	const cutPlane = new T.Plane( new T.Vector3( 0, - 1, 0 ), HT.wall + 0.001 );
	let lastCut = HT.wall;

	function applyCut( h ) {

		lastCut = h;
		cutPlane.constant = h + 0.001;
		for ( const wall of walls ) buildWall( wall, h );
		buildParapet( h );
		for ( const c of cuttable ) {

			const top = Math.min( c.y1, h );
			const show = top > c.y0 + 0.002;
			c.mesh.visible = show;
			if ( ! show ) continue;
			c.mesh.scale.y = top - c.y0;
			c.mesh.position.y = ( c.y0 + top ) / 2;
			c.mesh.material = ( c.ceiling || h < c.y1 - 1e-4 ) ? c.cut : c.whole;

		}

	}

	// Floor plates from plan polygons (cm). Built in the XY plane with y = −z,
	// then laid flat, so the texture coordinates are world metres.
	function plate( poly, depth, material, y, cast = false ) {

		const shape = new T.Shape();
		poly.forEach( ( [ px, py ], i ) => {

			const sx = X( m( px ) ), sy = - Z( m( py ) );
			if ( i === 0 ) shape.moveTo( sx, sy );
			else shape.lineTo( sx, sy );

		} );
		const geo = new T.ExtrudeGeometry( shape, { depth, bevelEnabled: false } );
		geo.rotateX( - Math.PI / 2 );
		const mesh = new T.Mesh( geo, material );
		mesh.position.y = y;
		mesh.receiveShadow = true;
		mesh.castShadow = cast;
		model.add( mesh );
		return mesh;

	}

	/* ------------------------------------------------------------ build */

	const tagSpots = []; // [ tag, position ] for the D1…W4 chips

	function addWindow( [ x0, x1, z0, z1 ], alongX, tag ) {

		const F = 0.055, D = 0.07, G = 0.012; // frame face, frame depth, glass
		const y0 = HT.sill, y1 = HT.head;
		const [ a0, a1, b0, b1 ] = alongX ? [ x0, x1, z0, z1 ] : [ z0, z1, x0, x1 ]; // a: along wall, b: through it
		const bc = ( b0 + b1 ) / 2;
		const put = ( p0, p1, q0, q1, yy0, yy1, material, cast = true ) => alongX
			? block( p0, p1, q0, q1, yy0, yy1, material, null, { cast } )
			: block( q0, q1, p0, p1, yy0, yy1, material, null, { cast } );

		put( a0, a1, bc - D / 2, bc + D / 2, y0, y0 + F, mat.frame );
		put( a0, a1, bc - D / 2, bc + D / 2, y1 - F, y1, mat.frame );
		put( a0, a0 + F, bc - D / 2, bc + D / 2, y0 + F, y1 - F, mat.frame );
		put( a1 - F, a1, bc - D / 2, bc + D / 2, y0 + F, y1 - F, mat.frame );
		const glass = put( a0 + F, a1 - F, bc - G / 2, bc + G / 2, y0 + F, y1 - F, mat.glass, false );
		glass.receiveShadow = false;

		const mid = ( a0 + a1 ) / 2;
		tagSpots.push( [ tag, alongX ? new T.Vector3( mid, y0 + 0.45, bc ) : new T.Vector3( bc, y0 + 0.45, mid ) ] );

	}

	// structural slab
	plate( PLAN.slab, SLAB, mat.slab, - SLAB, true );

	// Walls. Each wall is ONE extrusion of its elevation with the openings cut
	// out, so there are no internal faces to show as hairlines. The slider
	// rebuilds them at the new height; a thin dark cap marks the cut on top.
	const walls = [];

	for ( const w of PLAN.walls ) {

		const alongX = ( w.x[ 1 ] - w.x[ 0 ] ) >= ( w.y[ 1 ] - w.y[ 0 ] );
		const [ a0, a1 ] = ( alongX ? w.x : w.y ).map( m );
		const [ t0, t1 ] = ( alongX ? w.y : w.x ).map( m );
		const span = ( s, e ) => alongX ? rect( [ s, e ], w.y ) : rect( w.x, [ s, e ] );
		const ops = [];

		for ( const o of ( w.openings || [] ).slice().sort( ( p, q ) => p.from - q.from ) ) {

			const isWindow = o.type === 'window';
			ops.push( { from: m( o.from ), to: m( o.to ), bottom: isWindow ? HT.sill : 0, top: isWindow ? HT.head : HT.door } );
			if ( isWindow ) {

				addWindow( span( o.from, o.to ), alongX, o.tag );

			} else {

				const [ x0, x1, z0, z1 ] = span( o.from, o.to );
				solid( x0, x1, z0, z1, 0, FLOOR, mat.sill ).castShadow = false; // threshold

			}

		}

		// the elevation is drawn in local x = plan metres along the wall, y = height,
		// then extruded through the wall's thickness
		const mesh = new T.Mesh( new T.BufferGeometry(), mat.wall );
		if ( alongX ) {

			mesh.position.set( - CENTER.x, 0, Z( t0 ) );

		} else {

			mesh.rotation.y = - Math.PI / 2;
			mesh.position.set( X( t1 ), 0, - CENTER.z );

		}

		mesh.castShadow = true;
		mesh.receiveShadow = true;
		model.add( mesh );
		blockers.push( mesh );
		const cap = new T.Group();
		model.add( cap );
		walls.push( { mesh, cap, alongX, a0, a1, t0, t1, ops } );

	}

	// Elevation outline(s) of a wall cut at height H: doors notch the bottom,
	// windows that reach the cut notch the top, the rest become holes. An
	// opening taller than the cut splits the wall in two.
	function wallShapes( wall, H ) {

		const split = wall.ops.filter( ( o ) => o.bottom <= 1e-6 && o.top >= H - 1e-6 );
		const runs = [];
		let at = wall.a0;
		for ( const o of split ) {

			if ( o.from > at ) runs.push( [ at, o.from ] );
			at = o.to;

		}

		if ( wall.a1 > at ) runs.push( [ at, wall.a1 ] );

		return runs.map( ( [ s0, s1 ] ) => {

			const own = wall.ops.filter( ( o ) => o.from >= s0 - 1e-6 && o.to <= s1 + 1e-6 && o.bottom < H - 1e-6 );
			const shape = new T.Shape();
			shape.moveTo( s0, 0 );
			for ( const o of own.filter( ( o ) => o.bottom <= 1e-6 ) ) {

				shape.lineTo( o.from, 0 );
				shape.lineTo( o.from, o.top );
				shape.lineTo( o.to, o.top );
				shape.lineTo( o.to, 0 );

			}

			shape.lineTo( s1, 0 );
			shape.lineTo( s1, H );
			for ( const o of own.filter( ( o ) => o.bottom > 1e-6 && o.top >= H - 1e-6 ).reverse() ) {

				shape.lineTo( o.to, H );
				shape.lineTo( o.to, o.bottom );
				shape.lineTo( o.from, o.bottom );
				shape.lineTo( o.from, H );

			}

			shape.lineTo( s0, H );
			shape.closePath();
			for ( const o of own.filter( ( o ) => o.bottom > 1e-6 && o.top < H - 1e-6 ) ) {

				const hole = new T.Path();
				hole.moveTo( o.from, o.bottom );
				hole.lineTo( o.from, o.top );
				hole.lineTo( o.to, o.top );
				hole.lineTo( o.to, o.bottom );
				hole.closePath();
				shape.holes.push( hole );

			}

			return shape;

		} );

	}

	function buildWall( wall, h ) {

		const H = Math.min( h, HT.wall );
		wall.mesh.geometry.dispose();
		wall.cap.clear();
		if ( H <= 0.002 ) {

			wall.mesh.geometry = new T.BufferGeometry();
			wall.mesh.visible = false;
			return;

		}

		wall.mesh.visible = true;
		wall.mesh.geometry = new T.ExtrudeGeometry( wallShapes( wall, H ), { depth: wall.t1 - wall.t0, bevelEnabled: false } );

		// dark cap over the solid stretches at the cut line
		const gaps = wall.ops.filter( ( o ) => o.bottom < H - 1e-6 && o.top >= H - 1e-6 );
		let at = wall.a0;
		const solidRuns = [];
		for ( const o of gaps ) {

			if ( o.from > at ) solidRuns.push( [ at, o.from ] );
			at = o.to;

		}

		if ( wall.a1 > at ) solidRuns.push( [ at, wall.a1 ] );
		for ( const [ s0, s1 ] of solidRuns ) {

			const c = new T.Mesh( UNIT, mat.cap );
			const e = 0.001; // 1 mm overlap so neighbouring caps close up
			const [ x0, x1, z0, z1 ] = wall.alongX
				? [ X( s0 ) - e, X( s1 ) + e, Z( wall.t0 ), Z( wall.t1 ) ]
				: [ X( wall.t0 ), X( wall.t1 ), Z( s0 ) - e, Z( s1 ) + e ];
			c.position.set( ( x0 + x1 ) / 2, H + 0.001, ( z0 + z1 ) / 2 );
			c.scale.set( x1 - x0, 0.002, z1 - z0 );
			c.receiveShadow = true;
			wall.cap.add( c );

		}

	}

	// floors
	const floors = [];
	for ( const room of PLAN.rooms ) {

		floors.push( plate( room.poly, FLOOR, FINISH[ room.finish ] || FINISH.oak, room.outdoor ? - BALCONY_DROP : 0 ) );

	}

	// balcony: slab, and one U-shaped parapet extruded from its outline
	{

		const [ x0, x1, z0, z1 ] = rect( PLAN.balcony.slab.x, PLAN.balcony.slab.y );
		solid( x0, x1, z0, z1, - 0.2, - BALCONY_DROP, mat.slab );

	}

	const parapetShape = new T.Shape();
	PLAN.balcony.parapet.forEach( ( [ px, py ], i ) => {

		const sx = X( m( px ) ), sy = - Z( m( py ) );
		if ( i === 0 ) parapetShape.moveTo( sx, sy );
		else parapetShape.lineTo( sx, sy );

	} );
	const parapet = new T.Mesh( new T.BufferGeometry(), mat.wall );
	parapet.position.y = - BALCONY_DROP;
	parapet.castShadow = true;
	parapet.receiveShadow = true;
	model.add( parapet );
	blockers.push( parapet );

	function buildParapet( h ) {

		const top = Math.min( h, HT.parapet );
		parapet.geometry.dispose();
		const geo = new T.ExtrudeGeometry( parapetShape, { depth: top + BALCONY_DROP, bevelEnabled: false } );
		geo.rotateX( - Math.PI / 2 );
		parapet.geometry = geo;
		// groups: 0 = top and bottom, 1 = sides. Dark on top only when cut.
		parapet.material = h < HT.parapet - 1e-4 ? [ mat.cap, mat.wall ] : mat.wall;

	}

	// door leaves, hinged exactly where the plan draws the swing
	const leaves = [];
	for ( const d of PLAN.doors ) {

		const width = m( d.width ) - 0.02, thick = 0.04;
		const [ ax, az ] = d.along;
		const [ sx, sz ] = d.swing;
		const pivot = new T.Group();
		pivot.position.set(
			X( m( d.hinge[ 0 ] ) - sx * 0.02 + ax * 0.01 ), 0,
			Z( m( d.hinge[ 1 ] ) - sz * 0.02 + az * 0.01 ) );
		model.add( pivot );
		block( 0, width, - thick / 2, thick / 2, FLOOR + 0.004, HT.door - 0.004, d.main ? mat.mainDoor : mat.door, mat.cap, { parent: pivot } );

		const closed = Math.atan2( - az, ax );
		let delta = Math.atan2( - sz, sx ) - closed;
		delta = Math.atan2( Math.sin( delta ), Math.cos( delta ) );
		leaves.push( { pivot, closed, delta } );

		tagSpots.push( [ d.tag, new T.Vector3(
			X( m( d.hinge[ 0 ] ) + ax * m( d.width ) / 2 - sx * 0.06 ), 1.1,
			Z( m( d.hinge[ 1 ] ) + az * m( d.width ) / 2 - sz * 0.06 ) ) ] );

	}

	let doorsOpen = 1;
	function setDoors( t ) {

		doorsOpen = t;
		for ( const l of leaves ) l.pivot.rotation.y = l.closed + l.delta * t;

	}

	applyCut( HT.wall ); // build the walls at full height before measuring the model

	// interior design: furniture, lamps and textiles (js/furniture3d.js)
	const furnish = window.HOME_FURNITURE
		? window.HOME_FURNITURE( T, { X, Z, m, FLOOR, BALCONY_DROP, canvasTexture, rng, hsl, cutPlane, glass: mat.glass, wallHeight: HT.wall } )
		: null;
	if ( furnish ) model.add( furnish.group );

	/* ----------------------------------------------- ground and shadow */

	const ground = new T.Mesh( new T.PlaneGeometry( 120, 120 ), new T.ShadowMaterial( { color: 0x17202a, opacity: 0.2 } ) );
	ground.rotation.x = - Math.PI / 2;
	ground.position.y = - SLAB - 0.002;
	ground.receiveShadow = true;
	scene.add( ground );

	// a soft ambient shadow under the model, independent of the sun
	const blur = canvasTexture( 512, 320, ( g, w, h ) => {

		g.fillStyle = '#000';
		g.fillRect( 0, 0, w, h );
		g.shadowColor = '#fff';
		g.shadowBlur = 40;
		g.shadowOffsetX = w * 4;
		g.fillStyle = '#fff';
		g.fillRect( 64 - w * 4, 64, w - 128, h - 128 );

	}, 0, false );
	const pad = new T.Mesh( new T.PlaneGeometry( 18.2, 11.4 ), new T.MeshBasicMaterial( { color: 0x0e151d, alphaMap: blur, transparent: true, opacity: 0.32, depthWrite: false } ) );
	pad.rotation.x = - Math.PI / 2;
	pad.position.set( - 0.38, - SLAB - 0.001, 0 );
	scene.add( pad );

	/* ----------------------------------------------------------- labels */

	const roomLayer = new T.Group();
	const tagLayer = new T.Group();
	scene.add( roomLayer, tagLayer );

	function label( parent, className, html, pos ) {

		const el = document.createElement( 'div' );
		el.className = className;
		el.innerHTML = html;
		const obj = new T.CSS2DObject( el );
		obj.position.copy( pos );
		parent.add( obj );
		return obj;

	}

	const labels = [];
	for ( const room of PLAN.rooms ) {

		const [ lx, ly ] = room.label;
		const obj = label( roomLayer, 'room-3d' + ( room.outdoor ? ' is-small' : '' ),
			`<b>${ room.name }</b><span>${ room.area } m²${ room.note ? ' · ' + room.note : '' }</span>`,
			new T.Vector3( X( m( lx ) ), room.outdoor ? 0 : 0.03, Z( m( ly ) ) ) );
		obj.userData.room = true;
		labels.push( obj );

	}

	for ( const [ tag, pos ] of tagSpots ) labels.push( label( tagLayer, 'tag-3d', tag, pos ) );

	// Fade a label when walls stand between it and the camera. Room labels
	// test five points around their anchor, so grazing a wall edge doesn't count.
	const ray = new T.Raycaster();
	const toLabel = new T.Vector3();
	const anchor = new T.Vector3();
	const probe = new T.Vector3();
	const AROUND = [ [ 0, 0 ], [ 0.3, 0 ], [ - 0.3, 0 ], [ 0, 0.3 ], [ 0, - 0.3 ] ];

	function blocked( point, live ) {

		toLabel.copy( point ).sub( camera.position );
		const dist = toLabel.length();
		ray.set( camera.position, toLabel.divideScalar( dist ) );
		ray.far = dist - 0.05;
		return ray.intersectObjects( live, false ).length > 0;

	}

	function updateOcclusion() {

		const live = blockers.filter( ( b ) => b.visible );
		for ( const obj of labels ) {

			obj.getWorldPosition( anchor );
			const spots = obj.userData.room ? AROUND : AROUND.slice( 0, 1 );
			let hits = 0;
			for ( const [ dx, dz ] of spots ) {

				if ( blocked( probe.set( anchor.x + dx, anchor.y, anchor.z + dz ), live ) ) hits ++;

			}

			obj.element.classList.toggle( 'is-behind', hits >= Math.max( 1, spots.length - 1 ) );

		}

	}

	/* --------------------------------------------- camera and controls */

	const controls = new T.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.075;
	controls.screenSpacePanning = true;
	controls.zoomToCursor = true;
	controls.minDistance = 2.5;
	controls.maxDistance = 48;
	controls.maxPolarAngle = T.MathUtils.degToRad( 87 );

	// dir: from the target towards the camera. Views with `eye` sit inside
	// the flat at standing height; the rest are fitted to the model's bounds.
	const modelBox = new T.Box3().setFromObject( model );
	const worldUp = new T.Vector3( 0, 1, 0 );
	const corners = ( b ) => Array.from( { length: 8 }, ( _, i ) => new T.Vector3(
		i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z ) );

	// the two bedrooms and the balcony, slab to ceiling
	const bs = PLAN.balcony.slab;
	const bedroomPts = [];
	for ( const [ px, py ] of [ [ - 25, - 25 ], [ 395, - 25 ], [ 395, 655 ], [ - 25, 655 ], [ bs.x[ 0 ], bs.y[ 0 ] ], [ bs.x[ 0 ], bs.y[ 1 ] ] ] ) {

		for ( const y of [ - SLAB, HT.wall ] ) bedroomPts.push( new T.Vector3( X( m( px ) ), y, Z( m( py ) ) ) );

	}

	// the entrance corner: hall, bathroom and the south end of the kitchen
	const entrancePts = [];
	for ( const [ px, py ] of [ [ 830, 250 ], [ 1250, 250 ], [ 1250, 410 ], [ 1040, 655 ], [ 830, 655 ] ] ) {

		for ( const y of [ - SLAB, HT.wall ] ) entrancePts.push( new T.Vector3( X( m( px ) ), y, Z( m( py ) ) ) );

	}

	// dir: from the target towards the camera. Views with `eye` stand inside
	// the flat at eye height with a wider lens; the others are framed on `pts`.
	const VIEWS = {
		overview: { dir: [ - 0.62, 2.05, 1 ], pts: corners( modelBox ), fov: 30 },
		top: { dir: [ 0, 1, 0.0001 ], pts: corners( modelBox ), fov: 30 },
		bedrooms: { dir: [ - 0.85, 1.9, 0.5 ], pts: bedroomPts, fov: 30 },
		living: { eye: [ - 0.9, 1.6, 0.35 ], look: [ 5.0, 1.05, - 1.7 ], fov: 58 },
		entrance: { dir: [ - 0.55, 1.35, - 1 ], pts: entrancePts, fov: 30 },
	};

	// Place the camera along `dir` so every point fits the frame with a margin
	// and the group sits centred on screen, whatever the screen's shape.
	function frameView( dir, pts, fov ) {

		const fwd = dir.clone().normalize();
		const right = new T.Vector3().crossVectors( worldUp, fwd );
		if ( right.lengthSq() < 1e-6 ) right.set( 1, 0, 0 );
		right.normalize();
		const up = new T.Vector3().crossVectors( fwd, right );
		const ty = Math.tan( T.MathUtils.degToRad( fov / 2 ) ) * 0.86;
		const tx = ty * camera.aspect;

		const target = new T.Vector3();
		pts.forEach( ( p ) => target.add( p ) );
		target.divideScalar( pts.length );

		const q = new T.Vector3();
		let d = 0;
		for ( let pass = 0; pass < 5; pass ++ ) {

			d = 0;
			for ( const p of pts ) {

				q.copy( p ).sub( target );
				d = Math.max( d, q.dot( fwd ) + Math.max( Math.abs( q.dot( right ) ) / tx, Math.abs( q.dot( up ) ) / ty ) );

			}

			let x0 = Infinity, x1 = - Infinity, y0 = Infinity, y1 = - Infinity;
			for ( const p of pts ) {

				q.copy( p ).sub( target );
				const depth = d - q.dot( fwd );
				const sx = q.dot( right ) / ( depth * tx ), sy = q.dot( up ) / ( depth * ty );
				x0 = Math.min( x0, sx ); x1 = Math.max( x1, sx );
				y0 = Math.min( y0, sy ); y1 = Math.max( y1, sy );

			}

			target.addScaledVector( right, ( x0 + x1 ) / 2 * d * tx ).addScaledVector( up, ( y0 + y1 ) / 2 * d * ty );

		}

		return { target, eye: fwd.multiplyScalar( d ).add( target ) };

	}

	function pose( name ) {

		const v = VIEWS[ name ];
		if ( v.eye ) return { target: new T.Vector3( ...v.look ), eye: new T.Vector3( ...v.eye ), fov: v.fov };
		return { ...frameView( new T.Vector3( ...v.dir ), v.pts, v.fov ), fov: v.fov };

	}

	const ease = ( t ) => ( t < 0.5 ? 4 * t * t * t : 1 - Math.pow( - 2 * t + 2, 3 ) / 2 );

	let tween = null;
	function flyTo( name, duration = 1300 ) {

		const { target, eye, fov } = pose( name );
		flyToPose( target, eye, duration, fov );

	}

	function setFov( fov ) {

		camera.fov = fov;
		camera.updateProjectionMatrix();

	}

	function flyToPose( target, eye, duration, fov = camera.fov ) {

		if ( reduceMotion || duration === 0 ) {

			tween = null;
			setFov( fov );
			controls.target.copy( target );
			camera.position.copy( eye );
			camera.lookAt( target );
			wake();
			return;

		}

		// travel around the target instead of straight through the walls
		const from = new T.Spherical().setFromVector3( camera.position.clone().sub( controls.target ) );
		const to = new T.Spherical().setFromVector3( eye.clone().sub( target ) );
		const turn = Math.atan2( Math.sin( to.theta - from.theta ), Math.cos( to.theta - from.theta ) );
		tween = { t0: performance.now(), duration, from, to, turn, fromT: controls.target.clone(), toT: target, fromFov: camera.fov, toFov: fov };
		wake();

	}

	const sph = new T.Spherical();
	function stepTween( now ) {

		if ( ! tween ) return false;
		const k = Math.min( 1, ( now - tween.t0 ) / tween.duration );
		const e = ease( k );
		const { from, to } = tween;
		sph.set(
			Math.exp( T.MathUtils.lerp( Math.log( from.radius ), Math.log( to.radius ), e ) ),
			T.MathUtils.lerp( from.phi, to.phi, e ),
			from.theta + tween.turn * e );
		controls.target.lerpVectors( tween.fromT, tween.toT, e );
		setFov( T.MathUtils.lerp( tween.fromFov, tween.toFov, e ) );
		camera.position.setFromSpherical( sph ).add( controls.target );
		camera.lookAt( controls.target );
		if ( k >= 1 ) tween = null;
		return true;

	}

	/* ---------------------------------------------------- animations */

	let cutHeight = HT.wall;
	let rise = null; // walls rising on first load
	let doorAnim = null;

	function stepRise( now ) {

		if ( ! rise ) return false;
		const k = T.MathUtils.clamp( ( now - rise.t0 ) / 1700, 0, 1 );
		applyCut( Math.max( 0.001, cutHeight * ease( k ) ) );
		if ( k >= 1 ) rise = null;
		return true;

	}

	function animateDoors( to ) {

		if ( reduceMotion ) {

			setDoors( to );
			wake();
			return;

		}

		doorAnim = { t0: performance.now(), from: doorsOpen, to };
		wake();

	}

	function stepDoors( now ) {

		if ( ! doorAnim ) return false;
		const k = Math.min( 1, ( now - doorAnim.t0 ) / 900 );
		setDoors( T.MathUtils.lerp( doorAnim.from, doorAnim.to, ease( k ) ) );
		if ( k >= 1 ) doorAnim = null;
		return true;

	}

	/* ------------------------------------------------ post-processing */

	const composer = new T.EffectComposer( renderer, new T.WebGLRenderTarget( 2, 2, { type: T.HalfFloatType, samples: 4 } ) );
	composer.addPass( new T.RenderPass( scene, camera ) );
	const ao = new T.GTAOPass( scene, camera, 2, 2 );
	ao.updateGtaoMaterial( { radius: 0.32, distanceExponent: 1.4, thickness: 1.2, scale: 1.15, samples: 16, distanceFallOff: 1.0, screenSpaceRadius: false } );
	ao.updatePdMaterial( { lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 } );
	ao.blendIntensity = 0.85;
	composer.addPass( ao );
	composer.addPass( new T.OutputPass() );

	/* --------------------------------------------------- background */

	// three.js' Neutral tone mapping, ported, so the backdrop can be solved to
	// land exactly on the page's --viewer-bg colour after tone mapping.
	function neutral( [ r, g, b ] ) {

		const start = 0.76, desat = 0.15;
		const x = Math.min( r, g, b );
		const off = x < 0.08 ? x - 6.25 * x * x : 0.04;
		let c = [ r - off, g - off, b - off ];
		const peak = Math.max( ...c );
		if ( peak < start ) return c;
		const d = 1 - start;
		const newPeak = 1 - d * d / ( peak + d - start );
		c = c.map( ( v ) => v * newPeak / peak );
		const mix = 1 - 1 / ( desat * ( peak - newPeak ) + 1 );
		return c.map( ( v ) => v + ( newPeak - v ) * mix );

	}

	/* ------------------------------------------------------ evening */

	let evening = 0;
	let eveningAnim = null;
	const sunDay = sun.color.clone();
	const sunNight = new T.Color( 0x9db2d6 );
	const NIGHT_BG = new T.Color( '#161c25' );

	function setEvening( t ) {

		evening = t;
		const L = T.MathUtils.lerp;
		sun.intensity = L( 2.9, 0.16, t );
		sun.color.copy( sunDay ).lerp( sunNight, t );
		hemi.intensity = L( 0.5, 0.05, t );
		scene.environmentIntensity = L( 0.42, 0.05, t );
		renderer.toneMappingExposure = L( 1.0, 1.25, t );
		if ( furnish ) furnish.setEvening( t );
		syncBackground();

	}

	function animateEvening( to ) {

		if ( reduceMotion ) {

			setEvening( to );
			return;

		}

		eveningAnim = { t0: performance.now(), from: evening, to };
		wake();

	}

	function stepEvening( now ) {

		if ( ! eveningAnim ) return false;
		const k = Math.min( 1, ( now - eveningAnim.t0 ) / 1400 );
		setEvening( T.MathUtils.lerp( eveningAnim.from, eveningAnim.to, ease( k ) ) );
		if ( k >= 1 ) eveningAnim = null;
		return true;

	}

	function syncBackground() {

		const hex = getComputedStyle( stage ).getPropertyValue( '--viewer-bg' ).trim() || '#e6eaee';
		const want = new T.Color( hex ).lerp( NIGHT_BG, evening );
		const goal = [ want.r, want.g, want.b ];
		let c = goal.slice();
		for ( let i = 0; i < 60; i ++ ) {

			const got = neutral( c );
			c = c.map( ( v, k ) => Math.max( 0, v + goal[ k ] - got[ k ] ) );

		}

		scene.background = new T.Color( c[ 0 ], c[ 1 ], c[ 2 ] );
		wake();

	}

	/* ---------------------------------------------------- render loop */

	let dirty = true;
	let onScreen = true;
	function wake() {

		dirty = true;

	}

	controls.addEventListener( 'change', wake );

	function frame( now ) {

		requestAnimationFrame( frame );
		if ( ! onScreen ) return;
		const moving = stepRise( now ) | stepTween( now ) | stepDoors( now ) | stepEvening( now );
		const changed = controls.update();
		if ( moving || changed || dirty ) {

			dirty = false;
			// the AO pass can't see clipped furniture, so it rests while walls are cut
			ao.enabled = lastCut >= HT.wall - 1e-3;
			composer.render();
			updateOcclusion();
			labelRenderer.render( scene, camera );

		}

	}

	function resize() {

		const w = Math.max( 1, stage.clientWidth );
		const h = Math.max( 1, stage.clientHeight );
		renderer.setSize( w, h, false );
		composer.setSize( w, h );
		labelRenderer.setSize( w, h );
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		wake();

	}

	/* ------------------------------------------------------ controls UI */

	const viewButtons = Array.from( document.querySelectorAll( '[data-view]' ) );
	const pressView = ( name ) => viewButtons.forEach( ( b ) => b.setAttribute( 'aria-pressed', String( b.dataset.view === name ) ) );

	viewButtons.forEach( ( btn ) => btn.addEventListener( 'click', () => {

		pressView( btn.dataset.view );
		flyTo( btn.dataset.view );

	} ) );

	// grabbing the model hands the camera back to the user
	controls.addEventListener( 'start', () => {

		tween = null;
		pressView( null );

	} );

	const ndc = new T.Vector2();
	renderer.domElement.addEventListener( 'dblclick', ( e ) => {

		const r = renderer.domElement.getBoundingClientRect();
		ndc.set( ( ( e.clientX - r.left ) / r.width ) * 2 - 1, - ( ( e.clientY - r.top ) / r.height ) * 2 + 1 );
		ray.setFromCamera( ndc, camera );
		ray.far = Infinity;
		const targets = floors.concat( blockers.filter( ( b ) => b.visible ) );
		if ( furnish && furnish.group.visible ) targets.push( furnish.group );
		const hit = ray.intersectObjects( targets, true )[ 0 ];
		if ( ! hit ) return;
		const offset = camera.position.clone().sub( controls.target ).multiplyScalar( 0.6 );
		if ( offset.length() < controls.minDistance * 1.2 ) offset.setLength( controls.minDistance * 1.2 );
		pressView( null );
		flyToPose( hit.point.clone(), hit.point.clone().add( offset ), 900 );

	} );

	const cutInput = document.getElementById( 'cut' );
	const cutOut = document.getElementById( 'cut-out' );
	const showCut = ( v ) => {

		if ( cutOut ) cutOut.textContent = v.toFixed( 2 ) + ' m';

	};

	if ( cutInput ) {

		cutInput.max = String( HT.wall );
		cutInput.addEventListener( 'input', () => {

			rise = null;
			cutHeight = parseFloat( cutInput.value );
			applyCut( cutHeight );
			showCut( cutHeight );
			wake();

		} );

	}

	function toggle( id, onChange ) {

		const btn = document.getElementById( id );
		if ( ! btn ) return;
		btn.addEventListener( 'click', () => {

			const on = btn.getAttribute( 'aria-pressed' ) !== 'true';
			btn.setAttribute( 'aria-pressed', String( on ) );
			onChange( on );
			wake();

		} );

	}

	toggle( 't-doors', ( on ) => animateDoors( on ? 1 : 0 ) );
	toggle( 't-labels', ( on ) => stage.classList.toggle( 'no-rooms', ! on ) );
	toggle( 't-tags', ( on ) => stage.classList.toggle( 'show-tags', on ) );
	toggle( 't-furn', ( on ) => {

		if ( furnish ) furnish.group.visible = on;

	} );
	toggle( 't-evening', ( on ) => animateEvening( on ? 1 : 0 ) );

	// the buttons' aria-pressed in index.html set the starting state
	const pressed = ( id ) => document.getElementById( id )?.getAttribute( 'aria-pressed' ) === 'true';
	stage.classList.toggle( 'no-rooms', ! pressed( 't-labels' ) );
	stage.classList.toggle( 'show-tags', pressed( 't-tags' ) );

	/* ------------------------------------------------------------ start */

	setDoors( pressed( 't-doors' ) ? 1 : 0 );
	if ( furnish ) furnish.group.visible = pressed( 't-furn' ) || ! document.getElementById( 't-furn' );
	if ( pressed( 't-evening' ) ) setEvening( 1 );
	applyCut( cutHeight );
	showCut( cutHeight );
	resize();
	syncBackground();

	new ResizeObserver( resize ).observe( stage );
	new IntersectionObserver( ( entries ) => {

		onScreen = entries[ 0 ].isIntersecting;
		if ( onScreen ) wake();

	}, { rootMargin: '160px' } ).observe( stage );

	window.matchMedia( '(prefers-color-scheme: dark)' ).addEventListener( 'change', syncBackground );
	new MutationObserver( syncBackground ).observe( document.documentElement, { attributes: true, attributeFilter: [ 'data-theme' ] } );

	// index.html#top (or #bedrooms, #living …) opens straight on that view
	const deepLink = window.location.hash.slice( 1 );
	if ( VIEWS[ deepLink ] ) {

		pressView( deepLink );
		flyTo( deepLink, 0 );

	} else if ( reduceMotion ) {

		flyTo( 'overview', 0 );

	} else {

		// first load: the camera settles in while the walls rise from the slab
		const { target, eye, fov } = pose( 'overview' );
		setFov( fov );
		const s = new T.Spherical().setFromVector3( eye.clone().sub( target ) );
		s.radius *= 1.45;
		s.theta -= 0.55;
		s.phi *= 0.7;
		controls.target.copy( target );
		camera.position.setFromSpherical( s ).add( target );
		camera.lookAt( target );
		applyCut( 0.001 );
		rise = { t0: performance.now() + 250 };
		flyToPose( target, eye, 2400, fov );

	}

	stage.classList.add( 'is-ready' );
	requestAnimationFrame( frame );

} )();
