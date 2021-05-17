<script lang="ts">
	import Nav from '$lib/Nav/index.svelte';
</script>

<header>
	<img src="z_logo.svg" alt="Z Logo" />
	<a href="/"><h1>ZACH MARTIS</h1></a>

	<Nav />
</header>

<style>
	header {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	img {
		height: 2.5rem;
		margin-right: 5px;
	}
	h1 {
		margin: 0;
		font-size: 1.5rem;
		letter-spacing: 0.1rem;
		color: var(--primary-text-color);
	}
</style>
