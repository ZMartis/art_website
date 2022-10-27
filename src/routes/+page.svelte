<script lang="ts">
	import { fly } from 'svelte/transition'
	import { macros } from '$lib/data/macros'
	import { canvases } from '$lib/data/canvases'
	import { paintOnPapers } from '$lib/data/paint_on_papers'
	import { pixelSorts } from '$lib/data/pixel_sorts'
	import { stripes } from '$lib/data/stripes'
	import { replace, shuffle, xor } from 'lodash-es'
	export const prerender = true

	const allArtworks = shuffle(xor(macros, canvases, paintOnPapers, pixelSorts, stripes))

	let activeArtwork = -1
	let slideshowActive = false

	setTimeout(() => (slideshowActive = true), 500)
	slideshow()

	function convertedTitle(title: string) {
		return replace(replace(title, ' ', '_'), '.', '+')
	}

	$: route = `/artwork/${convertedTitle(allArtworks[activeArtwork].title)}`

	function slideshow() {
		activeArtwork++
		if (activeArtwork >= allArtworks.length) {
			activeArtwork = 0
		}
		setTimeout(slideshow, 10000)
	}
</script>

{#if slideshowActive}
	{#key activeArtwork}
		<div in:fly={{ duration: 1001, x: 50, delay: 1000 }} out:fly={{ duration: 1000, x: -50 }}>
			<a href={route}>
				<img src={allArtworks[activeArtwork].smallImage} alt={allArtworks[activeArtwork].title} />
			</a>
		</div>
	{/key}
{/if}

<style>
	div {
		width: 100%;
		display: flex;
		justify-content: center;
	}
	a {
		margin-top: 5%;
	}
	img {
		max-height: 70vh;
		max-width: 100%;
		object-fit: contain;
		box-shadow: 20px 18px 37px 1px rgba(0, 0, 0, 0.15);
		cursor: pointer;
	}
</style>
