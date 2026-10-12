import { LoadingManager as BaseLoadingManager, WebGLRenderer as BaseWebGLRenderer } from 'three';
import { renderers, renderState } from './runtime-state.ts';
import { adaptLoadingManager } from './asset-host.ts';

export * from 'three';

export class LoadingManager extends BaseLoadingManager {
	public constructor(...args: ConstructorParameters<typeof BaseLoadingManager>) {
		super(...args);
		adaptLoadingManager(this);
	}
}

export class WebGLRenderer extends BaseWebGLRenderer {
	public constructor(...args: ConstructorParameters<typeof BaseWebGLRenderer>) {
		super(...args);
		renderers.add(this);
		// WebGLRenderer installs render as an own property, shadowing a subclass method.
		const render = this.render.bind(this);
		this.render = (...renderArgs) => {
			render(...renderArgs);
			renderState.calls++;
			renderState.afterRender?.();
		};
	}
}
