<script lang="ts">
	import ArtDisplay from '$lib/components/art_display/index.svelte'
	import { canvases } from '$lib/data/canvases'
</script>

<!-- TODO: Add a description. -->

<ArtDisplay artworks={canvases} />
