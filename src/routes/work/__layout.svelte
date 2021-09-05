<script lang="ts">
	import { page } from '$app/stores';

	import { includes } from 'lodash-es';
</script>

<div>
	<a href="/work/canvas" class:selected={includes($page.path, 'canvas')}
		>Canvas</a
	>
	<a
		href="/work/paint_on_paper"
		class:selected={includes($page.path, 'paint_on_paper')}>Paint on Paper</a
	>
	<a href="/work/stripes" class:selected={includes($page.path, 'stripes')}
		>Stripes</a
	>
	<a href="/work/pixel_sort" class:selected={includes($page.path, 'pixel_sort')}
		>Pixel Sort</a
	>
	<a href="/work/macro" class:selected={includes($page.path, 'macro')}>Macro</a>
</div>
<slot />

<style>
	div {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 2rem;
		align-items: center;
		justify-content: space-evenly;
	}
	a {
		letter-spacing: 0.1rem;
		font-size: 0.7rem;
		font-weight: bold;
		text-align: center;
		border-radius: 4px;
		padding: 0 1rem 0.1rem;
		border: 1px solid transparent;
	}
	a:hover {
		border: 0.5px solid var(--primary-color);
	}
	.selected {
		border: 1.5px solid var(--primary-color) !important;
	}

	@media (min-width: 768px) {
		div {
			width: 60%;
		}
	}
	@media (min-width: 1366px) {
		div {
			width: 40%;
		}
	}
</style>
