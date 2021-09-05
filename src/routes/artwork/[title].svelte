<script lang="ts">
	import { page } from '$app/stores';
	import { canvases } from '$lib/data/canvases';
	import { capitalize, find } from 'lodash';
	import Title from '$lib/components/title/index.svelte';
	const artwork = find(canvases, ['title', capitalize($page.params.title)]);

	$: image = artwork.image ? artwork.image : artwork.smallImage;
	$: imageAlt = artwork.subTitle
		? artwork.title + ' (' + artwork.subTitle + ')'
		: artwork.title;
</script>

<div class="container">
	<div class="blankContainer section" />
	<div class="imageContainer section">
		<img src={image} alt={imageAlt} />
	</div>
	<div class="contentContainer section">
		<h1>
			<Title {artwork} />
		</h1>
		<p>{artwork.medium}</p>
		<p>{artwork.sold ? 'Sold' : artwork.price}</p>
		<p>{artwork.description}</p>
	</div>
</div>

<style>
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 0 5%;
	}
	.section {
		width: 100%;
	}
	.blankContainer {
		height: 0;
	}
	.imageContainer {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	img {
		max-width: 100%;
		object-fit: cover;
	}
	.contentContainer {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	h1 {
		margin: 0;
	}
	p {
		margin: 0;
	}

	@media (min-width: 768px) {
		/* your tablet styles go here */
	}
	@media (min-widthe: 1366px) {
		/* your desktop styles go here */
	}
</style>
