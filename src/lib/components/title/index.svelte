<script lang="ts">
	import type { Artwork } from 'src/types/artwork';

	export let artwork: Artwork;
</script>

{#if artwork.number}{artwork.number}. {/if}{artwork.title}
{#if artwork.subTitle}<span>({artwork.subTitle})</span>{/if}

<style>
	span {
		font-weight: 400;
		font-size: 0.8rem;
	}
	@media (min-width: 768px) {
		/* your tablet styles go here */
	}
	@media (min-widthe: 1366px) {
		/* your desktop styles go here */
	}
</style>
