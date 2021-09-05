<script lang="ts">
	import type { Artwork } from 'src/types/artwork';
	import { fade } from 'svelte/transition';
	import Title from '$lib/components/title/index.svelte';
	import { goto } from '$app/navigation';
	import { lowerCase } from 'lodash-es';

	export let artwork: Artwork;

	$: image = artwork.smallImage ? artwork.smallImage : artwork.image;
	$: imageAlt = artwork.subTitle
		? artwork.title + ' (' + artwork.subTitle + ')'
		: artwork.title;

	let overlayActive = false;
	function toggleOverlay() {
		overlayActive = !overlayActive;
	}

	function navigate() {
		goto(`/artwork/${lowerCase(artwork.title)}`);
	}
</script>

<div
	on:mouseenter={toggleOverlay}
	on:mouseleave={toggleOverlay}
	on:click={navigate}
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
		<h3>
			<Title {artwork} />
		</h3>
		<p>
			{#if artwork.description}{artwork.description}{:else}Haven't written a
				description for {artwork.title}. Should probably do that at some point.
				¯\_(ツ)_/¯{/if}
		</p>
		{#if overlayActive}
			<div transition:fade={{ duration: 200 }} class="contentOverlay">
				<h1>
					{#if artwork.sold}Sold{:else}{artwork.price}{/if}
				</h1>
			</div>
		{/if}
	</div>
</div>

<style>
	.listingContainer {
		width: 100%;
		height: fit-content;
	}
	.listingContainer:hover {
		background-color: var(--primary-color);
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
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		cursor: pointer;
		position: absolute;
	}
	.imageOverlay {
		background-color: var(--black);
		opacity: 0.8;
		width: 100%;
		height: 100%;
		position: absolute;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.imageOverlay h1 {
		color: var(--primary-color);
		font-size: 1.6rem;
		padding: 0.8rem 1rem 1rem;
		border: 0.2rem solid var(--primary-color);
	}
	.contentContainer {
		padding: 0 0.4rem 0.2rem;
		border: 1px solid black;
		border-top: 0.01px solid transparent;
		position: relative;
	}
	h3 {
		margin: 0.4rem 0 0;
		cursor: pointer;
		width: fit-content;
	}
	p {
		margin: 0.4rem 0 0;
		font-size: 0.7rem;
		overflow: hidden;
		display: -webkit-box;
		text-overflow: ellipsis;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
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
