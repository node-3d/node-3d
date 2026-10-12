/** The original example's FPS badge is an HTML widget, so it has no native display. */
export default class Stats {
	public readonly dom = {};

	public begin(): void {
		// The HTML timing badge is intentionally omitted.
	}

	public end(): void {
		// The HTML timing badge is intentionally omitted.
	}

	public update(): void {
		// No DOM or frame counter is needed for the scene.
	}
}
