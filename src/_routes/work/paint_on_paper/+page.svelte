<script lang="ts">
	import ArtDisplay from '$lib/components/art_display/index.svelte'
	import { paintOnPapers } from '$lib/data/paint_on_papers'
</script>

<!-- TODO: Add a description. -->

<ArtDisplay artworks={paintOnPapers} />
