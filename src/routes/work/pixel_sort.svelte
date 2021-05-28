<script lang="ts">
	import ArtDisplay from '$lib/components/art_display/index.svelte';
	import { pixelSorts } from '$lib/data/pixel_sort';
</script>

<ArtDisplay artworks={pixelSorts} />

<style>
	/* your mobile styles go here */
	@media (min-width: 768px) {
		/* your tablet styles go here */
	}
	@media (min-width: 1366px) {
		/* your desktop styles go here */
	}
</style>
