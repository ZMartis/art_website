<script lang="ts">
	import { macros } from '$lib/data/macros'
	import { canvases } from '$lib/data/canvases'
	import { paintOnPapers } from '$lib/data/paint_on_papers'
	import { pixelSorts } from '$lib/data/pixel_sorts'
	import { stripes } from '$lib/data/stripes'
	import { shuffle, xor } from 'lodash-es'
	import Slideshow from '$lib/components/slideshow/index.svelte'
	export const prerender = true

	const allArtworks = shuffle(xor(macros, canvases, paintOnPapers, pixelSorts, stripes))
</script>

<Slideshow slides={allArtworks} />
