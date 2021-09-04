<script lang="ts">
	import type { Artwork } from 'src/types/artwork';

	export let artwork: Artwork;
	$: image = artwork.smallImage ? artwork.smallImage : artwork.image;
	$: imageAlt = artwork.title + ' (' + artwork.subTitle + ')';
</script>

<div class="listingContainer">
	<div class="imgContainer">
		<img src={image} alt={imageAlt} />
	</div>
	<h3>
		{#if artwork.number}{artwork.number}. {/if}{artwork.title}
		{#if artwork.subTitle}<span>({artwork.subTitle})</span>{/if}
	</h3>
</div>

<style>
	.listingContainer {
		width: 100%;
	}
	.imgContainer {
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	h3 {
		margin: 0.4rem 0 0;
	}
	span {
		font-weight: 400;
		font-size: 0.8rem;
	}

	@media (min-width: 768px) {
		/* your tablet styles go here */
		.listingContainer {
			--img-size: 13rem;
		}
	}
	@media (min-width: 1366px) {
		.listingContainer {
			--img-size: 20rem;
		}
	}
</style>
