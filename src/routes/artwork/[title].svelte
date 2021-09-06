<script lang="ts">
	import { page } from '$app/stores';
	import { canvases } from '$lib/data/canvases';
	import { macros } from '$lib/data/macros';
	import { paintOnPapers } from '$lib/data/paint_on_papers';
	import { pixelSorts } from '$lib/data/pixel_sorts';
	import { stripes } from '$lib/data/stripes';
	import { find, replace, toLower, union } from 'lodash-es';
	import Title from '$lib/components/title/index.svelte';

	const allArtwork = union(
		canvases,
		macros,
		paintOnPapers,
		pixelSorts,
		stripes
	);
	function convertRoute() {
		return replace(replace($page.params.title, '_', ' '), '+', '.');
	}
	const artwork = find(allArtwork, (artwork) => {
		return toLower(artwork.title) === toLower(convertRoute());
	});

	const image = artwork.image ? artwork.image : artwork.smallImage;
	const imageAlt = artwork.subTitle
		? artwork.title + ' (' + artwork.subTitle + ')'
		: artwork.title;

	function mediumDescription() {
		switch (artwork.medium) {
			case 'canvas':
				return 'Paint on canvas';
			case 'macro':
				return 'Macro photograph of paint';
			case 'paintOnPaper':
				return 'Paint on paper';
			case 'pixelSort':
				return 'Digitally sorted image';
			case 'stripes':
				return 'Photo manipulation on satin';
		}
	}
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
		<p>{mediumDescription()} - {artwork.sold ? 'Sold' : artwork.price}</p>
		<button disabled={artwork.sold}>{artwork.sold ? 'Sold' : 'Inquire'}</button>
		<p>{artwork.description}</p>
	</div>
</div>

<style>
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 5%;
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
