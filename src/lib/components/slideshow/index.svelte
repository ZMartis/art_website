<script lang="ts">
	import { fly } from 'svelte/transition'
	import { onMount, onDestroy } from 'svelte'
	import { replace } from 'lodash-es'
	import type { Artwork } from '../../../types/artwork'

	export let slides: Artwork[]

	let currentIndex = -1
	let intervalId: number

	function nextSlide() {
		currentIndex = currentIndex + 1
		slides.length
	}

	function convertedTitle(title: string) {
		return replace(replace(title, ' ', '_'), '.', '+')
	}

	$: route = currentIndex >= 0 ? `/artwork/${convertedTitle(slides[currentIndex].title)}` : null

	onMount(() => {
		setTimeout(() => {
			currentIndex++
		}, 500)
		intervalId = setInterval(nextSlide, 10000)
	})

	onDestroy(() => {
		clearInterval(intervalId)
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
		flex-wrap: wrap;
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
