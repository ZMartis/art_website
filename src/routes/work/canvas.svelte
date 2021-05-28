<script lang="ts">
	import ArtDisplay from '$lib/components/art_display/index.svelte';
	import { canvases } from '$lib/data/canvas';
</script>

<ArtDisplay artworks={canvases} />
