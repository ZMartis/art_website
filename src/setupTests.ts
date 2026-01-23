import '@testing-library/jest-dom';

if (!Element.prototype.animate) {
	Element.prototype.animate = () => {
		const animation: Animation = {
			cancel() {},
			finish() {},
			play() {},
			pause() {},
			reverse() {},
			updatePlaybackRate() {},
			onfinish: null,
			oncancel: null,
			onremove: null,
			finished: Promise.resolve(),
			ready: Promise.resolve(),
			currentTime: null,
			startTime: null,
			playbackRate: 1,
			playState: 'finished',
			pending: false,
			timeline: null,
			effect: null,
			id: ''
		};

		queueMicrotask(() => animation.onfinish?.(new Event('finish')));
		return animation;
	};
}
