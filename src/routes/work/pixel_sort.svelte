<script lang="ts">
	import ArtDisplay from '$lib/components/art_display/index.svelte';
	import { pixelSorts } from '$lib/data/pixel_sorts';
</script>

<ArtDisplay artworks={pixelSorts} />
