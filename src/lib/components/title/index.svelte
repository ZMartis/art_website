<script lang="ts">
	import type { Artwork } from '$lib/types/artwork'

	export let artwork: Artwork
</script>

<span>{#if artwork.number}{artwork.number}. {/if}{artwork.title}</span>
