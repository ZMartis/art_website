<script lang="ts">
	import type { Artwork } from '$lib/types/artwork'
	import { fade } from 'svelte/transition'
	import Title from '$lib/components/title/index.svelte'
	import Subtitle from '$lib/components/subtitle/index.svelte'
	import { replace } from 'lodash-es'

	export let artwork: Artwork

	const image = artwork.smallImage ? artwork.smallImage : artwork.image
	const imageAlt = artwork.subTitle ? artwork.title + ' (' + artwork.subTitle + ')' : artwork.title

	let overlayActive = false
	function toggleOverlay() {
		overlayActive = !overlayActive
	}

	function convertedTitle() {
		return replace(replace(artwork.title, ' ', '_'), '.', '+')
	}
</script>

<a
	href={`/artwork/${convertedTitle()}`}
	on:mouseenter={toggleOverlay}
	on:mouseleave={toggleOverlay}
	class="listingContainer"
>
	<div class="imgContainer">
		<img src={image} alt={imageAlt} />
		{#if overlayActive}
			<div transition:fade={{ duration: 200 }} class="imageOverlay">
				<h1>{artwork.title}</h1>
			</div>
		{/if}
	</div>
	<div class="contentContainer">
		<h3 class="title">
			<Title {artwork} />
		</h3>
		{#if artwork.subTitle}
			<h3 class="subTitle"><Subtitle text={artwork.subTitle} /></h3>
		{/if}
		{#if overlayActive}
			<div transition:fade={{ duration: 200 }} class="contentOverlay">
				<h1>
					{#if artwork.sold}Sold{:else}{artwork.price}{/if}
				</h1>
			</div>
		{/if}
	</div>
</a>

<style>
	.listingContainer {
		display: flex;
		flex-direction: column;
		flex: 1;
		height: fit-content;
		height: 100%;
		width: 100%;
	}
	.listingContainer:hover {
		background-color: var(--primary-color);
		transition-duration: 0.2s;
		color: var(--white);
		cursor: pointer;
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
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		position: absolute;
	}
	.imageOverlay {
		background-color: var(--black);
		opacity: 0.8;
		width: 100%;
		height: 100%;
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.imageOverlay h1 {
		color: var(--primary-color);
		font-size: 1.6rem;
		padding: 0.8rem 1rem 1rem;
		margin: 0;
		border: 0.2rem solid var(--primary-color);
	}
	.contentContainer {
		padding: 0.6rem 0.6rem 0.8rem;
		border: 1px solid black;
		border-top: 0.01px solid transparent;
		position: relative;
		flex: 1;
	}
	.title {
		margin: 0;
		width: fit-content;
	}
	.subTitle {
		margin: 0.2rem 0 0;
	}
	.contentOverlay {
		width: 100%;
		height: 100%;
		background-color: var(--primary-color);
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		top: 0;
		left: 0;
	}

	.contentOverlay h1 {
		margin: 0;
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
