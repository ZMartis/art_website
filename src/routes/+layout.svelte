<script lang="ts">
	import Header from '$lib/components/header/index.svelte'
	import '../app.css'
</script>

<div>
	<Header />
	<main>
		<slot />
	</main>
</div>

<!-- Not sure I need the footer -->

<!-- <footer /> -->
<style>
	div {
		height: 100vh;
		width: 100vw;
		overflow-y: scroll;
	}
	main {
		display: flex;
		flex-direction: column;
	}
</style>
