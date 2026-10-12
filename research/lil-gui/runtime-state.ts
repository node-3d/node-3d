import type * as THREE from 'three';

// The loader needs the renderer's Three.js state cache reset after native drawing.
export const renderers = new Set<THREE.WebGLRenderer>();
export const renderState: { calls: number; afterRender?: () => void } = { calls: 0 };
