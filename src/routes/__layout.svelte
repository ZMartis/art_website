<script lang="ts">
	import Header from '$lib/components/Header/index.svelte';
	import '../app.css';
</script>

<Header />
<main>
	<slot />
</main>

<!-- Not sure I need the footer -->

<!-- <footer /> -->
<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
