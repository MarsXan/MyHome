/*
 * Floor 4 apartment — furniture for the 3D model (Japandi, for a couple).
 *
 * Builds every piece listed in HOME_PLAN.furniture from simple parts:
 * rounded boxes, cylinders and turned shapes, with oak, linen, paper and
 * ceramic materials painted on canvases at start-up, so no image files are
 * needed. home3d.js calls HOME_FURNITURE( THREE, env ) and adds the group.
 *
 * Every builder works in a local frame: width along x, depth along z, the
 * front of the piece facing +z, the floor (or the piece's base) at y = 0.
 */
window.HOME_FURNITURE = function ( T, env ) {

	'use strict';

	const { X, Z, m, FLOOR, BALCONY_DROP, canvasTexture, rng, hsl, cutPlane, glass, wallHeight } = env;
	const PLAN = window.HOME_PLAN;

	/* ----------------------------------------------------------- textures */

	// straight oak grain, running along the texture's width
	function oakGrain( g, w, h, tone, seed ) {

		const r = rng( seed );
		g.fillStyle = hsl( tone[ 0 ], tone[ 1 ], tone[ 2 ] );
		g.fillRect( 0, 0, w, h );
		for ( let i = 0; i < 150; i ++ ) {

			const y0 = r() * h, amp = 0.5 + r() * 3, f = 0.4 + r() * 2.2, p = r() * 6.28;
			g.beginPath();
			for ( let x = 0; x <= w + 8; x += 8 ) {

				const y = y0 + Math.sin( p + ( x / w ) * f * 6.283 ) * amp;
				if ( x === 0 ) g.moveTo( x, y );
				else g.lineTo( x, y );

			}

			g.lineWidth = 0.5 + r() * 1.4;
			g.strokeStyle = r() < 0.7
				? hsl( tone[ 0 ] - 4, tone[ 1 ] + 8, tone[ 2 ] - 22, 0.05 + r() * 0.07 )
				: hsl( tone[ 0 ] + 3, tone[ 1 ] - 8, tone[ 2 ] + 14, 0.05 + r() * 0.06 );
			g.stroke();

		}

	}

	const OAK = [ 33, 36, 66 ];

	function noise( g, w, h, n, seed, dark = 'rgba(60,45,30,0.06)', light = 'rgba(255,255,255,0.07)', size = 1.2 ) {

		const r = rng( seed );
		for ( let i = 0; i < n; i ++ ) {

			g.fillStyle = r() < 0.5 ? light : dark;
			g.fillRect( r() * w, r() * h, size, size );

		}

	}

	function tiles( g, S, n, base, grout, seed ) {

		const r = rng( seed );
		const s = S / n;
		g.fillStyle = grout;
		g.fillRect( 0, 0, S, S );
		for ( let i = 0; i < n; i ++ ) for ( let j = 0; j < n; j ++ ) {

			const x = i * s + 1.5, y = j * s + 1.5, w = s - 3;
			g.fillStyle = hsl( base[ 0 ] + ( r() - 0.5 ) * 4, base[ 1 ], base[ 2 ] + ( r() - 0.5 ) * 5 );
			g.fillRect( x, y, w, w );
			// handmade glaze: a soft highlight pooled somewhere on each tile
			const cx = x + r() * w, cy = y + r() * w;
			const rg = g.createRadialGradient( cx, cy, 0, cx, cy, w * 0.8 );
			rg.addColorStop( 0, 'rgba(255,255,255,0.22)' );
			rg.addColorStop( 1, 'rgba(255,255,255,0)' );
			g.fillStyle = rg;
			g.fillRect( x, y, w, w );

		}

	}

	function rugPaint( base, line, seed, coarse ) {

		return ( g, w, h ) => {

			g.fillStyle = base;
			g.fillRect( 0, 0, w, h );
			noise( g, w, h, coarse ? 42000 : 26000, seed, 'rgba(50,38,26,0.08)', 'rgba(255,255,255,0.08)', coarse ? 1.8 : 1.2 );
			if ( line ) {

				g.strokeStyle = line;
				g.lineWidth = 7;
				g.strokeRect( 24, 24, w - 48, h - 48 );
				g.lineWidth = 2;
				g.strokeRect( 40, 40, w - 80, h - 80 );

			}

		};

	}

	const tex = {
		oak: canvasTexture( 512, 512, ( g, w, h ) => oakGrain( g, w, h, OAK, 77 ) ),
		// vertical oak slats, 5 cm wide: one copy covers 0.6 m
		slats: canvasTexture( 512, 512, ( g, w, h ) => {

			g.save();
			g.translate( w, 0 );
			g.rotate( Math.PI / 2 );
			oakGrain( g, h, w, OAK, 91 );
			g.restore();
			for ( let i = 0; i < 12; i ++ ) {

				const x = ( i * w ) / 12;
				g.fillStyle = 'rgba(70,48,28,0.55)';
				g.fillRect( x, 0, 3, h );
				g.fillStyle = 'rgba(255,240,220,0.18)';
				g.fillRect( x + 3, 0, 2, h );

			}

		}, 1 ),
		// rice paper with ribs, for the lanterns
		paper: canvasTexture( 256, 256, ( g, w, h ) => {

			g.fillStyle = '#f4ecdc';
			g.fillRect( 0, 0, w, h );
			noise( g, w, h, 5000, 13, 'rgba(120,100,70,0.05)', 'rgba(255,255,255,0.1)', 1.4 );
			g.fillStyle = 'rgba(150,120,80,0.22)';
			for ( let y = 8; y < h; y += 16 ) g.fillRect( 0, y, w, 1.5 );

		}, 1 ),
		quartz: canvasTexture( 256, 256, ( g, w, h ) => {

			g.fillStyle = '#eeeae3';
			g.fillRect( 0, 0, w, h );
			noise( g, w, h, 2600, 17, 'rgba(110,100,90,0.25)', 'rgba(205,190,165,0.3)', 1.3 );

		}, 1 ),
		zellige: canvasTexture( 512, 512, ( g, S ) => tiles( g, S, 6, [ 40, 26, 89 ], '#d8d1c4', 23 ), 1 ),
		wet: canvasTexture( 512, 512, ( g, S ) => tiles( g, S, 6, [ 88, 7, 81 ], '#b9bdb2', 29 ), 1 ),
		rugOat: canvasTexture( 512, 512, rugPaint( '#dacfbc', 'rgba(120,98,72,0.35)', 31 ) ),
		rugSand: canvasTexture( 512, 512, rugPaint( '#cfc1a8', 'rgba(250,245,235,0.55)', 37 ) ),
		rugMat: canvasTexture( 256, 256, rugPaint( '#8f8474', 'rgba(40,32,24,0.4)', 41, true ) ),
		artArc: canvasTexture( 512, 352, ( g, w, h ) => {

			g.fillStyle = '#efe7da';
			g.fillRect( 0, 0, w, h );
			noise( g, w, h, 9000, 43, 'rgba(120,100,70,0.05)', 'rgba(255,255,255,0.08)' );
			g.fillStyle = '#d8c7a8';
			g.fillRect( 262, 92, 150, 150 );
			g.fillStyle = '#b8694e';
			g.beginPath();
			g.arc( 200, 262, 118, Math.PI, 0 );
			g.closePath();
			g.fill();
			g.fillStyle = '#8c9179';
			g.beginPath();
			g.arc( 392, 84, 20, 0, Math.PI * 2 );
			g.fill();
			g.strokeStyle = '#2e2d2b';
			g.lineWidth = 3;
			g.beginPath();
			g.moveTo( 64, 290 );
			g.lineTo( 448, 290 );
			g.stroke();

		} ),
		artLines: canvasTexture( 512, 300, ( g, w, h ) => {

			g.fillStyle = '#f0e9dd';
			g.fillRect( 0, 0, w, h );
			noise( g, w, h, 8000, 47, 'rgba(120,100,70,0.05)', 'rgba(255,255,255,0.08)' );
			g.fillStyle = 'rgba(205,187,158,0.55)';
			g.fillRect( 300, 60, 130, 180 );
			g.strokeStyle = '#2f2e2b';
			g.lineCap = 'round';
			[ [ 70, 210, 180, 90, 9 ], [ 150, 230, 260, 110, 6 ], [ 230, 240, 330, 150, 3.5 ] ].forEach( ( [ x0, y0, x1, y1, lw ] ) => {

				g.lineWidth = lw;
				g.beginPath();
				g.moveTo( x0, y0 );
				g.quadraticCurveTo( ( x0 + x1 ) / 2 + 40, ( y0 + y1 ) / 2 + 30, x1, y1 );
				g.stroke();

			} );

		} ),
	};

	// copy of a tiling texture that repeats at its real size on a w × h face
	function sized( t, rx, ry ) {

		const c = t.clone();
		c.wrapS = c.wrapT = T.RepeatWrapping;
		c.repeat.set( rx, ry );
		c.needsUpdate = true;
		return c;

	}

	/* ---------------------------------------------------------- materials */

	// Everything here is cut by the wall-height slider like the walls are.
	// Solid pieces are single-sided; the thin open shapes (lampshades, paper,
	// curtains) are double-sided so they read from both sides.
	const clip = { clippingPlanes: [ cutPlane ], clipShadows: true };
	const twoSided = { side: T.DoubleSide, shadowSide: T.DoubleSide };
	const std = ( o ) => new T.MeshStandardMaterial( Object.assign( {}, clip, o ) );
	const phys = ( o ) => new T.MeshPhysicalMaterial( Object.assign( {}, clip, o ) );
	const cloth = ( color, sheen = 0xfff6ea ) => phys( { color, roughness: 0.96, sheen: 1, sheenRoughness: 0.55, sheenColor: sheen } );

	const mat = {
		oak: std( { map: tex.oak, roughness: 0.55 } ),
		oakLine: std( { color: 0x8a6a48, roughness: 0.7 } ),
		shell: std( { color: 0xe4ddd1, roughness: 0.72 } ), // "Skimming Stone" joinery
		shellLine: std( { color: 0xc9c0b1, roughness: 0.8 } ),
		black: std( { color: 0x1d1d1b, roughness: 0.42, metalness: 0.55 } ),
		plinth: std( { color: 0x2a2826, roughness: 0.85 } ),
		ceramic: phys( { color: 0xf5f3ef, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08 } ),
		sandCeramic: std( { color: 0xcdbfa9, roughness: 0.62 } ),
		clay: std( { color: 0x9c8f7d, roughness: 0.75 } ),
		quartz: std( { map: tex.quartz, roughness: 0.3 } ),
		sink: std( { color: 0x9c968c, roughness: 0.5 } ), // stone-look composite
		blackGlass: std( { color: 0x0e0f10, roughness: 0.08, metalness: 0.3 } ),
		screen: std( { color: 0x0b0c0e, roughness: 0.12, metalness: 0.25 } ),
		mirror: std( { color: 0xdfe7ea, roughness: 0.03, metalness: 1 } ),
		chrome: std( { color: 0xc9ccce, roughness: 0.25, metalness: 1 } ),
		steel: std( { color: 0xc9ccce, roughness: 0.4, metalness: 0.55 } ), // satin stainless
		steelDark: std( { color: 0x5a5d60, roughness: 0.4, metalness: 0.7 } ),
		enamel: std( { color: 0xf2f1ee, roughness: 0.35 } ),
		amber: std( { color: 0x9a5a22, roughness: 0.2, metalness: 0.1 } ),
		stonePot: std( { color: 0xc8c1b5, roughness: 0.95 } ),
		terracotta: std( { color: 0xb2694b, roughness: 0.9 } ),
		soil: std( { color: 0x3b2d22, roughness: 1 } ),
		trunk: std( { color: 0x6d5b48, roughness: 0.9 } ),
		leafOlive: std( { color: 0x7d8b62, roughness: 0.85, flatShading: true } ),
		leafHerb: std( { color: 0x5f7f4b, roughness: 0.85, flatShading: true } ),
		leafGeranium: std( { color: 0x4d7638, roughness: 0.8, flatShading: true } ),
		flower: std( { color: 0xcf5446, roughness: 0.7 } ),
		lavender: std( { color: 0x8a7bb5, roughness: 0.8 } ),
		lemon: std( { color: 0xe7c64a, roughness: 0.5 } ),
		books: std( { vertexColors: true, roughness: 0.8 } ),
		mount: std( { color: 0xf7f4ee, roughness: 0.9 } ),
		oat: cloth( 0xd8ccb9 ),
		cream: cloth( 0xede6da ),
		sage: cloth( 0x8c9179, 0xe6ecd6 ),
		terraCloth: cloth( 0xb46a4f, 0xffd9c8 ),
		charcoal: cloth( 0x3b3b39, 0x9a9a96 ),
		linenWhite: cloth( 0xf2eee7 ),
		sand: cloth( 0xcdbb9e ),
		curtain: phys( { color: 0xf1ebe1, roughness: 0.96, sheen: 1, sheenRoughness: 0.55, sheenColor: 0xfff6ea, ...twoSided } ),
		rugOat: std( { map: tex.rugOat, roughness: 1 } ),
		rugSand: std( { map: tex.rugSand, roughness: 1 } ),
		rugMat: std( { map: tex.rugMat, roughness: 1 } ),
		artArc: std( { map: tex.artArc, roughness: 0.85 } ),
		artLines: std( { map: tex.artLines, roughness: 0.85 } ),
		glassClip: glass.clone(),
		// light sources: they glow when the evening light is on
		paper: std( { map: tex.paper, roughness: 0.95, emissive: 0xffc58a, emissiveMap: tex.paper, emissiveIntensity: 0, ...twoSided } ),
		shade: std( { color: 0xefe6d6, roughness: 0.95, emissive: 0xffc58a, emissiveIntensity: 0, ...twoSided } ),
		ledWarm: std( { color: 0xfff3e0, roughness: 0.5, emissive: 0xffc27a, emissiveIntensity: 0 } ),
		ledCool: std( { color: 0xfffaf2, roughness: 0.5, emissive: 0xffecd2, emissiveIntensity: 0 } ),
	};
	mat.glassClip.clippingPlanes = [ cutPlane ];
	mat.glassClip.clipShadows = true;
	const GLOWS = [ [ mat.paper, 1.7 ], [ mat.shade, 1.2 ], [ mat.ledWarm, 2.4 ], [ mat.ledCool, 2.2 ] ];

	const BOOK_COLORS = [ 0xe6ddcb, 0xc9b79c, 0x8e927a, 0xb7684e, 0x3a3a38, 0xd4c6b0, 0xa89a84, 0xefe9dd, 0x6f7361 ].map( ( c ) => new T.Color( c ) );
	const bookMats = [ 0xc9b79c, 0x8e927a, 0xe6ddcb ].map( ( c ) => std( { color: c, roughness: 0.8 } ) );

	/* ------------------------------------------------------------- shapes */

	const cache = new Map();
	const once = ( key, make ) => {

		let g = cache.get( key );
		if ( ! g ) {

			g = make();
			cache.set( key, g );

		}

		return g;

	};

	const k = ( ...v ) => v.map( ( n ) => ( typeof n === 'number' ? n.toFixed( 3 ) : n ) ).join( ',' );

	function RB( w, h, d, r, material ) {

		const rr = Math.max( 0.0008, Math.min( r, w / 2 - 0.0008, h / 2 - 0.0008, d / 2 - 0.0008 ) );
		return new T.Mesh( once( 'rb' + k( w, h, d, rr ), () => new T.RoundedBoxGeometry( w, h, d, 2, rr ) ), material );

	}

	const BX = ( w, h, d, material ) => new T.Mesh( once( 'bx' + k( w, h, d ), () => new T.BoxGeometry( w, h, d ) ), material );
	const CY = ( rt, rb, h, material, seg = 24, open = false ) =>
		new T.Mesh( once( 'cy' + k( rt, rb, h, seg, open ), () => new T.CylinderGeometry( rt, rb, h, seg, 1, open ) ), material );
	const SP = ( r, material, seg = 16 ) => new T.Mesh( once( 'sp' + k( r, seg ), () => new T.SphereGeometry( r, seg, Math.round( seg * 0.7 ) ) ), material );
	const ICO = ( r, material ) => new T.Mesh( once( 'ico' + k( r ), () => new T.IcosahedronGeometry( r, 1 ) ), material );
	const TOR = ( r, t, material ) => new T.Mesh( once( 'tor' + k( r, t ), () => new T.TorusGeometry( r, t, 10, 48 ) ), material );

	// turned shape from a list of [ radius, height ] points
	const LATHE = ( key, pts, material, seg = 32 ) =>
		new T.Mesh( once( 'la' + key, () => new T.LatheGeometry( pts.map( ( [ r, y ] ) => new T.Vector2( r, y ) ), seg ) ), material );

	function add( parent, mesh, x = 0, y = 0, z = 0 ) {

		mesh.position.set( x, y, z );
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		parent.add( mesh );
		return mesh;

	}

	const vase = ( h, material ) => LATHE( 'vase' + k( h ), [ [ 0, 0 ], [ h * 0.22, 0 ], [ h * 0.3, h * 0.25 ], [ h * 0.28, h * 0.6 ], [ h * 0.14, h * 0.88 ], [ h * 0.12, h ], [ h * 0.1, h ] ], material );
	const bowlShape = ( r, material ) => LATHE( 'bowl' + k( r ), [ [ 0, 0 ], [ r * 0.45, 0 ], [ r * 0.85, r * 0.3 ], [ r, r * 0.55 ], [ r * 0.94, r * 0.56 ], [ r * 0.8, r * 0.33 ], [ r * 0.4, r * 0.08 ], [ 0, r * 0.08 ] ], material );

	function legs( g, W, D, h, inset, r = 0.012 ) {

		for ( const sx of [ - 1, 1 ] ) for ( const sz of [ - 1, 1 ] ) add( g, CY( r, r * 0.8, h, mat.black, 10 ), sx * ( W / 2 - inset ), h / 2, sz * ( D / 2 - inset ) );

	}

	function slatFront( g, W, h, y, z ) {

		const panel = add( g, BX( W, h, 0.004, std( { map: sized( tex.slats, W / 0.6, 1 ), roughness: 0.55 } ) ), 0, y, z );
		panel.castShadow = false;
		return panel;

	}

	// many boxes in one mesh, coloured per box (used for the books)
	function mergedBoxes( boxes, material ) {

		const pos = [], nor = [], col = [];
		for ( const b of boxes ) {

			const geo = new T.BoxGeometry( b.w, b.h, b.d ).toNonIndexed();
			geo.translate( b.x, b.y, b.z );
			pos.push( ...geo.attributes.position.array );
			nor.push( ...geo.attributes.normal.array );
			for ( let i = 0; i < geo.attributes.position.count; i ++ ) col.push( b.c.r, b.c.g, b.c.b );
			geo.dispose();

		}

		const out = new T.BufferGeometry();
		out.setAttribute( 'position', new T.Float32BufferAttribute( pos, 3 ) );
		out.setAttribute( 'normal', new T.Float32BufferAttribute( nor, 3 ) );
		out.setAttribute( 'color', new T.Float32BufferAttribute( col, 3 ) );
		return new T.Mesh( out, material );

	}

	// stadium (rounded-end) slab, laid flat: the oval coffee table top
	function stadium( w, d, t ) {

		return once( 'st' + k( w, d, t ), () => {

			const r = Math.min( w, d ) / 2, x = w / 2, y = d / 2;
			const s = new T.Shape();
			s.moveTo( - x + r, - y );
			s.lineTo( x - r, - y );
			s.absarc( x - r, - y + r, r, - Math.PI / 2, 0 );
			s.lineTo( x, y - r );
			s.absarc( x - r, y - r, r, 0, Math.PI / 2 );
			s.lineTo( - x + r, y );
			s.absarc( - x + r, y - r, r, Math.PI / 2, Math.PI );
			s.lineTo( - x, - y + r );
			s.absarc( - x + r, - y + r, r, Math.PI, Math.PI * 1.5 );
			const geo = new T.ExtrudeGeometry( s, { depth: t, bevelEnabled: false, curveSegments: 18 } );
			geo.rotateX( - Math.PI / 2 );
			return geo;

		} );

	}

	// a gathered curtain panel: a plane with soft vertical folds
	function drape( w, h ) {

		return once( 'drape' + k( w, h ), () => {

			const folds = Math.max( 3, Math.round( w / 0.09 ) );
			const geo = new T.PlaneGeometry( w, h, folds * 6, 1 );
			const p = geo.attributes.position;
			for ( let i = 0; i < p.count; i ++ ) p.setZ( i, Math.sin( ( p.getX( i ) / w + 0.5 ) * folds * Math.PI * 2 ) * 0.025 );
			geo.computeVertexNormals();
			return geo;

		} );

	}

	/* -------------------------------------------------------------- lights */

	const lights = [];
	function lamp( parent, x, y, z, kind, power ) {

		const light = new T.PointLight( kind === 'cool' ? 0xffe3c8 : 0xffb46b, 0, 7, 2 );
		light.visible = false; // switched on with the evening light
		light.position.set( x, y, z );
		parent.add( light );
		lights.push( { light, power } );

	}

	function bulb( g, x, y, z, material = mat.ledWarm ) {

		const b = add( g, SP( 0.022, material, 12 ), x, y, z );
		b.castShadow = false;
		return b;

	}

	/* ------------------------------------------------------------ builders */

	const B = {};

	B.rug = ( W, D, o ) => {

		const g = new T.Group();
		const r = add( g, BX( W, 0.01, D, o.tone === 'mat' ? mat.rugMat : o.tone === 'sand' ? mat.rugSand : mat.rugOat ), 0, 0.005, 0 );
		r.castShadow = false;
		return g;

	};

	B.tvUnit = ( W, D, o ) => {

		const g = new T.Group(), h = o.h, leg = 0.09, body = h - leg;
		add( g, RB( W, body, D, 0.01, mat.oak ), 0, leg + body / 2, 0 );
		slatFront( g, W - 0.04, body - 0.05, leg + body / 2, D / 2 + 0.001 );
		legs( g, W, D, leg, 0.05 );
		add( g, BX( 0.22, 0.025, 0.16, bookMats[ 0 ] ), W / 2 - 0.26, h + 0.0125, 0 );
		add( g, BX( 0.2, 0.02, 0.15, bookMats[ 2 ] ), W / 2 - 0.26, h + 0.035, 0.005 ).rotation.y = 0.12;
		add( g, vase( 0.18, mat.sandCeramic ), - W / 2 + 0.2, h, - 0.02 );
		return g;

	};

	B.tv = ( W, D, o ) => {

		const g = new T.Group(), h = o.h;
		add( g, RB( W, h, 0.028, 0.004, mat.screen ), 0, h / 2, 0 );
		// warm backlight that washes the wall in the evening
		add( g, BX( W - 0.12, h - 0.12, 0.002, mat.ledWarm ), 0, h / 2, - 0.016 ).castShadow = false;
		return g;

	};

	// Straight sofa with an arm at each end and `seats` cushions. The 3-seat
	// sofas of the set pull out into beds; the plan shows how far.
	B.sofa = ( W, D, o ) => {

		const g = new T.Group();
		const fab = mat[ o.fabric ] || mat.oat;
		const n = o.seats || 3, back = - D / 2, arm = 0.16;
		add( g, BX( W - 0.08, 0.1, D - 0.08, mat.plinth ), 0, 0.05, 0 );
		add( g, RB( W, 0.2, D, 0.035, fab ), 0, 0.2, 0 );
		add( g, RB( W, 0.46, 0.2, 0.05, fab ), 0, 0.53, back + 0.1 );
		for ( const sx of [ - 1, 1 ] ) add( g, RB( arm, 0.36, D, 0.05, fab ), sx * ( W / 2 - arm / 2 ), 0.43, 0 );
		const inner = W - 2 * arm, cw = inner / n;
		for ( let i = 0; i < n; i ++ ) {

			const x = - inner / 2 + ( i + 0.5 ) * cw;
			add( g, RB( cw - 0.01, 0.13, D - 0.2, 0.05, fab ), x, 0.365, back + 0.2 + ( D - 0.2 ) / 2 );
			add( g, RB( cw - 0.02, 0.4, 0.17, 0.07, fab ), x, 0.61, back + 0.285 ).rotation.x = - 0.12;

		}

		add( g, RB( 0.42, 0.4, 0.13, 0.06, mat.sage ), - inner / 2 + 0.28, 0.66, back + 0.42 ).rotation.set( - 0.25, 0.2, 0.05 );
		add( g, RB( 0.42, 0.4, 0.13, 0.06, mat.terraCloth ), inner / 2 - 0.28, 0.66, back + 0.42 ).rotation.set( - 0.25, - 0.2, - 0.05 );
		return g;

	};

	// Armchair from the same set.
	B.armchair = ( W, D, o ) => {

		const g = new T.Group();
		const fab = mat[ o.fabric ] || mat.oat;
		const back = - D / 2, arm = 0.14;
		add( g, BX( W - 0.08, 0.1, D - 0.08, mat.plinth ), 0, 0.05, 0 );
		add( g, RB( W, 0.2, D, 0.035, fab ), 0, 0.2, 0 );
		add( g, RB( W, 0.46, 0.18, 0.05, fab ), 0, 0.53, back + 0.09 );
		for ( const sx of [ - 1, 1 ] ) add( g, RB( arm, 0.34, D, 0.05, fab ), sx * ( W / 2 - arm / 2 ), 0.42, 0 );
		add( g, RB( W - 2 * arm - 0.01, 0.13, D - 0.18, 0.05, fab ), 0, 0.365, back + 0.18 + ( D - 0.18 ) / 2 );
		add( g, RB( W - 2 * arm - 0.02, 0.38, 0.16, 0.07, fab ), 0, 0.6, back + 0.26 ).rotation.x = - 0.12;
		return g;

	};

	B.sideTable = ( W, D, o ) => {

		const g = new T.Group(), h = o.h, r = Math.min( W, D ) / 2;
		add( g, CY( r, r, 0.03, mat.oak, 36 ), 0, h - 0.015, 0 );
		add( g, CY( 0.03, 0.03, h - 0.03, mat.oak, 16 ), 0, ( h - 0.03 ) / 2, 0 );
		add( g, CY( r * 0.7, r * 0.75, 0.02, mat.oak, 32 ), 0, 0.01, 0 );
		return g;

	};

	B.coffeeTable = ( W, D, o ) => {

		const g = new T.Group(), h = o.h, r = Math.min( W, D ) / 2;
		if ( o.shape === 'oval' ) {

			// stadium-shaped oak top on two slab legs
			add( g, new T.Mesh( stadium( W, D, 0.04 ), mat.oak ), 0, h - 0.04, 0 );
			const long = D > W;
			for ( const s of [ - 1, 1 ] ) {

				const leg = long ? BX( W * 0.55, h - 0.04, 0.04, mat.oak ) : BX( 0.04, h - 0.04, D * 0.55, mat.oak );
				add( g, leg, long ? 0 : s * ( W / 2 - 0.18 ), ( h - 0.04 ) / 2, long ? s * ( D / 2 - 0.2 ) : 0 );

			}

			add( g, BX( 0.24, 0.03, 0.17, bookMats[ 1 ] ), 0, h + 0.015, - ( long ? D : W ) * 0.18 ).rotation.y = long ? Math.PI / 2 + 0.2 : 0.2;
			add( g, bowlShape( 0.09, mat.sandCeramic ), 0, h, ( long ? D : W ) * 0.22 );
			return g;

		}

		add( g, CY( r, r, 0.04, mat.oak, 48 ), 0, h - 0.02, 0 );
		add( g, CY( r * 0.55, r * 0.6, h - 0.04, mat.oak, 40 ), 0, ( h - 0.04 ) / 2, 0 );
		add( g, BX( 0.24, 0.03, 0.17, bookMats[ 1 ] ), r * 0.28, h + 0.015, - r * 0.2 ).rotation.y = 0.3;
		add( g, BX( 0.2, 0.025, 0.15, bookMats[ 2 ] ), r * 0.28, h + 0.0425, - r * 0.2 ).rotation.y = 0.12;
		add( g, bowlShape( 0.1, mat.sandCeramic ), - r * 0.35, h, r * 0.18 );
		return g;

	};

	B.sideboard = ( W, D, o ) => {

		const g = new T.Group(), h = o.h, leg = 0.12, body = h - leg;
		add( g, RB( W, body, D, 0.01, mat.oak ), 0, leg + body / 2, 0 );
		slatFront( g, W - 0.04, body - 0.05, leg + body / 2, D / 2 + 0.001 );
		legs( g, W, D, leg, 0.04 );
		// a stoneware vase with a dried branch, and two books
		add( g, vase( 0.24, mat.clay ), W / 2 - 0.2, h, 0 );
		for ( let i = 0; i < 3; i ++ ) {

			const b = add( g, CY( 0.003, 0.005, 0.5, mat.trunk, 5 ), W / 2 - 0.2 + ( i - 1 ) * 0.02, h + 0.42, 0 );
			b.rotation.z = ( i - 1 ) * 0.25;

		}

		add( g, BX( 0.24, 0.03, 0.17, bookMats[ 0 ] ), 0, h + 0.015, 0 );
		return g;

	};

	B.tableLamp = ( W, D, o ) => {

		const g = new T.Group();
		add( g, LATHE( 'lampbase', [ [ 0, 0 ], [ 0.055, 0 ], [ 0.075, 0.05 ], [ 0.078, 0.11 ], [ 0.06, 0.17 ], [ 0.02, 0.2 ], [ 0.01, 0.2 ], [ 0.01, 0.26 ] ], mat.sandCeramic ), 0, 0, 0 );
		add( g, CY( 0.1, 0.125, 0.17, mat.shade, 32, true ), 0, 0.3, 0 ).castShadow = false;
		bulb( g, 0, 0.28, 0 );
		if ( ! o.dark ) lamp( g, 0, 0.28, 0, 'warm', o.power || 1.3 );
		return g;

	};

	B.deskLamp = () => {

		const g = new T.Group();
		add( g, CY( 0.07, 0.075, 0.015, mat.black, 24 ), 0, 0.0075, 0 );
		add( g, CY( 0.008, 0.008, 0.42, mat.black, 8 ), 0.04, 0.22, 0 ).rotation.z = - 0.2;
		add( g, CY( 0.008, 0.008, 0.3, mat.black, 8 ), 0.17, 0.46, 0 ).rotation.z = - 1.2;
		add( g, CY( 0.03, 0.07, 0.11, mat.black, 20, true ), 0.3, 0.42, 0 ).rotation.z = 0.55;
		bulb( g, 0.29, 0.39, 0, mat.ledCool );
		lamp( g, 0.28, 0.36, 0, 'cool', 0.9 );
		return g;

	};

	B.pendant = ( W, D, o ) => {

		const g = new T.Group();
		let shadeTop;
		if ( o.kind === 'globe' ) {

			// paper lantern, Akari style
			const r = W / 2;
			const s = add( g, SP( r, mat.paper, 36 ), 0, r * 0.9, 0 );
			s.scale.y = 0.9;
			s.castShadow = false;
			bulb( g, 0, r * 0.9, 0 );
			lamp( g, 0, r * 0.9, 0, 'warm', 3.2 );
			shadeTop = r * 1.8;

		} else {

			add( g, CY( 0.06, W / 2, 0.24, mat.paper, 40, true ), 0, 0.12, 0 ).castShadow = false;
			bulb( g, 0, 0.07, 0 );
			lamp( g, 0, 0.05, 0, 'warm', 2.4 );
			shadeTop = 0.24;

		}

		const cord = o.ceiling - shadeTop;
		if ( cord > 0.02 ) add( g, CY( 0.003, 0.003, cord, mat.black, 6 ), 0, shadeTop + cord / 2, 0 ).castShadow = false;
		return g;

	};

	B.art = ( W, D, o ) => {

		const g = new T.Group(), h = o.h;
		add( g, RB( W, h, 0.03, 0.004, mat.oak ), 0, h / 2, 0 );
		add( g, BX( W - 0.04, h - 0.04, 0.004, mat.mount ), 0, h / 2, 0.015 );
		add( g, BX( W - 0.18, h - 0.18, 0.002, o.motif === 'lines' ? mat.artLines : mat.artArc ), 0, h / 2, 0.0175 );
		return g;

	};

	B.plant = ( W, D, o, r ) => {

		const g = new T.Group();
		if ( o.kind === 'olive' ) {

			const pr = Math.min( W, D ) / 2;
			add( g, CY( pr, pr * 0.82, 0.42, mat.stonePot, 28 ), 0, 0.21, 0 );
			add( g, CY( pr * 0.92, pr * 0.92, 0.02, mat.soil, 24 ), 0, 0.41, 0 );
			for ( let i = 0; i < 3; i ++ ) {

				const s = add( g, CY( 0.012, 0.018, 0.9, mat.trunk, 8 ), ( r() - 0.5 ) * 0.06, 0.87, ( r() - 0.5 ) * 0.06 );
				s.rotation.set( ( r() - 0.5 ) * 0.3, 0, ( r() - 0.5 ) * 0.3 );

			}

			for ( let i = 0; i < 18; i ++ ) {

				const a = r() * 6.283, d = r() * 0.3;
				const leaf = add( g, ICO( 0.07 + r() * 0.08, mat.leafOlive ), Math.cos( a ) * d, 1.12 + r() * 0.55, Math.sin( a ) * d );
				leaf.scale.set( 1, 0.7 + r() * 0.3, 1 );
				leaf.rotation.set( r() * 3, r() * 3, r() * 3 );

			}

		} else {

			// a small herb pot
			add( g, CY( 0.055, 0.045, 0.1, mat.terracotta, 18 ), 0, 0.05, 0 );
			for ( let i = 0; i < 6; i ++ ) add( g, ICO( 0.03 + r() * 0.02, mat.leafHerb ), ( r() - 0.5 ) * 0.07, 0.13 + r() * 0.07, ( r() - 0.5 ) * 0.07 );

		}

		return g;

	};

	B.diningTable = ( W, D, o ) => {

		const g = new T.Group(), h = o.h;
		add( g, RB( W, 0.035, D, 0.008, mat.oak ), 0, h - 0.0175, 0 );
		for ( const sx of [ - 1, 1 ] ) for ( const sz of [ - 1, 1 ] ) add( g, RB( 0.05, h - 0.035, 0.05, 0.006, mat.oak ), sx * ( W / 2 - 0.09 ), ( h - 0.035 ) / 2, sz * ( D / 2 - 0.09 ) );
		return g;

	};

	B.chair = ( W, D ) => {

		const g = new T.Group(), seat = 0.45;
		add( g, RB( W - 0.02, 0.035, D - 0.03, 0.008, mat.oak ), 0, seat - 0.0175, 0.01 );
		add( g, RB( W - 0.07, 0.025, D - 0.08, 0.01, mat.sand ), 0, seat + 0.012, 0.015 );
		for ( const sx of [ - 1, 1 ] ) {

			add( g, CY( 0.014, 0.013, seat - 0.035, mat.oak, 10 ), sx * ( W / 2 - 0.04 ), ( seat - 0.035 ) / 2, D / 2 - 0.05 );
			add( g, CY( 0.014, 0.013, 0.8, mat.oak, 10 ), sx * ( W / 2 - 0.04 ), 0.4, - D / 2 + 0.035 );

		}

		add( g, RB( W - 0.05, 0.07, 0.022, 0.01, mat.oak ), 0, 0.74, - D / 2 + 0.035 );
		return g;

	};

	B.bowl = ( W ) => {

		const g = new T.Group(), r = W / 2;
		add( g, bowlShape( r, mat.sandCeramic ), 0, 0, 0 );
		[ [ - 0.03, 0.02 ], [ 0.035, 0.01 ], [ 0, - 0.035 ] ].forEach( ( [ x, z ] ) => add( g, SP( 0.034, mat.lemon, 14 ), x, r * 0.42, z ).scale.set( 1, 0.85, 0.85 ) );
		return g;

	};

	// Base units. `fronts` lists what faces the room along the run: drawers,
	// doors, the sink cupboard, a plain corner filler, or an appliance.
	B.counter = ( W, D, o ) => {

		const g = new T.Group();
		const H = 0.9, kick = 0.1, top = 0.04, body = H - kick - top;
		const fz = D / 2 - 0.02, fy = kick + body / 2;
		add( g, BX( W, kick, D - 0.07, mat.plinth ), 0, kick / 2, - 0.035 );
		add( g, BX( W, body, D - 0.04, mat.shellLine ), 0, fy, - 0.02 );

		const fronts = ( o.fronts || [ [ null, null, 'door' ] ] ).map( ( [ a, b, kind ] ) => {

			if ( a === null ) return [ - W / 2, W / 2, kind ];
			const p = o.u( a ), q = o.u( b );
			return [ Math.min( p, q ), Math.max( p, q ), kind ];

		} );

		const pull = ( x, y, w ) => add( g, BX( Math.min( 0.16, w - 0.1 ), 0.012, 0.018, mat.black ), x, y, fz + 0.019 );
		for ( const [ x0, x1, kind ] of fronts ) {

			const w = x1 - x0 - 0.004, cx = ( x0 + x1 ) / 2;
			const panel = ( material ) => add( g, BX( w, body - 0.01, 0.02, material ), cx, fy, fz );
			if ( kind === 'dishwasher' ) {

				panel( mat.steel );
				add( g, BX( w - 0.02, 0.07, 0.004, mat.plinth ), cx, kick + body - 0.05, fz + 0.012 );
				add( g, CY( 0.008, 0.008, w - 0.12, mat.steel, 10 ), cx, kick + body - 0.13, fz + 0.03 ).rotation.z = Math.PI / 2;

			} else if ( kind === 'washer' ) {

				panel( mat.enamel );
				add( g, BX( w - 0.02, 0.07, 0.004, mat.plinth ), cx, kick + body - 0.05, fz + 0.012 );
				add( g, CY( 0.16, 0.16, 0.02, mat.blackGlass, 40 ), cx, kick + 0.33, fz + 0.012 ).rotation.x = Math.PI / 2;
				add( g, TOR( 0.165, 0.012, mat.chrome ), cx, kick + 0.33, fz + 0.022 );

			} else {

				panel( mat.oak );
				if ( kind === 'drawers' ) {

					for ( const f of [ 0.36, 0.68 ] ) add( g, BX( w, 0.004, 0.004, mat.oakLine ), cx, kick + body * f, fz + 0.011 );
					for ( const f of [ 0.2, 0.52, 0.84 ] ) pull( cx, kick + body * f + 0.02, w );

				} else if ( kind === 'sink' ) {

					add( g, BX( 0.004, body - 0.02, 0.004, mat.oakLine ), cx, fy, fz + 0.011 );
					for ( const sx of [ - 1, 1 ] ) add( g, BX( 0.012, 0.16, 0.018, mat.black ), cx + sx * 0.04, kick + body - 0.12, fz + 0.019 );

				} else if ( kind === 'door' ) {

					pull( cx, kick + body - 0.06, w );

				}

			}

		}

		add( g, RB( W, top, D + 0.02, 0.004, mat.quartz ), 0, H - top / 2, 0.01 );
		if ( o.cooktop !== undefined ) {

			const x = o.u( o.cooktop );
			add( g, BX( 0.58, 0.006, 0.5, mat.blackGlass ), x, 0.903, 0 ).castShadow = false;
			for ( const [ dx, dz ] of [ [ - 0.13, - 0.11 ], [ 0.13, - 0.11 ], [ - 0.13, 0.11 ], [ 0.13, 0.11 ] ] ) add( g, TOR( 0.07, 0.003, mat.clay ), x + dx, 0.907, dz ).rotation.x = Math.PI / 2;

		}

		if ( o.sink !== undefined ) {

			const x = o.u( o.sink );
			add( g, BX( 0.5, 0.004, 0.4, mat.sink ), x, 0.9025, 0.02 ).castShadow = false;
			add( g, CY( 0.013, 0.015, 0.3, mat.black, 12 ), x, 1.05, - D / 2 + 0.08 );
			add( g, CY( 0.01, 0.01, 0.2, mat.black, 10 ), x, 1.19, - D / 2 + 0.17 ).rotation.x = Math.PI / 2;

		}

		return g;

	};

	B.fridge = ( W, D, o ) => {

		const g = new T.Group(), h = o.h;
		const t = o.frame ? 0.02 : 0;
		const fw = W - 2 * t, fd = D - ( o.frame ? 0.02 : 0 ), z0 = o.frame ? - 0.01 : 0;
		const front = z0 + fd / 2;
		if ( o.frame ) {

			// frame cover: oak side panels and a bridge cabinet over the fridge,
			// flush with the top of the wall cabinets
			const top = 2.15, bh = top - h - 0.02;
			for ( const sx of [ - 1, 1 ] ) add( g, BX( t, top, D, mat.oak ), sx * ( W / 2 - t / 2 ), top / 2, 0 );
			add( g, BX( fw, bh, D, mat.oak ), 0, h + 0.02 + bh / 2, 0 );
			add( g, BX( 0.16, 0.012, 0.018, mat.black ), 0, h + 0.07, D / 2 + 0.009 );

		}

		if ( o.kind === 'sideBySide' ) {

			// satin steel, freezer on the left with the ice and water panel
			add( g, RB( fw, h, fd - 0.03, 0.012, mat.steel ), 0, h / 2, z0 - 0.015 );
			const split = - fw / 2 + fw * 0.42;
			add( g, BX( 0.006, h - 0.04, 0.03, mat.plinth ), split, h / 2, front - 0.02 );
			for ( const [ x0, x1 ] of [ [ - fw / 2 + 0.004, split - 0.004 ], [ split + 0.004, fw / 2 - 0.004 ] ] ) add( g, RB( x1 - x0, h - 0.02, 0.03, 0.006, mat.steel ), ( x0 + x1 ) / 2, h / 2, front - 0.015 );
			for ( const sx of [ - 1, 1 ] ) add( g, RB( 0.022, 0.9, 0.035, 0.008, mat.steelDark ), split + sx * 0.035, 1.0, front + 0.02 );
			add( g, RB( 0.2, 0.3, 0.012, 0.01, mat.blackGlass ), ( - fw / 2 + split ) / 2, 1.15, front + 0.002 );
			return g;

		}

		add( g, RB( fw, h, fd, 0.015, mat.shell ), 0, h / 2, z0 );
		add( g, BX( fw - 0.01, 0.004, 0.004, mat.shellLine ), 0, 0.72, front + 0.001 );
		add( g, RB( 0.02, 0.5, 0.03, 0.008, mat.black ), fw / 2 - 0.05, 1.2, front + 0.02 );
		add( g, RB( 0.02, 0.28, 0.03, 0.008, mat.black ), fw / 2 - 0.05, 0.52, front + 0.02 );
		return g;

	};

	// Wall cabinet housing the water heater: a plain door like the other wall
	// cabinets. The heater hangs inside, out of sight.
	B.heaterCabinet = ( W, D, o ) => {

		const g = new T.Group(), h = o.h;
		add( g, BX( W, h, D, mat.shell ), 0, h / 2, 0 );
		add( g, BX( W - 0.004, 0.004, 0.004, mat.shellLine ), 0, 0.002, D / 2 + 0.001 );
		return g;

	};

	// Chimney hood over the hob, satin steel like the fridge and dishwasher.
	B.hood = ( W, D, o ) => {

		const g = new T.Group(), canopy = 0.08;
		add( g, RB( W, canopy, D, 0.01, mat.steel ), 0, canopy / 2, 0 );
		add( g, BX( W - 0.06, 0.004, D - 0.08, mat.plinth ), 0, - 0.001, - 0.01 ).castShadow = false;
		add( g, BX( 0.22, 0.004, 0.03, mat.ledWarm ), 0, - 0.003, D / 2 - 0.06 ).castShadow = false;
		const chimney = o.ceiling - canopy;
		if ( chimney > 0.02 ) add( g, BX( 0.26, chimney, 0.22, mat.steel ), 0, canopy + chimney / 2, - D / 2 + 0.11 );
		return g;

	};

	B.uppers = ( W, D, o ) => {

		const g = new T.Group(), h = o.h;
		add( g, BX( W, h, D, mat.shell ), 0, h / 2, 0 );
		const n = Math.max( 1, Math.round( W / 0.5 ) );
		for ( let i = 1; i < n; i ++ ) add( g, BX( 0.004, h - 0.02, 0.004, mat.shellLine ), - W / 2 + ( i * W ) / n, h / 2, D / 2 + 0.001 );
		add( g, BX( W - 0.06, 0.008, 0.02, mat.ledWarm ), 0, - 0.004, D / 2 - 0.04 ).castShadow = false;
		if ( o.light ) lamp( g, 0, - 0.1, D / 2, 'warm', 1.6 );
		return g;

	};

	B.tiles = ( W, D, o ) => {

		const g = new T.Group(), h = o.h;
		const t = sized( o.tone === 'wet' ? tex.wet : tex.zellige, W / 0.6, h / 0.6 );
		add( g, BX( W, h, 0.008, phys( { map: t, roughness: 0.22, clearcoat: 0.7, clearcoatRoughness: 0.25 } ) ), 0, h / 2, 0 ).castShadow = false;
		return g;

	};

	B.shoeCabinet = ( W, D, o ) => {

		const g = new T.Group(), h = o.h, leg = 0.1, body = h - leg;
		add( g, RB( W, body, D, 0.01, mat.oak ), 0, leg + body / 2, 0 );
		slatFront( g, W - 0.04, body - 0.05, leg + body / 2, D / 2 + 0.001 );
		legs( g, W, D, leg, 0.035 );
		add( g, bowlShape( 0.08, mat.clay ), - W / 4, h, 0 );
		add( g, vase( 0.16, mat.sandCeramic ), W / 4, h, 0 );
		return g;

	};

	B.mirror = ( W, D, o ) => {

		const g = new T.Group(), r = W / 2;
		add( g, CY( r, r, 0.012, mat.mirror, 48 ), 0, r, 0.004 ).rotation.x = Math.PI / 2;
		add( g, TOR( r, 0.008, mat.black ), 0, r, 0.008 );
		return g;

	};

	B.hooks = ( W ) => {

		const g = new T.Group();
		add( g, BX( W, 0.025, 0.012, mat.oak ), 0, 0, 0 );
		for ( let i = 0; i < 4; i ++ ) add( g, CY( 0.006, 0.006, 0.06, mat.black, 8 ), - W / 2 + ( ( i + 0.5 ) * W ) / 4, - 0.004, 0.03 ).rotation.x = Math.PI / 2 - 0.3;
		add( g, RB( 0.34, 0.4, 0.05, 0.02, mat.sand ), - W / 2 + ( 1.5 * W ) / 4, - 0.22, 0.05 ).rotation.z = 0.04;
		return g;

	};

	B.bed = ( W, D ) => {

		const g = new T.Group(), back = - D / 2;
		const mW = W - 0.1, mD = D - 0.1;
		add( g, RB( W, 0.25, D - 0.06, 0.015, mat.oak ), 0, 0.135, back + 0.06 + ( D - 0.06 ) / 2 );
		add( g, RB( W, 1.0, 0.08, 0.03, mat.oat ), 0, 0.55, back + 0.04 );
		add( g, RB( mW, 0.22, mD, 0.07, mat.linenWhite ), 0, 0.37, back + 0.08 + mD / 2 );
		const top = 0.48;
		const foot = back + 0.08 + mD;
		add( g, RB( mW + 0.06, 0.07, mD * 0.72, 0.03, mat.linenWhite ), 0, top + 0.02, foot - mD * 0.36 + 0.015 );
		add( g, RB( mW + 0.06, 0.08, 0.26, 0.04, mat.linenWhite ), 0, top + 0.035, foot - mD * 0.72 + 0.1 );
		for ( const sx of [ - 1, 1 ] ) add( g, RB( 0.62, 0.13, 0.4, 0.06, mat.linenWhite ), sx * 0.38, top + 0.06, back + 0.33 ).rotation.x = - 0.35;
		add( g, RB( 0.5, 0.3, 0.1, 0.05, mat.sage ), 0.08, top + 0.14, back + 0.52 ).rotation.set( - 0.3, 0.1, 0.04 );
		// sage throw folded over the foot
		add( g, RB( mW + 0.1, 0.03, 0.45, 0.012, mat.sage ), 0, top + 0.07, foot - 0.25 );
		add( g, RB( mW + 0.1, 0.24, 0.03, 0.012, mat.sage ), 0, top - 0.05, foot + 0.02 );
		return g;

	};

	B.nightstand = ( W, D, o ) => {

		const g = new T.Group(), h = o.h, leg = 0.1;
		add( g, RB( W, h - leg, D, 0.01, mat.oak ), 0, leg + ( h - leg ) / 2, 0 );
		add( g, BX( W - 0.04, 0.004, 0.004, mat.oakLine ), 0, h - 0.13, D / 2 + 0.001 );
		add( g, CY( 0.012, 0.012, 0.02, mat.black, 12 ), 0, h - 0.07, D / 2 + 0.01 ).rotation.x = Math.PI / 2;
		legs( g, W, D, leg, 0.03 );
		add( g, BX( 0.14, 0.025, 0.2, bookMats[ 1 ] ), ( o.book || 1 ) * 0.1, h + 0.0125, 0.02 ).rotation.y = 0.2;
		return g;

	};

	B.wardrobe = ( W, D, o ) => {

		const g = new T.Group(), h = o.h;
		add( g, BX( W, h, D - 0.04, mat.shell ), 0, h / 2, - 0.02 );
		// two sliding oak doors on staggered tracks
		[ [ - 1, 0 ], [ 1, 0.022 ] ].forEach( ( [ sx, dz ] ) => {

			add( g, RB( W / 2 + 0.02, h - 0.08, 0.02, 0.004, std( { map: sized( tex.slats, ( W / 2 ) / 0.6, 1 ), roughness: 0.55 } ) ), sx * ( W / 4 - 0.01 ), h / 2 - 0.02, D / 2 - 0.035 + dz );
			add( g, BX( 0.02, 0.5, 0.01, mat.black ), sx * ( W / 2 - 0.08 ), 1.05, D / 2 - 0.02 + dz );

		} );
		add( g, BX( W, 0.06, 0.03, mat.shell ), 0, h - 0.03, D / 2 - 0.015 );
		return g;

	};

	B.curtains = ( W, D, o ) => {

		const g = new T.Group(), top = 2.55, H = top - 0.02;
		add( g, CY( 0.01, 0.01, W, mat.black, 10 ), 0, top + 0.03, 0.03 ).rotation.z = Math.PI / 2;
		const [ lo, hi ] = [ o.u( o.window[ 0 ] ), o.u( o.window[ 1 ] ) ].sort( ( a, b ) => a - b );
		for ( const [ a, b ] of [ [ - W / 2, lo + 0.04 ], [ hi - 0.04, W / 2 ] ] ) add( g, new T.Mesh( drape( b - a, H ), mat.curtain ), ( a + b ) / 2, 0.02 + H / 2, 0.05 ).castShadow = true;
		return g;

	};

	B.blind = ( W, D, o ) => {

		const g = new T.Group(), h = o.h;
		add( g, BX( W, h, 0.004, mat.curtain ), 0, h / 2, 0 );
		add( g, CY( 0.02, 0.02, W + 0.02, mat.shell, 16 ), 0, h + 0.02, 0 ).rotation.z = Math.PI / 2;
		add( g, BX( W, 0.018, 0.012, mat.black ), 0, 0.009, 0 );
		return g;

	};

	B.desk = ( W, D, o ) => {

		const g = new T.Group(), h = o.h;
		add( g, RB( W, 0.03, D, 0.006, mat.oak ), 0, h - 0.015, 0 );
		for ( const sx of [ - 1, 1 ] ) {

			const x = sx * ( W / 2 - 0.05 );
			add( g, BX( 0.025, h - 0.03, 0.025, mat.black ), x, ( h - 0.03 ) / 2, D / 2 - 0.08 );
			add( g, BX( 0.025, h - 0.03, 0.025, mat.black ), x, ( h - 0.03 ) / 2, - D / 2 + 0.08 );
			add( g, BX( 0.025, 0.025, D - 0.16, mat.black ), x, 0.0125, 0 );
			add( g, BX( 0.025, 0.025, D - 0.16, mat.black ), x, h - 0.045, 0 );

		}

		add( g, BX( 0.21, 0.012, 0.28, mat.cream ), - W / 2 + 0.38, h + 0.006, 0.1 ).rotation.y = - 0.15;
		add( g, CY( 0.035, 0.035, 0.1, mat.clay, 16 ), - W / 2 + 0.12, h + 0.05, - 0.15 );
		return g;

	};

	B.monitor = ( W ) => {

		const g = new T.Group();
		add( g, BX( 0.2, 0.012, 0.16, mat.black ), 0, 0.006, - 0.01 );
		add( g, BX( 0.04, 0.2, 0.02, mat.black ), 0, 0.11, - 0.03 );
		add( g, RB( W, 0.36, 0.018, 0.004, mat.screen ), 0, 0.3, - 0.005 );
		return g;

	};

	B.officeChair = () => {

		const g = new T.Group();
		for ( let i = 0; i < 5; i ++ ) {

			const a = ( i / 5 ) * Math.PI * 2;
			add( g, BX( 0.3, 0.025, 0.035, mat.black ), Math.cos( a ) * 0.15, 0.06, Math.sin( a ) * 0.15 ).rotation.y = - a;
			add( g, SP( 0.022, mat.black, 10 ), Math.cos( a ) * 0.29, 0.022, Math.sin( a ) * 0.29 );

		}

		add( g, CY( 0.025, 0.03, 0.34, mat.black, 12 ), 0, 0.23, 0 );
		add( g, RB( 0.5, 0.08, 0.48, 0.035, mat.charcoal ), 0, 0.46, 0.02 );
		add( g, BX( 0.05, 0.36, 0.03, mat.black ), 0, 0.62, - 0.24 );
		add( g, RB( 0.46, 0.5, 0.07, 0.035, mat.charcoal ), 0, 0.84, - 0.25 ).rotation.x = - 0.1;
		return g;

	};

	B.bookshelf = ( W, D, o, r ) => {

		const g = new T.Group(), h = o.h, t = 0.025;
		for ( const sx of [ - 1, 1 ] ) add( g, BX( t, h, D, mat.oak ), sx * ( W / 2 - t / 2 ), h / 2, 0 );
		const levels = [];
		for ( let i = 0; i < 5; i ++ ) {

			const y = 0.04 + ( i * ( h - 0.06 ) ) / 4;
			levels.push( y );
			add( g, BX( W - 2 * t, t, D, mat.oak ), 0, y, 0 );

		}

		const boxes = [];
		for ( let s = 0; s < 4; s ++ ) {

			let x = - W / 2 + t + 0.02;
			const end = W / 2 - t - 0.02;
			while ( x < end - 0.04 ) {

				if ( r() < 0.1 ) {

					x += 0.14 + r() * 0.16;
					continue;

				}

				const bw = 0.02 + r() * 0.035, bh = 0.17 + r() * 0.12, bd = D - 0.05 - r() * 0.05;
				if ( x + bw > end ) break;
				boxes.push( { w: bw, h: bh, d: bd, x: x + bw / 2, y: levels[ s ] + t / 2 + bh / 2, z: D / 2 - bd / 2 - 0.01, c: BOOK_COLORS[ Math.floor( r() * BOOK_COLORS.length ) ] } );
				x += bw + 0.002;

			}

		}

		add( g, mergedBoxes( boxes, mat.books ) );
		add( g, vase( 0.2, mat.clay ), - W / 2 + 0.3, h + t / 2, 0 );
		add( g, CY( 0.06, 0.05, 0.11, mat.terracotta, 18 ), W / 2 - 0.25, h + t / 2 + 0.055, 0 );
		for ( let i = 0; i < 6; i ++ ) add( g, ICO( 0.035 + r() * 0.025, mat.leafHerb ), W / 2 - 0.25 + ( r() - 0.5 ) * 0.1, h + 0.16 + r() * 0.08, ( r() - 0.5 ) * 0.1 );
		return g;

	};

	B.shower = ( W, D, o ) => {

		const g = new T.Group();
		add( g, RB( W, 0.04, D, 0.01, mat.ceramic ), 0, 0.02, 0 );
		add( g, BX( W * 0.6, 0.004, 0.03, mat.black ), 0, 0.0405, - D / 2 + 0.08 ).castShadow = false;
		const [ g0, g1 ] = [ o.u( o.glass[ 0 ] ), o.u( o.glass[ 1 ] ) ].sort( ( a, b ) => a - b );
		const len = g1 - g0, gx = ( g0 + g1 ) / 2, gz = D / 2 - 0.03;
		add( g, BX( len, 2.0, 0.008, mat.glassClip ), gx, 1.04, gz ).castShadow = false;
		add( g, BX( len, 0.015, 0.012, mat.black ), gx, 2.045, gz );
		add( g, BX( 0.02, 2.0, 0.02, mat.black ), g0, 1.04, gz );
		add( g, CY( 0.12, 0.12, 0.01, mat.black, 32 ), 0, 2.1, - D / 2 + 0.3 );
		add( g, BX( 0.015, 0.015, 0.3, mat.black ), 0, 2.13, - D / 2 + 0.15 );
		add( g, RB( 0.12, 0.2, 0.05, 0.01, mat.black ), 0, 1.1, - D / 2 + 0.025 );
		return g;

	};

	B.vanity = ( W, D, o ) => {

		const g = new T.Group(), small = !! o.small, cab = small ? 0.3 : 0.38;
		add( g, RB( W, cab, D, 0.01, mat.oak ), 0, cab / 2, 0 );
		add( g, RB( W + 0.01, 0.03, D + 0.01, 0.006, mat.quartz ), 0, cab + 0.015, 0 );
		const br = small ? 0.14 : 0.19;
		add( g, LATHE( 'basin' + k( br ), [ [ 0, 0 ], [ br * 0.6, 0 ], [ br, br * 0.4 ], [ br, br * 0.6 ], [ br * 0.92, br * 0.6 ], [ br * 0.55, br * 0.1 ], [ 0, br * 0.1 ] ], mat.ceramic, 40 ), 0, cab + 0.03, 0.02 );
		add( g, CY( 0.01, 0.01, 0.16, mat.black, 10 ), 0, cab + 0.28, - D / 2 + 0.08 ).rotation.x = Math.PI / 2;
		const my = cab + 0.4;
		if ( o.mirror === 'round' ) {

			const r = Math.min( 0.25, W / 2 + 0.05 );
			add( g, CY( r, r, 0.012, mat.mirror, 48 ), 0, my + r, - D / 2 + 0.006 ).rotation.x = Math.PI / 2;
			add( g, TOR( r, 0.007, mat.black ), 0, my + r, - D / 2 + 0.01 );
			add( g, BX( 0.3, 0.02, 0.03, mat.ledCool ), 0, my + 2 * r + 0.06, - D / 2 + 0.02 ).castShadow = false;

		} else {

			add( g, RB( W * 0.8, 0.75, 0.015, 0.06, mat.mirror ), 0, my + 0.375, - D / 2 + 0.008 );
			add( g, BX( W * 0.6, 0.02, 0.03, mat.ledCool ), 0, my + 0.81, - D / 2 + 0.02 ).castShadow = false;

		}

		add( g, CY( 0.024, 0.024, 0.14, mat.amber, 12 ), W / 2 - 0.08, cab + 0.1, - D / 2 + 0.08 );
		return g;

	};

	B.towelRail = ( W ) => {

		const g = new T.Group();
		add( g, CY( 0.009, 0.009, W, mat.black, 10 ), 0, 0, 0.05 ).rotation.z = Math.PI / 2;
		for ( const sx of [ - 1, 1 ] ) add( g, BX( 0.012, 0.012, 0.05, mat.black ), sx * ( W / 2 - 0.02 ), 0, 0.025 );
		add( g, RB( W * 0.8, 0.02, 0.06, 0.008, mat.sand ), 0, 0.012, 0.05 );
		add( g, RB( W * 0.8, 0.45, 0.02, 0.008, mat.sand ), 0, - 0.22, 0.075 );
		add( g, RB( W * 0.8, 0.35, 0.02, 0.008, mat.sand ), 0, - 0.17, 0.028 );
		return g;

	};

	B.toilet = ( W, D ) => {

		const g = new T.Group(), back = - D / 2;
		add( g, RB( W, 1.1, 0.2, 0.01, mat.shell ), 0, 0.55, back + 0.1 );
		add( g, BX( 0.24, 0.16, 0.008, mat.black ), 0, 0.98, back + 0.204 );
		add( g, RB( 0.36, 0.3, D - 0.2, 0.13, mat.ceramic ), 0, 0.25, back + 0.2 + ( D - 0.2 ) / 2 );
		add( g, RB( 0.37, 0.025, D - 0.23, 0.012, mat.ceramic ), 0, 0.41, back + 0.2 + ( D - 0.23 ) / 2 );
		return g;

	};

	B.planter = ( W, D, o, r ) => {

		const g = new T.Group();
		add( g, RB( W, 0.34, D, 0.01, mat.terracotta ), 0, 0.17, 0 );
		add( g, BX( W - 0.02, 0.01, D - 0.02, mat.soil ), 0, 0.335, 0 );
		const geranium = o.kind === 'geranium';
		for ( let i = 0; i < 7; i ++ ) add( g, ICO( 0.05 + r() * 0.035, geranium ? mat.leafGeranium : mat.leafHerb ), ( r() - 0.5 ) * ( W - 0.06 ), 0.38 + r() * 0.12, ( r() - 0.5 ) * ( D - 0.04 ) ).rotation.set( r() * 3, r() * 3, r() * 3 );
		for ( let i = 0; i < ( geranium ? 6 : 9 ); i ++ ) {

			const x = ( r() - 0.5 ) * ( W - 0.06 ), z = ( r() - 0.5 ) * ( D - 0.04 );
			if ( geranium ) add( g, ICO( 0.022, mat.flower ), x, 0.48 + r() * 0.1, z );
			else add( g, CY( 0.006, 0.01, 0.12, mat.lavender, 6 ), x, 0.5 + r() * 0.06, z );

		}

		return g;

	};

	/* ------------------------------------------------------------ place */

	const FACE = { s: 0, n: Math.PI, e: Math.PI / 2, w: - Math.PI / 2 };
	const group = new T.Group();
	group.name = 'furniture';

	PLAN.furniture.forEach( ( item, index ) => {

		const build = B[ item.type ];
		if ( ! build ) return;
		const [ x0, y0, x1, y1 ] = item.at;
		const cx = ( x0 + x1 ) / 2, cy = ( y0 + y1 ) / 2;
		const face = item.face || 's';
		const alongX = face === 'n' || face === 's';
		const W = m( alongX ? x1 - x0 : y1 - y0 );
		const D = m( alongX ? y1 - y0 : x1 - x0 );
		// plan position (cm) along the piece's width → local x (m)
		const u = ( p ) => m( face === 's' ? p - cx : face === 'n' ? cx - p : face === 'e' ? cy - p : p - cy );
		const base = m( item.base || 0 );
		const o = Object.assign( {}, item, { h: item.h !== undefined ? m( item.h ) : undefined, u, ceiling: wallHeight - base } );
		const obj = build( W, D, o, rng( 1000 + index ) );
		obj.position.set( X( m( cx ) ), ( item.level === 'balcony' ? - BALCONY_DROP : 0 ) + FLOOR + base, Z( m( cy ) ) );
		obj.rotation.y = FACE[ face ];
		obj.userData.item = item;
		if ( item.tag ) {

			const el = document.createElement( 'div' );
			el.className = 'tag-3d';
			el.textContent = item.tag;
			const chip = new T.CSS2DObject( el );
			chip.position.set( 0, ( o.h || 0.5 ) / 2, D / 2 + 0.02 );
			obj.add( chip );

		}

		group.add( obj );

	} );

	// Bake every part's transform into its geometry and merge parts that share
	// a material: a few dozen draw calls instead of several hundred. Lights and
	// labels are kept as they are.
	group.updateMatrixWorld( true );
	const buckets = new Map();
	const keep = [];
	group.traverse( ( o ) => {

		if ( o.isMesh ) {

			const key = o.material.uuid + ( o.castShadow ? '+' : '-' );
			if ( ! buckets.has( key ) ) buckets.set( key, { material: o.material, cast: o.castShadow, geos: [] } );
			buckets.get( key ).geos.push( o.geometry.clone().applyMatrix4( o.matrixWorld ) );

		} else if ( o.isLight || o.isCSS2DObject ) keep.push( o );

	} );

	for ( const o of keep ) group.attach( o );
	for ( const child of group.children.slice() ) if ( ! child.isLight && ! child.isCSS2DObject ) group.remove( child );

	for ( const { material, cast, geos } of buckets.values() ) {

		const indexed = geos.every( ( g ) => g.index );
		const parts = indexed ? geos : geos.map( ( g ) => ( g.index ? g.toNonIndexed() : g ) );
		const merged = parts.length === 1 ? parts[ 0 ] : T.mergeGeometries( parts, false );
		if ( ! merged ) continue;
		const mesh = new T.Mesh( merged, material );
		mesh.castShadow = cast;
		mesh.receiveShadow = true;
		group.add( mesh );
		for ( const g of geos ) if ( g !== merged ) g.dispose();

	}

	cache.forEach( ( g ) => g.dispose() );
	cache.clear();

	return {
		group,
		// 0 = daylight, 1 = evening: lamps glow and light the rooms
		setEvening( t ) {

			for ( const [ material, peak ] of GLOWS ) material.emissiveIntensity = peak * t;
			for ( const { light, power } of lights ) {

				light.visible = t > 0.001;
				light.intensity = power * 4 * t;

			}

		},
	};

};
