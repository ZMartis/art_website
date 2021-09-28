<script lang="ts">
	import { page } from '$app/stores';
	import { canvases } from '$lib/data/canvases';
	import { macros } from '$lib/data/macros';
	import { paintOnPapers } from '$lib/data/paint_on_papers';
	import { pixelSorts } from '$lib/data/pixel_sorts';
	import { stripes } from '$lib/data/stripes';
	import { find, replace, snakeCase, toLower, union } from 'lodash-es';
	import Title from '$lib/components/title/index.svelte';
	import BaseButton from '$lib/components/base/base_button.svelte';
	import BackButton from '$lib/components/back_button/index.svelte';

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

	const route = '/work/' + snakeCase(artwork.medium);
</script>

<div class="backButtonContainer">
	<BackButton {route} />
</div>
<div class="pageContent">
	<div class="container">
		<img src={image} alt={imageAlt} />
		<div class="contentContainer">
			<h1>
				<Title {artwork} />
			</h1>
			<p>{mediumDescription()} - {artwork.sold ? 'Sold' : artwork.price}</p>
			<div class="buttonContainer">
				<BaseButton disabled={artwork.sold}
					>{artwork.sold ? 'Sold' : 'Inquire'}</BaseButton
				>
			</div>
			<p>{artwork.description}</p>
		</div>
	</div>
</div>

<style>
	.backButtonContainer {
		margin-left: 0.8rem;
	}
	.pageContent {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.container {
		/* width: fit-content; */
		display: flex;
		flex-direction: column;
		padding: 5%;
	}
	img {
		max-width: 100%;
		object-fit: cover;
		box-shadow: 20px 18px 37px 1px rgba(0, 0, 0, 0.15);
	}
	.contentContainer {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		margin-top: 20px;
	}
	h1 {
		margin: 0;
		letter-spacing: 0.1rem;
	}
	p {
		margin: 0;
	}
	.buttonContainer {
		margin-top: 0.4rem;
	}
	@media (min-width: 768px) {
		/* your tablet styles go here */
		.container {
			padding: 2%;
			align-items: center;
		}
		img {
			max-height: 70vh;
			width: 100%;
			object-fit: contain;
		}
	}
	@media (min-widthe: 1366px) {
		/* your desktop styles go here */
	}
</style>
