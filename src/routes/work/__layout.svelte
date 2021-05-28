<div>
	<a href="/work/canvas">Canvas</a>
	<a href="/work/paint_on_paper">Paint on Paper</a>
	<a href="/work/stripes">Stripes</a>
	<a href="/work/pixel_sort">Pixel Sort</a>
	<a href="/work/macro">Macro</a>
</div>
<slot />

<style>
	div {
		display: flex;
		flex-direction: row;
		width: 100%;
		justify-content: space-evenly;
	}
	a {
		letter-spacing: 0.1rem;
		font-size: 0.7rem;
		font-weight: bold;
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
