<script lang="ts">
	import ProductListing from '$lib/components/art_display/product_listing.svelte'
	import type { Artwork } from 'src/types/artwork'
	import { fade } from 'svelte/transition'

	export let artworks: Artwork[]
</script>

<div in:fade={{ duration: 1000, delay: 1100 }} out:fade={{ duration: 1000 }}>
	{#each artworks as artwork}
		<ProductListing {artwork} />
	{/each}
</div>

<style>
	div {
		display: grid;
		justify-items: center;
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 1.5rem 1rem;
		padding: 1rem;
	}
	@media (min-width: 768px) {
		div {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	@media (min-width: 1366px) {
		div {
			width: 80%;
			grid-template-columns: repeat(5, 1fr);
		}
	}
</style>
