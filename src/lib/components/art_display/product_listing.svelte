<script lang="ts">
	import type { Artwork } from 'src/types/artwork';
	import { fade } from 'svelte/transition';

	export let artwork: Artwork;
	$: image = artwork.smallImage ? artwork.smallImage : artwork.image;
	$: imageAlt = artwork.title + ' (' + artwork.subTitle + ')';
	let overlayActive = false;
	function toggleOverlay() {
		overlayActive = !overlayActive;
	}
</script>

<div
	on:mouseenter={toggleOverlay}
	on:mouseleave={toggleOverlay}
	class="listingContainer"
>
	<div class="imgContainer">
		<img src={image} alt={imageAlt} />
		{#if overlayActive}
			<div transition:fade={{ duration: 200 }} class="overlay">
				<h1>{artwork.title}</h1>
			</div>
		{/if}
	</div>
	<div class="contentContainer">
		<h3>
			{#if artwork.number}{artwork.number}. {/if}{artwork.title}
			{#if artwork.subTitle}<span>({artwork.subTitle})</span>{/if}
		</h3>
		<p>
			{#if artwork.description}{artwork.description}{:else}Haven't written a
				description for {artwork.title}. Should probably do that at some point.
				¯\_(ツ)_/¯{/if}
		</p>
	</div>
</div>

<style>
	.listingContainer {
		width: 100%;
		height: fit-content;
	}
	.listingContainer:hover {
		background-color: var(--accent-color);
		transition-duration: 0.2s;
		color: var(--white);
	}
	.imgContainer {
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}
	.contentContainer {
		padding: 0 0.4rem 0.2rem;
		border: 1px solid black;
		border-top: 0.01px solid transparent;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		cursor: pointer;
		position: absolute;
	}
	.overlay {
		background-color: var(--black);
		opacity: 0.8;
		width: 100%;
		height: 100%;
		position: absolute;
		cursor: pointer;
		transition-duration: 0.2s;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.overlay h1 {
		color: var(--accent-color);
		font-size: 1.6rem;
		padding: 0.8rem 1rem 1rem;
		border: 0.2rem solid var(--accent-color);
	}
	h3 {
		margin: 0.4rem 0 0;
		cursor: pointer;
		width: fit-content;
	}
	span {
		font-weight: 400;
		font-size: 0.8rem;
	}
	p {
		margin: 0.4rem 0 0;
		font-size: 0.7rem;
		overflow: hidden;
		display: -webkit-box;
		text-overflow: ellipsis;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	@media (min-width: 768px) {
		/* your tablet styles go here */
		.listingContainer {
			--img-size: 13rem;
		}
		.listingContainer:hover {
			transform: scale(1.01);
		}
	}
	@media (min-width: 1366px) {
		.listingContainer {
			--img-size: 20rem;
		}
	}
</style>
