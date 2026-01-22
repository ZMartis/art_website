<script lang="ts">
	import { fly } from 'svelte/transition'
	import { onMount, onDestroy } from 'svelte'
	import { replace } from 'lodash-es'
	import type { Artwork } from '$lib/types/artwork'

	export let slides: Artwork[]

	let currentIndex = -1
	let timeoutId: ReturnType<typeof setTimeout> | undefined
	const intervalMs = 10000
	const startDelayMs = 500

	const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'
	const isVisible = () => isBrowser() && !document.hidden

	function nextSlide() {
		if (!slides?.length) return
		currentIndex = (currentIndex + 1) % slides.length
	}

	function clearScheduledNext() {
		if (timeoutId) {
			clearTimeout(timeoutId)
		}
	}

	function scheduleNext() {
		if (!isVisible()) return
		clearScheduledNext()
		timeoutId = window.setTimeout(() => {
			if (isVisible()) nextSlide()
			scheduleNext()
		}, intervalMs)
	}

	function handleVisibilityChange() {
		// Pause/resume scheduling so background throttling doesn't trigger rapid catch-up of slideshow images.
		if (isVisible()) return scheduleNext()
		clearScheduledNext()
	}

	function convertedTitle(title: string) {
		return replace(replace(title, ' ', '_'), '.', '+')
	}

	$: currentSlide = currentIndex >= 0 ? slides?.[currentIndex] : null
	$: route = currentSlide ? `/artwork/${convertedTitle(currentSlide.title)}` : null

	onMount(() => {
		setTimeout(() => {
			if (isVisible()) nextSlide()
		}, startDelayMs)
		scheduleNext()
		document.addEventListener('visibilitychange', handleVisibilityChange)
	})

	onDestroy(() => {
		clearScheduledNext()
		if (isBrowser()) {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	})
</script>

<div>
	{#key currentIndex}
		<a
			href={route}
			in:fly={{ x: 50, duration: 1000, delay: 1000 }}
			out:fly={{ x: -50, duration: 1000 }}
		>
			<img src={slides[currentIndex]?.smallImage} alt={slides[currentIndex]?.title} />
		</a>
	{/key}
</div>

<style>
	div {
		margin-top: 4rem;
		display: grid;
		width: 100%;
		height: 70vh;
		justify-content: center;
		align-items: center;
	}

	a {
		margin-left: auto;
		margin-right: auto;
		grid-column: 1/2;
		grid-row: 1/2;
	}

	img {
		max-height: 70vh;
		max-width: 100%;
		object-fit: contain;
		box-shadow: 18px 20px 37px 1px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
</style>
