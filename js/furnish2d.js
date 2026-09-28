/*
 * Floor 4 apartment — furniture on the 2D plan.
 *
 * Draws every piece in HOME_PLAN.furniture as a plan symbol inside
 * <g id="furniture-2d"> in index.html, in the drawing's own centimetre
 * units, so the plan and the 3D model always show the same layout.
 *
 * Symbols are drawn in a local frame: width along x, depth along y, the
 * front of the piece towards +y, then rotated to face n / s / e / w.
 */
( function () {

	'use strict';

	const layer = document.getElementById( 'furniture-2d' );
	const PLAN = window.HOME_PLAN;
	if ( ! layer || ! PLAN || ! PLAN.furniture ) return;

	const NS = 'http://www.w3.org/2000/svg';
	const ROT = { s: 0, n: 180, e: - 90, w: 90 };

	function el( tag, attrs, parent ) {

		const e = document.createElementNS( NS, tag );
		for ( const key in attrs ) e.setAttribute( key, attrs[ key ] );
		parent.appendChild( e );
		return e;

	}

	const rect = ( g, x, y, w, h, cls = 'f', rx = 0 ) => el( 'rect', { x, y, width: w, height: h, rx, class: cls }, g );
	const circle = ( g, cx, cy, r, cls = 'f' ) => el( 'circle', { cx, cy, r, class: cls }, g );
	const ellipse = ( g, cx, cy, rx, ry, cls = 'fl' ) => el( 'ellipse', { cx, cy, rx, ry, class: cls }, g );
	const line = ( g, x1, y1, x2, y2, cls = 'fl' ) => el( 'line', { x1, y1, x2, y2, class: cls }, g );
	const path = ( g, d, cls = 'fl' ) => el( 'path', { d, class: cls }, g );
	const box = ( g, W, D, cls ) => rect( g, - W / 2, - D / 2, W, D, cls );
	const cross = ( g, r ) => {

		line( g, - r, 0, r, 0 );
		line( g, 0, - r, 0, r );

	};

	// small upright label, whatever the piece's rotation
	const label = ( g, x, y, text, o ) => {

		const t = el( 'text', { x, y, class: 'ftext', transform: `rotate(${ - o.rot } ${ x } ${ y })` }, g );
		t.textContent = text;

	};

	// straight sofa: back along the rear, an arm each end, seat divisions. A
	// sofa bed also shows, dashed, how far the opened bed reaches from the back.
	function sofa( g, W, D, o ) {

		const back = - D / 2, n = o.seats || 3, arm = 16, inner = W - 2 * arm;
		rect( g, - W / 2, back, W, D, 'f', 4 );
		line( g, - W / 2, back + 20, W / 2, back + 20 );
		for ( const sx of [ - 1, 1 ] ) line( g, sx * ( W / 2 - arm ), back + 20, sx * ( W / 2 - arm ), D / 2 );
		for ( let i = 1; i < n; i ++ ) line( g, - inner / 2 + ( inner * i ) / n, back + 20, - inner / 2 + ( inner * i ) / n, D / 2 );
		if ( o.bed ) rect( g, - W / 2 + arm, back, inner, o.bed, 'fbed' );

	}

	const draw = {

		box: ( g, W, D ) => box( g, W, D ),
		rug: ( g, W, D ) => box( g, W, D, 'frug' ),
		tv: ( g, W ) => rect( g, - W / 2, - 1.5, W, 3, 'fdark' ),
		sofa,

		armchair( g, W, D ) {

			rect( g, - W / 2, - D / 2, W, D, 'f', 4 );
			line( g, - W / 2, - D / 2 + 18, W / 2, - D / 2 + 18 );
			for ( const sx of [ - 1, 1 ] ) line( g, sx * ( W / 2 - 14 ), - D / 2 + 18, sx * ( W / 2 - 14 ), D / 2 );

		},

		sideTable: ( g, W, D ) => circle( g, 0, 0, Math.min( W, D ) / 2 ),
		coffeeTable: ( g, W, D, o ) => ( o.shape === 'oval' ? rect( g, - W / 2, - D / 2, W, D, 'f', Math.min( W, D ) / 2 ) : circle( g, 0, 0, Math.min( W, D ) / 2 ) ),
		bowl: ( g, W ) => circle( g, 0, 0, W / 2, 'fl' ),

		tvUnit( g, W, D ) {

			box( g, W, D );
			line( g, - W / 2 + 3, D / 2 - 3, W / 2 - 3, D / 2 - 3 );

		},

		chair( g, W, D ) {

			rect( g, - W / 2, - D / 2, W, D, 'f', 3 );
			rect( g, - W / 2, - D / 2, W, 5, 'fdark' );

		},

		bed( g, W, D ) {

			box( g, W, D );
			rect( g, - W / 2 + 5, - D / 2 + 8, W - 10, D - 13, 'f', 6 );
			rect( g, - W / 2 + 10, - D / 2 + 14, W / 2 - 16, 34, 'f', 8 );
			rect( g, 6, - D / 2 + 14, W / 2 - 16, 34, 'f', 8 );
			line( g, - W / 2 + 5, - D / 2 + 62, W / 2 - 5, - D / 2 + 62 );
			line( g, W / 2 - 5, - D / 2 + 62, W / 2 - 38, - D / 2 + 95 );

		},

		wardrobe( g, W, D ) {

			box( g, W, D );
			line( g, - W / 2 + 4, 0, W / 2 - 4, 0, 'fdash' );
			line( g, - W / 2, D / 2 - 5, 3, D / 2 - 5 );
			line( g, - 3, D / 2 - 9, W / 2, D / 2 - 9 );

		},

		counter( g, W, D, o ) {

			box( g, W, D );
			line( g, - W / 2, D / 2 - 3, W / 2, D / 2 - 3 );
			for ( const [ a, b, kind ] of o.fronts || [] ) {

				if ( kind !== 'dishwasher' && kind !== 'washer' ) continue;
				const x0 = Math.min( o.u( a ), o.u( b ) ), x1 = Math.max( o.u( a ), o.u( b ) ), cx = ( x0 + x1 ) / 2;
				rect( g, x0 + 3, - D / 2 + 4, x1 - x0 - 6, D - 10, 'fdash' );
				if ( kind === 'washer' ) circle( g, cx, 2, 17, 'fl' );
				label( g, cx, kind === 'washer' ? 2 : 0, kind === 'washer' ? 'WM' : 'DW', o );

			}
			if ( o.cooktop !== undefined ) {

				const x = o.u( o.cooktop );
				rect( g, x - 29, - 25, 58, 50, 'fl', 2 );
				for ( const [ dx, dy ] of [ [ - 13, - 11 ], [ 13, - 11 ], [ - 13, 11 ], [ 13, 11 ] ] ) circle( g, x + dx, dy, 7, 'fl' );

			}

			if ( o.sink !== undefined ) {

				const x = o.u( o.sink );
				rect( g, x - 25, - 17, 50, 38, 'fl', 5 );
				circle( g, x, 2, 2.5, 'fdark' );

			}

		},

		uppers: ( g, W, D ) => box( g, W, D, 'fdash' ),

		fridge( g, W, D, o ) {

			box( g, W, D );
			const t = o.frame ? 2 : 0, fw = W - 2 * t;
			if ( o.frame ) rect( g, - fw / 2, - D / 2, fw, D - 2, 'fl' );
			if ( o.kind === 'sideBySide' ) {

				const split = - fw / 2 + fw * 0.42;
				line( g, split, - D / 2, split, D / 2 - t );
				label( g, 0, 0, 'F', o );

			} else line( g, - fw / 2, - D / 2, fw / 2, D / 2 - t );

		},

		// overhead pieces are dashed, as on any plan
		heaterCabinet( g, W, D, o ) {

			box( g, W, D, 'fdash' );
			label( g, 0, 0, 'WH', o );

		},

		hood( g, W, D ) {

			box( g, W, D, 'fdash' );
			line( g, - W / 2, - D / 2, W / 2, D / 2, 'fdash' );
			line( g, - W / 2, D / 2, W / 2, - D / 2, 'fdash' );

		},

		bookshelf( g, W, D ) {

			box( g, W, D );
			line( g, - W / 2 + 3, 0, W / 2 - 3, 0 );

		},

		desk: ( g, W, D ) => box( g, W, D ),
		monitor: ( g, W ) => rect( g, - W / 2, - 4, W, 3, 'fdark' ),

		officeChair( g ) {

			circle( g, 0, 3, 24 );
			rect( g, - 22, - 26, 44, 7, 'fdark', 3 );

		},

		lamp( g, W, D ) {

			circle( g, 0, 0, Math.min( W, D ) / 2 - 1, 'fl' );
			cross( g, Math.min( W, D ) / 2 - 1 );

		},

		pendant( g, W, D ) {

			circle( g, 0, 0, Math.min( W, D ) / 2, 'fdash' );
			cross( g, Math.min( W, D ) / 2 + 4 );

		},

		plant( g, W, D ) {

			const r = Math.min( W, D ) / 2;
			circle( g, 0, 0, r, 'fplant' );
			for ( let i = 0; i < 6; i ++ ) {

				const a = ( i / 6 ) * Math.PI * 2;
				line( g, 0, 0, Math.cos( a ) * r * 0.8, Math.sin( a ) * r * 0.8, 'fplantl' );

			}

		},

		planter( g, W, D ) {

			box( g, W, D );
			circle( g, - W / 5, 0, D / 3.2, 'fplant' );
			circle( g, W / 5, - D / 8, D / 3.6, 'fplant' );

		},

		wall: ( g, W, D ) => rect( g, - W / 2, - D / 2, W, Math.max( D, 2 ), 'fthin' ),

		curtains( g, W, D, o ) {

			const [ lo, hi ] = [ o.u( o.window[ 0 ] ), o.u( o.window[ 1 ] ) ].sort( ( a, b ) => a - b );
			for ( const [ a, b ] of [ [ - W / 2, lo + 4 ], [ hi - 4, W / 2 ] ] ) {

				let d = `M ${ a } 3`;
				let out = true;
				for ( let x = a; x < b; x += 6 ) {

					d += ` Q ${ x + 3 } ${ out ? 8 : - 2 } ${ Math.min( x + 6, b ) } 3`;
					out = ! out;

				}

				path( g, d );

			}

		},

		shower( g, W, D, o ) {

			box( g, W, D );
			line( g, - W / 2, - D / 2, W / 2, D / 2 );
			line( g, - W / 2, D / 2, W / 2, - D / 2 );
			const [ g0, g1 ] = [ o.u( o.glass[ 0 ] ), o.u( o.glass[ 1 ] ) ].sort( ( a, b ) => a - b );
			line( g, g0, D / 2 - 3, g1, D / 2 - 3, 'fglass' );

		},

		vanity( g, W, D ) {

			box( g, W, D );
			ellipse( g, 0, 2, W * 0.3, D * 0.3 );

		},

		toilet( g, W, D ) {

			rect( g, - W / 2, - D / 2, W, 20 );
			ellipse( g, 0, - D / 2 + 20 + ( D - 20 ) / 2, 18, ( D - 20 ) / 2, 'f' );

		},

	};

	draw.tableLamp = draw.lamp;
	draw.deskLamp = draw.lamp;
	draw.art = draw.wall;
	draw.mirror = draw.wall;
	draw.hooks = draw.wall;
	draw.towelRail = draw.wall;
	draw.blind = draw.wall;
	draw.tiles = () => {};

	for ( const item of PLAN.furniture ) {

		const [ x0, y0, x1, y1 ] = item.at;
		const cx = ( x0 + x1 ) / 2, cy = ( y0 + y1 ) / 2;
		const face = item.face || 's';
		const alongX = face === 'n' || face === 's';
		const W = alongX ? x1 - x0 : y1 - y0;
		const D = alongX ? y1 - y0 : x1 - x0;
		const u = ( p ) => ( face === 's' ? p - cx : face === 'n' ? cx - p : face === 'e' ? cy - p : p - cy );
		const g = el( 'g', { transform: `translate(${ cx } ${ cy }) rotate(${ ROT[ face ] })`, class: 'fi' }, layer );
		( draw[ item.type ] || draw.box )( g, W, D, Object.assign( {}, item, { u, rot: ROT[ face ] } ) );

	}

} )();
