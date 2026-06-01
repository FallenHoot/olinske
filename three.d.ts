declare module 'three' {
	export const LinearFilter: any;
	export const SRGBColorSpace: any;
	export const ClampToEdgeWrapping: any;
	export const RGBAFormat: any;
	export const BackSide: any;
	export const AdditiveBlending: any;

	export class WebGLRenderer {
		constructor(parameters?: any);
		[key: string]: any;
	}

	export class Scene {
		[key: string]: any;
	}

	export class PerspectiveCamera {
		constructor(fov?: number, aspect?: number, near?: number, far?: number);
		[key: string]: any;
	}

	export class Mesh {
		constructor(geometry?: any, material?: any);
		[key: string]: any;
	}

	export class ShaderMaterial {
		constructor(parameters?: any);
		[key: string]: any;
	}

	export class Points {
		constructor(geometry?: any, material?: any);
		[key: string]: any;
	}

	export class Clock {
		[key: string]: any;
	}

	export class Group {
		[key: string]: any;
	}

	export class Line {
		constructor(geometry?: any, material?: any);
		[key: string]: any;
	}

	export class AmbientLight {
		constructor(color?: any, intensity?: number);
		[key: string]: any;
	}

	export class DirectionalLight {
		constructor(color?: any, intensity?: number);
		[key: string]: any;
	}

	export class LoadingManager {
		constructor(onLoad?: () => void);
		[key: string]: any;
	}

	export class TextureLoader {
		constructor(manager?: any);
		load(path: string, onLoad?: (texture: Texture) => void, onProgress?: any, onError?: any): void;
		[key: string]: any;
	}

	export class Texture {
		[key: string]: any;
	}

	export class DataTexture extends Texture {
		constructor(data?: any, width?: number, height?: number, format?: any);
	}

	export class SphereGeometry {
		constructor(radius?: number, widthSegments?: number, heightSegments?: number);
		[key: string]: any;
	}

	export class MeshStandardMaterial {
		constructor(parameters?: any);
		[key: string]: any;
	}

	export class MeshBasicMaterial {
		constructor(parameters?: any);
		[key: string]: any;
	}

	export class PlaneGeometry {
		constructor(width?: number, height?: number);
		[key: string]: any;
	}

	export class Vector3 {
		constructor(x?: number, y?: number, z?: number);
		[key: string]: any;
	}

	export class BufferGeometry {
		[key: string]: any;
	}

	export class LineBasicMaterial {
		constructor(parameters?: any);
		[key: string]: any;
	}

	export class BufferAttribute {
		constructor(array: ArrayLike<number>, itemSize: number);
		[key: string]: any;
	}
}