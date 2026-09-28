// Build entry for vendor/three.bundle.min.js
// Bundles three.js r186 plus the add-ons the 3D model uses into ONE classic
// script that exposes a global `THREE`. A classic script (not an ES module)
// is what lets index.html open straight from disk with a double-click.
//
// Rebuild (from a folder where `npm i three@0.186.1 esbuild` was run):
//   npx esbuild three-entry.js --bundle --minify --format=iife \
//       --legal-comments=eof --outfile=three.bundle.min.js

import * as CORE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

window.THREE = Object.assign( {}, CORE, {
	OrbitControls,
	RoomEnvironment,
	EffectComposer,
	RenderPass,
	GTAOPass,
	OutputPass,
	CSS2DRenderer,
	CSS2DObject,
	RoundedBoxGeometry,
	mergeGeometries,
} );
