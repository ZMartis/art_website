<script lang="ts">
	import Nav from '$lib/Nav/index.svelte';
</script>

<header>
	<img src="z_logo.svg" alt="Z Logo" />
	<h1><a href="/">ZACH MARTIS</a></h1>
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
